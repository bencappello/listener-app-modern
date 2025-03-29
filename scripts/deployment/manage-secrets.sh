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
ACTION="list"
SECRET_NAME=""
KEY=""
VALUE=""

function show_help {
    echo "Usage: $0 -e|--environment <dev|prod> -a|--action <list|get|set|delete> [options]"
    echo
    echo "  -e, --environment   Specify environment (dev or prod)"
    echo "  -a, --action        Action to perform (list, get, set, delete)"
    echo "  -s, --secret        Secret name (required for get, set, delete)"
    echo "  -k, --key           Key name (required for get, set, delete)"
    echo "  -v, --value         Value (required for set)"
    echo "  -h, --help          Show this help message"
    echo
    echo "Examples:"
    echo "  List all secrets:        $0 -e dev -a list"
    echo "  Get all keys in secret:  $0 -e dev -a get -s listener-app-secret"
    echo "  Get specific key:        $0 -e dev -a get -s listener-app-secret -k DATABASE_URL"
    echo "  Set a secret:            $0 -e dev -a set -s listener-app-secret -k API_KEY -v 'myapikey123'"
    echo "  Delete a secret key:     $0 -e dev -a delete -s listener-app-secret -k API_KEY"
    exit 1
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -e|--environment) ENVIRONMENT="$2"; shift ;;
        -a|--action) ACTION="$2"; shift ;;
        -s|--secret) SECRET_NAME="$2"; shift ;;
        -k|--key) KEY="$2"; shift ;;
        -v|--value) VALUE="$2"; shift ;;
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

# Validate action
if [[ "$ACTION" != "list" && "$ACTION" != "get" && "$ACTION" != "set" && "$ACTION" != "delete" ]]; then
    echo -e "${RED}Invalid action. Use 'list', 'get', 'set', or 'delete'.${NC}"
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

# Check if namespace exists, if not create it
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${YELLOW}Namespace $NAMESPACE does not exist. Creating...${NC}"
    kubectl create namespace $NAMESPACE
fi

# Special warning for production
if [[ "$ENVIRONMENT" == "prod" && ("$ACTION" == "set" || "$ACTION" == "delete") ]]; then
    echo -e "${RED}WARNING: You are about to modify PRODUCTION secrets.${NC}"
    read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Operation cancelled.${NC}"
        exit 0
    fi
fi

# Perform the requested action
case $ACTION in
    list)
        echo -e "${BLUE}=== Secrets in $NAMESPACE namespace ===${NC}"
        kubectl get secrets -n $NAMESPACE
        ;;
    get)
        if [[ -z "$SECRET_NAME" ]]; then
            echo -e "${RED}Error: Secret name (-s, --secret) is required for 'get' action.${NC}"
            exit 1
        fi
        
        # Check if secret exists
        if ! kubectl get secret $SECRET_NAME -n $NAMESPACE &> /dev/null; then
            echo -e "${RED}Error: Secret '$SECRET_NAME' does not exist in namespace '$NAMESPACE'.${NC}"
            exit 1
        fi
        
        if [[ -z "$KEY" ]]; then
            echo -e "${BLUE}=== Keys in secret '$SECRET_NAME' ===${NC}"
            kubectl get secret $SECRET_NAME -n $NAMESPACE -o json | jq -r '.data | keys[]'
        else
            echo -e "${BLUE}=== Value for key '$KEY' in secret '$SECRET_NAME' ===${NC}"
            VALUE=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath="{.data.$KEY}" 2>/dev/null)
            if [[ -z "$VALUE" ]]; then
                echo -e "${RED}Error: Key '$KEY' does not exist in secret '$SECRET_NAME'.${NC}"
                exit 1
            fi
            echo $VALUE | base64 --decode
        fi
        ;;
    set)
        if [[ -z "$SECRET_NAME" ]]; then
            echo -e "${RED}Error: Secret name (-s, --secret) is required for 'set' action.${NC}"
            exit 1
        fi
        
        if [[ -z "$KEY" ]]; then
            echo -e "${RED}Error: Key name (-k, --key) is required for 'set' action.${NC}"
            exit 1
        fi
        
        if [[ -z "$VALUE" ]]; then
            echo -e "${RED}Error: Value (-v, --value) is required for 'set' action.${NC}"
            exit 1
        fi
        
        # Check if secret exists
        if kubectl get secret $SECRET_NAME -n $NAMESPACE &> /dev/null; then
            echo -e "${YELLOW}Secret '$SECRET_NAME' exists. Updating key '$KEY'...${NC}"
            VALUE_B64=$(echo -n "$VALUE" | base64 -w 0)
            kubectl patch secret $SECRET_NAME -n $NAMESPACE -p="{\"data\":{\"$KEY\":\"$VALUE_B64\"}}"
        else
            echo -e "${YELLOW}Secret '$SECRET_NAME' does not exist. Creating with key '$KEY'...${NC}"
            VALUE_B64=$(echo -n "$VALUE" | base64 -w 0)
            kubectl create secret generic $SECRET_NAME -n $NAMESPACE --from-literal=$KEY="$VALUE"
        fi
        
        echo -e "${GREEN}Successfully set key '$KEY' in secret '$SECRET_NAME'.${NC}"
        ;;
    delete)
        if [[ -z "$SECRET_NAME" ]]; then
            echo -e "${RED}Error: Secret name (-s, --secret) is required for 'delete' action.${NC}"
            exit 1
        fi
        
        if [[ -z "$KEY" ]]; then
            echo -e "${RED}Error: Key name (-k, --key) is required for 'delete' action.${NC}"
            exit 1
        fi
        
        # Check if secret exists
        if ! kubectl get secret $SECRET_NAME -n $NAMESPACE &> /dev/null; then
            echo -e "${RED}Error: Secret '$SECRET_NAME' does not exist in namespace '$NAMESPACE'.${NC}"
            exit 1
        fi
        
        # Check if key exists
        VALUE=$(kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath="{.data.$KEY}" 2>/dev/null)
        if [[ -z "$VALUE" ]]; then
            echo -e "${RED}Error: Key '$KEY' does not exist in secret '$SECRET_NAME'.${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}Removing key '$KEY' from secret '$SECRET_NAME'...${NC}"
        kubectl get secret $SECRET_NAME -n $NAMESPACE -o json | \
            jq --arg KEY "$KEY" 'del(.data[$KEY])' | \
            kubectl replace -f -
        
        echo -e "${GREEN}Successfully removed key '$KEY' from secret '$SECRET_NAME'.${NC}"
        ;;
esac 