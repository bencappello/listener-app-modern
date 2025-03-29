#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
COMPONENT="backend"
REPLICAS=2

function show_help {
    echo "Usage: $0 -e|--environment <dev|prod> -c|--component <backend|frontend|scraper> -r|--replicas <number>"
    echo "  -e, --environment   Specify environment (dev or prod)"
    echo "  -c, --component     Component to scale (backend, frontend, or scraper)"
    echo "  -r, --replicas      Number of replicas to scale to"
    echo "  -h, --help          Show this help message"
    exit 1
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -e|--environment) ENVIRONMENT="$2"; shift ;;
        -c|--component) COMPONENT="$2"; shift ;;
        -r|--replicas) REPLICAS="$2"; shift ;;
        -h|--help) show_help ;;
        *) echo "Unknown parameter: $1"; show_help ;;
    esac
    shift
done

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
    echo -e "${RED}Invalid environment. Use 'dev' or 'prod'.${NC}"
    exit 1
fi

# Validate component
if [[ "$COMPONENT" != "backend" && "$COMPONENT" != "frontend" && "$COMPONENT" != "scraper" ]]; then
    echo -e "${RED}Invalid component. Use 'backend', 'frontend', or 'scraper'.${NC}"
    exit 1
fi

# Validate replicas
if ! [[ "$REPLICAS" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}Invalid replicas. Must be a positive integer.${NC}"
    exit 1
fi

# Set namespace based on environment
if [[ "$ENVIRONMENT" == "dev" ]]; then
    NAMESPACE="listener-app-dev"
else
    NAMESPACE="listener-app-prod"
fi

# Check for kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

# Update kubeconfig
echo -e "${YELLOW}Updating kubeconfig...${NC}"
if [[ "$ENVIRONMENT" == "dev" ]]; then
    aws eks update-kubeconfig --name listener-app-dev --region us-west-2
else
    aws eks update-kubeconfig --name listener-app-prod --region us-west-2
fi

# Get current replicas
CURRENT_REPLICAS=$(kubectl get deployment $COMPONENT -n $NAMESPACE -o jsonpath='{.spec.replicas}')
echo -e "${BLUE}Current replicas for $COMPONENT in $ENVIRONMENT: ${GREEN}$CURRENT_REPLICAS${NC}"

# Special warning for production scaling
if [[ "$ENVIRONMENT" == "prod" ]]; then
    echo -e "${RED}WARNING: You are about to scale a PRODUCTION component.${NC}"
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Scaling cancelled.${NC}"
        exit 0
    fi
fi

# Scale the deployment
echo -e "${YELLOW}Scaling $COMPONENT in $ENVIRONMENT to $REPLICAS replicas...${NC}"
kubectl scale deployment $COMPONENT --replicas=$REPLICAS -n $NAMESPACE

# Wait for deployment to be ready
echo -e "${YELLOW}Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/$COMPONENT -n $NAMESPACE

# Verify the new replicas
NEW_REPLICAS=$(kubectl get deployment $COMPONENT -n $NAMESPACE -o jsonpath='{.spec.replicas}')
echo -e "${GREEN}Successfully scaled $COMPONENT in $ENVIRONMENT from $CURRENT_REPLICAS to $NEW_REPLICAS replicas.${NC}"

# Show current status
echo -e "\n${BLUE}=== Current Deployment Status ===${NC}"
kubectl get deployment $COMPONENT -n $NAMESPACE

# Show resource usage
echo -e "\n${BLUE}=== Resource Usage ===${NC}"
kubectl top pods -n $NAMESPACE -l app=$COMPONENT 