#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting production deployment for Listener App...${NC}"

# Check for AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install AWS CLI first.${NC}"
    exit 1
fi

# Check for kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

# Load environment variables from .env.production
if [ -f ".env.production" ]; then
    echo -e "${GREEN}Loading environment variables from .env.production...${NC}"
    export $(grep -v '^#' .env.production | xargs)
else
    echo -e "${RED}.env.production file not found!${NC}"
    exit 1
fi

# Check required environment variables
required_vars=("POSTGRES_USER" "POSTGRES_PASSWORD" "REDIS_PASSWORD" "SECRET_KEY" "JWT_SECRET" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY")
missing_vars=0

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Required environment variable $var is not set.${NC}"
        missing_vars=1
    fi
done

if [ $missing_vars -eq 1 ]; then
    echo -e "${RED}Please set all required environment variables in .env.production or export them before running this script.${NC}"
    exit 1
fi

# Production deployment confirmation
echo -e "${RED}WARNING: You are about to deploy to PRODUCTION environment.${NC}"
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

# Extra confirmation for production
read -p "Please type 'production' to confirm: " confirmation
if [ "$confirmation" != "production" ]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

# Update kubeconfig
echo -e "${YELLOW}Updating kubeconfig...${NC}"
aws eks update-kubeconfig --name listener-app-prod --region us-west-2

# Set the correct registry and image name
export REGISTRY="ghcr.io"
export BACKEND_IMAGE_NAME="$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/\.git$//')/backend"
export FRONTEND_IMAGE_NAME="$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/\.git$//')/frontend"
export SCRAPER_IMAGE_NAME="$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/\.git$//')/scraper"

# Process the Kubernetes manifests with environment variable substitution
echo -e "${YELLOW}Processing Kubernetes manifests...${NC}"
mkdir -p k8s/prod/processed

# Process each manifest file
for file in k8s/prod/*.yaml; do
    filename=$(basename "$file")
    echo -e "${GREEN}Processing $filename...${NC}"
    envsubst < "$file" > "k8s/prod/processed/$filename"
done

# Apply the Kubernetes manifests
echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"
kubectl apply -f k8s/prod/processed/namespace.yaml
kubectl apply -f k8s/prod/processed/configmap.yaml
kubectl apply -f k8s/prod/processed/secret.yaml
kubectl apply -f k8s/prod/processed/backend-deployment.yaml
kubectl apply -f k8s/prod/processed/frontend-deployment.yaml
kubectl apply -f k8s/prod/processed/scraper-deployment.yaml
kubectl apply -f k8s/prod/processed/ingress.yaml

# Clean up processed files with sensitive information
echo -e "${YELLOW}Cleaning up processed files with sensitive information...${NC}"
rm -rf k8s/prod/processed

# Wait for deployments to be ready
echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"
kubectl rollout status deployment/backend -n listener-app-prod
kubectl rollout status deployment/frontend -n listener-app-prod
kubectl rollout status deployment/scraper -n listener-app-prod

echo -e "${GREEN}Production deployment completed successfully!${NC}"
echo -e "${GREEN}You can access the application at: https://listener-app.example.com${NC}"
echo -e "${GREEN}API endpoint: https://api.listener-app.example.com${NC}" 