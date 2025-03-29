#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Make scripts executable if they aren't already
chmod +x "$SCRIPT_DIR"/*.sh

function show_header {
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${BLUE}         Listener App Deployment Tool           ${NC}"
    echo -e "${BLUE}=================================================${NC}"
    echo
}

function show_help {
    show_header
    echo -e "Usage: $0 [command] [options]"
    echo
    echo -e "${GREEN}Available commands:${NC}"
    echo -e "  ${YELLOW}setup${NC}      - Set up environment configuration for deployment"
    echo -e "  ${YELLOW}deploy${NC}     - Deploy the application to specified environment"
    echo -e "  ${YELLOW}status${NC}     - Check the status of deployed applications"
    echo -e "  ${YELLOW}scale${NC}      - Scale application components"
    echo -e "  ${YELLOW}rollback${NC}   - Roll back a deployment"
    echo -e "  ${YELLOW}secrets${NC}    - Manage Kubernetes secrets"
    echo -e "  ${YELLOW}help${NC}       - Show this help message"
    echo
    echo -e "${GREEN}Examples:${NC}"
    echo -e "  $0 setup -e dev                          - Set up development environment"
    echo -e "  $0 deploy -e dev                         - Deploy to development environment"
    echo -e "  $0 status -e prod                        - Check status of production deployment"
    echo -e "  $0 scale -e dev -c frontend -r 3         - Scale frontend to 3 replicas in dev"
    echo -e "  $0 rollback -e prod -c backend -r 2      - Roll back backend to revision 2 in prod"
    echo -e "  $0 secrets -e dev -a list                - List all secrets in dev environment"
    echo
    echo -e "${GREEN}For more detailed help on a specific command, run:${NC}"
    echo -e "  $0 [command] --help"
    exit 1
}

# No arguments, show help
if [[ $# -eq 0 ]]; then
    show_help
fi

# Parse command
COMMAND=$1
shift

case $COMMAND in
    setup)
        "$SCRIPT_DIR/setup-environment.sh" "$@"
        ;;
    deploy)
        # Check environment parameter
        if [[ "$1" == "-e" || "$1" == "--environment" ]]; then
            ENV=$2
            if [[ "$ENV" == "dev" ]]; then
                "$SCRIPT_DIR/deploy-dev.sh"
            elif [[ "$ENV" == "prod" ]]; then
                "$SCRIPT_DIR/deploy-prod.sh"
            else
                echo -e "${RED}Invalid environment. Use 'dev' or 'prod'.${NC}"
                exit 1
            fi
        else
            "$SCRIPT_DIR/deploy-dev.sh" "$@"
        fi
        ;;
    status)
        "$SCRIPT_DIR/check-status.sh" "$@"
        ;;
    scale)
        "$SCRIPT_DIR/scale.sh" "$@"
        ;;
    rollback)
        "$SCRIPT_DIR/rollback.sh" "$@"
        ;;
    secrets)
        "$SCRIPT_DIR/manage-secrets.sh" "$@"
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        show_help
        ;;
esac 