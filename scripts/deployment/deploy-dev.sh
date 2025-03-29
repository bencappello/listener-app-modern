#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting development deployment for Listener App...${NC}"

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

# Load environment variables from .env.development
if [ -f ".env.development" ]; then
    echo -e "${GREEN}Loading environment variables from .env.development...${NC}"
    export $(grep -v '^#' .env.development | xargs)
else
    echo -e "${RED}.env.development file not found!${NC}"
    exit 1
fi

# Update kubeconfig
echo -e "${YELLOW}Updating kubeconfig...${NC}"
aws eks update-kubeconfig --name listener-app-dev --region us-west-2

# Set the correct registry and image name
export REGISTRY="ghcr.io"
export BACKEND_IMAGE_NAME="$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/\.git$//')/backend"
export FRONTEND_IMAGE_NAME="$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/\.git$//')/frontend"
export SCRAPER_IMAGE_NAME="$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/\.git$//')/scraper"

# Process the Kubernetes manifests with environment variable substitution
echo -e "${YELLOW}Processing Kubernetes manifests...${NC}"
mkdir -p k8s/dev/processed

# Process each manifest file
for file in k8s/dev/*.yaml; do
    filename=$(basename "$file")
    echo -e "${GREEN}Processing $filename...${NC}"
    envsubst < "$file" > "k8s/dev/processed/$filename"
done

# Apply the Kubernetes manifests
echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"
kubectl apply -f k8s/dev/processed/namespace.yaml
kubectl apply -f k8s/dev/processed/configmap.yaml
kubectl apply -f k8s/dev/processed/secret.yaml
kubectl apply -f k8s/dev/processed/backend-deployment.yaml
kubectl apply -f k8s/dev/processed/frontend-deployment.yaml
kubectl apply -f k8s/dev/processed/scraper-deployment.yaml
kubectl apply -f k8s/dev/processed/ingress.yaml

# Clean up processed files
echo -e "${YELLOW}Cleaning up processed files...${NC}"
rm -rf k8s/dev/processed

# Wait for deployments to be ready
echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"
kubectl rollout status deployment/backend -n listener-app-dev
kubectl rollout status deployment/frontend -n listener-app-dev
kubectl rollout status deployment/scraper -n listener-app-dev

echo -e "${GREEN}Development deployment completed successfully!${NC}"
echo -e "${GREEN}You can access the application at: https://dev.listener-app.example.com${NC}"
echo -e "${GREEN}API endpoint: https://dev-api.listener-app.example.com${NC}" 