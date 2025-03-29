#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
COMPONENT="all"
TAG="latest"
PUSH=false

function show_help {
    echo "Usage: $0 [-c|--component <all|backend|frontend|scraper>] [-t|--tag <tag>] [-p|--push]"
    echo "  -c, --component   Component to build (all, backend, frontend, or scraper)"
    echo "  -t, --tag         Docker image tag (default: latest)"
    echo "  -p, --push        Push images to registry after building"
    echo "  -h, --help        Show this help message"
    exit 1
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -c|--component) COMPONENT="$2"; shift ;;
        -t|--tag) TAG="$2"; shift ;;
        -p|--push) PUSH=true ;;
        -h|--help) show_help ;;
        *) echo "Unknown parameter: $1"; show_help ;;
    esac
    shift
done

# Validate component
if [[ "$COMPONENT" != "all" && "$COMPONENT" != "backend" && "$COMPONENT" != "frontend" && "$COMPONENT" != "scraper" ]]; then
    echo -e "${RED}Invalid component. Use 'all', 'backend', 'frontend', or 'scraper'.${NC}"
    exit 1
fi

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Get the Git commit hash for versioning
GIT_COMMIT=$(git rev-parse --short HEAD)

# Set the Docker registry from environment or default
DOCKER_REGISTRY=""
if [ -f ".env.development" ]; then
    DOCKER_REGISTRY=$(grep DOCKER_REGISTRY .env.development | cut -d '=' -f2)
fi

if [ -z "$DOCKER_REGISTRY" ]; then
    # Try to get from git remote URL
    GITHUB_REPO=$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/\.git$//')
    if [ -n "$GITHUB_REPO" ]; then
        DOCKER_REGISTRY="ghcr.io/$GITHUB_REPO"
    else
        echo -e "${YELLOW}Docker registry not configured. Using local registry.${NC}"
        DOCKER_REGISTRY="listener-app"
    fi
fi

# Build function
build_image() {
    local component=$1
    local dockerfile=$2
    local context=$3
    local image_name="$DOCKER_REGISTRY/${component}:${TAG}"
    local image_latest="$DOCKER_REGISTRY/${component}:latest"
    
    echo -e "${BLUE}=== Building ${component} image ===${NC}"
    echo -e "${YELLOW}Image: ${image_name}${NC}"
    
    # Build the image
    docker build -f $dockerfile -t $image_name -t $image_latest \
        --build-arg GIT_COMMIT=$GIT_COMMIT \
        --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
        $context
    
    echo -e "${GREEN}Successfully built ${component} image: ${image_name}${NC}"
    
    # Push if requested
    if [ "$PUSH" = true ]; then
        echo -e "${YELLOW}Pushing ${component} image to registry...${NC}"
        docker push $image_name
        docker push $image_latest
        echo -e "${GREEN}Successfully pushed ${component} image to registry.${NC}"
    fi
}

# Main build process
echo -e "${BLUE}=== Building Docker images for Listener App ===${NC}"
echo -e "${YELLOW}Component: ${COMPONENT}${NC}"
echo -e "${YELLOW}Tag: ${TAG}${NC}"
echo -e "${YELLOW}Push: ${PUSH}${NC}"
echo -e "${YELLOW}Registry: ${DOCKER_REGISTRY}${NC}"

if [[ "$COMPONENT" == "all" || "$COMPONENT" == "backend" ]]; then
    build_image "backend" "backend/Dockerfile" "backend"
fi

if [[ "$COMPONENT" == "all" || "$COMPONENT" == "frontend" ]]; then
    build_image "frontend" "frontend/Dockerfile" "frontend"
fi

if [[ "$COMPONENT" == "all" || "$COMPONENT" == "scraper" ]]; then
    build_image "scraper" "scraper/Dockerfile" "scraper"
fi

echo -e "${GREEN}=== All requested images built successfully ===${NC}"

# Display instructions for manual deployment
echo -e "${BLUE}=== Next Steps ===${NC}"
if [ "$PUSH" = true ]; then
    echo -e "1. Deploy the images using: ./scripts/deployment/run.sh deploy -e <dev|prod>"
else
    echo -e "1. Push the images to registry: $0 -c $COMPONENT -t $TAG -p"
    echo -e "2. Deploy the images using: ./scripts/deployment/run.sh deploy -e <dev|prod>"
fi 