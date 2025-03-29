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

function show_help {
    echo "Usage: $0 -e|--environment <dev|prod>"
    echo "  -e, --environment   Specify environment to set up (dev or prod)"
    echo "  -h, --help          Show this help message"
    exit 1
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -e|--environment) ENVIRONMENT="$2"; shift ;;
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

# Set namespace based on environment
if [[ "$ENVIRONMENT" == "dev" ]]; then
    NAMESPACE="listener-app-dev"
    ENV_FILE=".env.development"
    CLUSTER_NAME="listener-app-dev"
else
    NAMESPACE="listener-app-prod"
    ENV_FILE=".env.production"
    CLUSTER_NAME="listener-app-prod"
fi

# Check for required tools
echo -e "${BLUE}=== Checking for required tools ===${NC}"
MISSING_TOOLS=0

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
    MISSING_TOOLS=1
fi

if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install AWS CLI first.${NC}"
    MISSING_TOOLS=1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}jq is not installed. Please install jq first.${NC}"
    MISSING_TOOLS=1
fi

if [[ $MISSING_TOOLS -eq 1 ]]; then
    echo -e "${RED}Please install the missing tools and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}All required tools are installed.${NC}"

# Check for AWS credentials
echo -e "${BLUE}=== Checking AWS credentials ===${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi
echo -e "${GREEN}AWS credentials verified.${NC}"

# Set up environment-specific config
echo -e "${BLUE}=== Setting up $ENVIRONMENT environment ===${NC}"

# Check if the environment file exists
if [[ ! -f $ENV_FILE ]]; then
    echo -e "${YELLOW}Environment file $ENV_FILE not found. Creating a template...${NC}"
    
    # Create the environment file with default values based on environment
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        cat > $ENV_FILE << EOF
# Database configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=listener_dev
POSTGRES_USER=devuser
POSTGRES_PASSWORD=changeme

# Redis configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=changeme

# Application configuration
SECRET_KEY=dev_secret_key_change_me
JWT_SECRET=dev_jwt_secret_change_me
DEBUG=true
LOG_LEVEL=debug

# API URLs
BACKEND_URL=http://api.listener-app.dev
FRONTEND_URL=http://listener-app.dev

# AWS configuration
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=listener-app-dev

# Docker registry
DOCKER_REGISTRY=ghcr.io/yourusername/listener-app
EOF
    else
        cat > $ENV_FILE << EOF
# Database configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=listener_prod
POSTGRES_USER=produser
POSTGRES_PASSWORD=

# Redis configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Application configuration
SECRET_KEY=
JWT_SECRET=
DEBUG=false
LOG_LEVEL=info

# API URLs
BACKEND_URL=https://api.listener-app.com
FRONTEND_URL=https://listener-app.com

# AWS configuration
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=listener-app-prod

# Docker registry
DOCKER_REGISTRY=ghcr.io/yourusername/listener-app
EOF
    fi
    
    echo -e "${YELLOW}Please edit $ENV_FILE to set your actual values before deploying.${NC}"
else
    echo -e "${GREEN}Found existing environment file $ENV_FILE.${NC}"
fi

# Check if the cluster exists
echo -e "${BLUE}=== Checking for Kubernetes cluster ===${NC}"
if ! aws eks describe-cluster --name $CLUSTER_NAME --region us-west-2 &> /dev/null; then
    echo -e "${YELLOW}EKS cluster '$CLUSTER_NAME' does not exist. Would you like to create it? (y/N)${NC}"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Creating EKS cluster is a complex operation that requires additional configuration.${NC}"
        echo -e "${YELLOW}Please refer to the AWS documentation or use eksctl to create a cluster:${NC}"
        echo -e "${BLUE}https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html${NC}"
        echo -e "${BLUE}https://eksctl.io/usage/creating-and-managing-clusters/${NC}"
        exit 1
    else
        echo -e "${YELLOW}Cluster creation skipped. Please create the cluster manually before deploying.${NC}"
    fi
else
    echo -e "${GREEN}EKS cluster '$CLUSTER_NAME' exists.${NC}"
    echo -e "${YELLOW}Updating kubeconfig...${NC}"
    aws eks update-kubeconfig --name $CLUSTER_NAME --region us-west-2
    echo -e "${GREEN}Kubeconfig updated.${NC}"
fi

# Create the namespace if it doesn't exist
echo -e "${BLUE}=== Setting up Kubernetes namespace ===${NC}"
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${YELLOW}Namespace '$NAMESPACE' does not exist. Creating...${NC}"
    kubectl create namespace $NAMESPACE
    echo -e "${GREEN}Namespace '$NAMESPACE' created.${NC}"
else
    echo -e "${GREEN}Namespace '$NAMESPACE' exists.${NC}"
fi

# Create directories for processed manifests
echo -e "${BLUE}=== Setting up manifest directories ===${NC}"
PROCESSED_DIR="k8s/$ENVIRONMENT/processed"
if [[ ! -d $PROCESSED_DIR ]]; then
    echo -e "${YELLOW}Creating directory for processed manifests: $PROCESSED_DIR${NC}"
    mkdir -p $PROCESSED_DIR
else
    echo -e "${GREEN}Processed manifest directory exists: $PROCESSED_DIR${NC}"
fi

# Check for Docker registry access
echo -e "${BLUE}=== Checking Docker registry configuration ===${NC}"
DOCKER_REGISTRY=$(grep DOCKER_REGISTRY $ENV_FILE | cut -d '=' -f2)
if [[ -z $DOCKER_REGISTRY ]]; then
    echo -e "${YELLOW}Docker registry is not configured in $ENV_FILE.${NC}"
    echo -e "${YELLOW}Please set the DOCKER_REGISTRY variable before deploying.${NC}"
else
    echo -e "${GREEN}Docker registry is configured: $DOCKER_REGISTRY${NC}"
fi

# Set up configmap and secret from env file if it exists and has content
echo -e "${BLUE}=== Setting up ConfigMap and Secret ===${NC}"
if [[ -f $ENV_FILE && -s $ENV_FILE ]]; then
    echo -e "${YELLOW}Do you want to create/update ConfigMap and Secret from $ENV_FILE? (y/N)${NC}"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Warn about production secrets
        if [[ "$ENVIRONMENT" == "prod" ]]; then
            echo -e "${RED}WARNING: You are about to create/update PRODUCTION secrets.${NC}"
            read -p "Are you sure you want to proceed? Type 'production' to confirm: " confirm
            if [[ "$confirm" != "production" ]]; then
                echo -e "${YELLOW}Operation cancelled.${NC}"
                exit 0
            fi
        fi
        
        # Create temporary files for ConfigMap and Secret
        CONFIG_MAP_FILE=$(mktemp)
        SECRET_FILE=$(mktemp)
        
        # Start the files with the YAML header
        cat > $CONFIG_MAP_FILE << EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: listener-app-config
  namespace: $NAMESPACE
data:
EOF

        cat > $SECRET_FILE << EOF
apiVersion: v1
kind: Secret
metadata:
  name: listener-app-secret
  namespace: $NAMESPACE
type: Opaque
data:
EOF

        # Parse the env file and add to either ConfigMap or Secret
        while IFS= read -r line || [[ -n "$line" ]]; do
            # Skip comments and empty lines
            [[ $line =~ ^#.*$ || -z $line ]] && continue
            
            # Extract key and value
            key=$(echo $line | cut -d '=' -f1)
            value=$(echo $line | cut -d '=' -f2-)
            
            # Skip lines without a value
            [[ -z $value ]] && continue
            
            # Determine if this is a secret based on key name
            if [[ $key == *"PASSWORD"* || $key == *"SECRET"* || $key == *"KEY"* ]]; then
                # Add to Secret file with base64 encoding
                echo "  $key: $(echo -n $value | base64 -w 0)" >> $SECRET_FILE
            else
                # Add to ConfigMap file
                # Escape any special characters for YAML
                escaped_value=$(echo "$value" | sed 's/"/\\"/g')
                echo "  $key: \"$escaped_value\"" >> $CONFIG_MAP_FILE
            fi
        done < $ENV_FILE
        
        # Apply the ConfigMap and Secret to Kubernetes
        echo -e "${YELLOW}Applying ConfigMap...${NC}"
        kubectl apply -f $CONFIG_MAP_FILE
        
        echo -e "${YELLOW}Applying Secret...${NC}"
        kubectl apply -f $SECRET_FILE
        
        # Clean up temporary files
        rm $CONFIG_MAP_FILE
        rm $SECRET_FILE
        
        echo -e "${GREEN}ConfigMap and Secret created/updated successfully.${NC}"
    fi
fi

echo -e "${GREEN}Environment setup complete for $ENVIRONMENT!${NC}"
echo -e "${BLUE}=== Next Steps ===${NC}"
echo -e "1. Make sure your environment file ($ENV_FILE) is properly configured."
echo -e "2. Run the deployment script: ./scripts/deployment/deploy-$ENVIRONMENT.sh"
echo -e "3. Check deployment status: ./scripts/deployment/check-status.sh -e $ENVIRONMENT" 