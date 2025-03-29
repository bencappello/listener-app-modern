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
REVISION=""

function show_help {
    echo "Usage: $0 -e|--environment <dev|prod> -c|--component <backend|frontend|scraper> [-r|--revision <revision number>]"
    echo "  -e, --environment   Specify environment (dev or prod)"
    echo "  -c, --component     Component to rollback (backend, frontend, or scraper)"
    echo "  -r, --revision      Optional: Specific revision to rollback to (defaults to previous revision)"
    echo "  -h, --help          Show this help message"
    exit 1
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -e|--environment) ENVIRONMENT="$2"; shift ;;
        -c|--component) COMPONENT="$2"; shift ;;
        -r|--revision) REVISION="$2"; shift ;;
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

# Get rollout history
echo -e "${BLUE}Deployment history for $COMPONENT in $ENVIRONMENT:${NC}"
kubectl rollout history deployment/$COMPONENT -n $NAMESPACE

# Special warning for production rollback
if [[ "$ENVIRONMENT" == "prod" ]]; then
    echo -e "${RED}WARNING: You are about to rollback a PRODUCTION component.${NC}"
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Rollback cancelled.${NC}"
        exit 0
    fi
fi

# Perform the rollback
if [[ -z "$REVISION" ]]; then
    echo -e "${YELLOW}Rolling back $COMPONENT in $ENVIRONMENT to previous revision...${NC}"
    kubectl rollout undo deployment/$COMPONENT -n $NAMESPACE
else
    echo -e "${YELLOW}Rolling back $COMPONENT in $ENVIRONMENT to revision $REVISION...${NC}"
    kubectl rollout undo deployment/$COMPONENT --to-revision=$REVISION -n $NAMESPACE
fi

# Wait for deployment to be ready
echo -e "${YELLOW}Waiting for rollback to complete...${NC}"
kubectl rollout status deployment/$COMPONENT -n $NAMESPACE

# Show current status
echo -e "\n${GREEN}Rollback complete for $COMPONENT in $ENVIRONMENT.${NC}"
echo -e "\n${BLUE}=== Current Deployment Status ===${NC}"
kubectl get deployment $COMPONENT -n $NAMESPACE

# Show updated rollout history
echo -e "\n${BLUE}=== Updated Deployment History ===${NC}"
kubectl rollout history deployment/$COMPONENT -n $NAMESPACE

# Show the pods
echo -e "\n${BLUE}=== Pods Status ===${NC}"
kubectl get pods -n $NAMESPACE -l app=$COMPONENT

# Show logs
echo -e "\n${BLUE}=== Latest Pod Logs (last 20 lines) ===${NC}"
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=$COMPONENT -o jsonpath='{.items[0].metadata.name}')
kubectl logs $POD_NAME -n $NAMESPACE --tail=20 