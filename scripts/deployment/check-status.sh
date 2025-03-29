#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment is development
ENVIRONMENT="dev"

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -e|--environment) ENVIRONMENT="$2"; shift ;;
        -h|--help)
            echo "Usage: $0 [-e|--environment <dev|prod>] [-h|--help]"
            echo "  -e, --environment   Specify environment (dev or prod)"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
    echo -e "${RED}Invalid environment. Use 'dev' or 'prod'.${NC}"
    exit 1
fi

# Set namespace based on environment
if [[ "$ENVIRONMENT" == "dev" ]]; then
    NAMESPACE="listener-app-dev"
    echo -e "${YELLOW}Checking status of development environment...${NC}"
else
    NAMESPACE="listener-app-prod"
    echo -e "${YELLOW}Checking status of production environment...${NC}"
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

# Check namespace
echo -e "\n${BLUE}=== Namespace Status ===${NC}"
kubectl get namespace $NAMESPACE

# Check pods
echo -e "\n${BLUE}=== Pod Status ===${NC}"
kubectl get pods -n $NAMESPACE

# Check deployments
echo -e "\n${BLUE}=== Deployment Status ===${NC}"
kubectl get deployments -n $NAMESPACE

# Check services
echo -e "\n${BLUE}=== Service Status ===${NC}"
kubectl get services -n $NAMESPACE

# Check ingress
echo -e "\n${BLUE}=== Ingress Status ===${NC}"
kubectl get ingress -n $NAMESPACE

# Check CronJob
echo -e "\n${BLUE}=== CronJob Status ===${NC}"
kubectl get cronjobs -n $NAMESPACE

# Resource usage
echo -e "\n${BLUE}=== Resource Usage ===${NC}"
kubectl top pods -n $NAMESPACE

# Show application URLs
echo -e "\n${GREEN}=== Application URLs ===${NC}"
if [[ "$ENVIRONMENT" == "dev" ]]; then
    echo -e "Frontend: ${GREEN}https://dev.listener-app.example.com${NC}"
    echo -e "API: ${GREEN}https://dev-api.listener-app.example.com${NC}"
else
    echo -e "Frontend: ${GREEN}https://listener-app.example.com${NC}"
    echo -e "API: ${GREEN}https://api.listener-app.example.com${NC}"
fi

# Check application health
echo -e "\n${BLUE}=== Health Check ===${NC}"
if [[ "$ENVIRONMENT" == "dev" ]]; then
    API_URL="https://dev-api.listener-app.example.com/api/health"
else
    API_URL="https://api.listener-app.example.com/api/health"
fi

echo -e "Checking API health at: $API_URL"
if command -v curl &> /dev/null; then
    if curl -s --max-time 5 "$API_URL" > /dev/null; then
        echo -e "${GREEN}API is healthy!${NC}"
    else
        echo -e "${RED}API health check failed!${NC}"
    fi
else
    echo -e "${YELLOW}curl not found, skipping health check.${NC}"
fi 