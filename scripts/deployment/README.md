# Listener App Deployment Scripts

This directory contains automation scripts for deploying the Listener App to both development and production environments using Kubernetes.

## Overview

The deployment automation consists of several scripts designed to handle different aspects of the deployment process:

- **run.sh**: Main entry point for all deployment operations
- **setup-environment.sh**: Set up environment configuration
- **build-images.sh**: Build Docker images for application components
- **deploy-dev.sh**: Deploy to development environment
- **deploy-prod.sh**: Deploy to production environment
- **check-status.sh**: Check status of deployments
- **scale.sh**: Scale application components
- **rollback.sh**: Roll back deployments
- **manage-secrets.sh**: Manage Kubernetes secrets

## Complete Deployment Workflow

### Initial Setup

1. **Set up the environment**:
   ```bash
   ./run.sh setup -e dev
   ```
   
   This will:
   - Check for required tools (kubectl, aws, jq)
   - Create a template .env file if it doesn't exist
   - Verify AWS credentials
   - Check for Kubernetes cluster 
   - Set up Kubernetes namespace
   - Create ConfigMap and Secret from environment variables

2. **Edit environment variables**:
   Open the generated `.env.development` or `.env.production` file and update the values for your environment.

### Building and Deploying

3. **Build Docker images**:
   ```bash
   ./run.sh build -c all -t v1.0.0 -p
   ```
   
   This will:
   - Build Docker images for all components (backend, frontend, scraper)
   - Tag images with specified version and 'latest'
   - Push images to the configured Docker registry

4. **Deploy the application**:
   ```bash
   ./run.sh deploy -e dev
   ```
   
   This will:
   - Load environment variables
   - Update kubeconfig for Kubernetes cluster
   - Process Kubernetes manifests with environment variables
   - Apply all Kubernetes resources (namespace, configmap, secret, deployments, ingress)
   - Wait for deployments to be ready

### Monitoring and Management

5. **Check deployment status**:
   ```bash
   ./run.sh status -e dev
   ```
   
   This will show:
   - Namespace status
   - Pod status
   - Deployment status
   - Service status
   - Ingress status
   - Resource usage
   - Application health

6. **Scale components as needed**:
   ```bash
   ./run.sh scale -e dev -c backend -r 3
   ```
   
   This will:
   - Scale the specified component to the desired number of replicas
   - Wait for deployment to be ready
   - Show deployment status and resource usage

7. **Roll back if issues occur**:
   ```bash
   ./run.sh rollback -e dev -c backend
   ```
   
   This will:
   - Display deployment history
   - Roll back to previous revision (or specified revision)
   - Wait for rollback to complete
   - Show updated status and logs

8. **Manage secrets**:
   ```bash
   ./run.sh secrets -e dev -a list
   ```
   
   This allows you to:
   - List all secrets
   - Get values from secrets
   - Set new secret values
   - Delete secret keys

## Script Parameters

### run.sh
```
./run.sh [command] [options]
```

### setup-environment.sh
```
./setup-environment.sh -e|--environment <dev|prod>
```

### build-images.sh
```
./build-images.sh [-c|--component <all|backend|frontend|scraper>] [-t|--tag <tag>] [-p|--push]
```

### check-status.sh
```
./check-status.sh [-e|--environment <dev|prod>]
```

### scale.sh
```
./scale.sh -e|--environment <dev|prod> -c|--component <backend|frontend|scraper> -r|--replicas <number>
```

### rollback.sh
```
./rollback.sh -e|--environment <dev|prod> -c|--component <backend|frontend|scraper> [-r|--revision <revision number>]
```

### manage-secrets.sh
```
./manage-secrets.sh -e|--environment <dev|prod> -a|--action <list|get|set|delete> [options]
```

## Security Considerations

- All scripts have additional safety checks for production environment
- Sensitive operations require explicit confirmation
- Secret values are properly managed and never logged
- Processed manifest files with sensitive data are cleaned up after deployment

## Requirements

- Docker
- kubectl
- AWS CLI
- jq (for managing secrets)
- envsubst (for template processing) 