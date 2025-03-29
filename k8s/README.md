# Kubernetes Deployment for Listener App

This directory contains Kubernetes manifests for deploying the Listener App to different environments.

## Directory Structure

- `dev/`: Kubernetes manifests for the development environment
- `prod/`: Kubernetes manifests for the production environment

## Prerequisites

- A Kubernetes cluster
- `kubectl` CLI configured to communicate with your cluster
- Docker registry access (GitHub Container Registry is used by default)
- SSL certificates (using cert-manager and Let's Encrypt in these manifests)

## Environment Variables

Before deploying to production, you'll need to set several environment variables that will be used in the Kubernetes Secret:

```
POSTGRES_USER
POSTGRES_PASSWORD
REDIS_PASSWORD
SECRET_KEY
JWT_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

## Deployment Process

### Development Environment

```bash
# Update the kubeconfig for your development cluster
aws eks update-kubeconfig --name listener-app-dev --region us-west-2

# Apply the Kubernetes manifests
cd k8s/dev
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f scraper-deployment.yaml
kubectl apply -f ingress.yaml
```

### Production Environment

For production, we recommend using a CI/CD pipeline like the one defined in `.github/workflows/ci.yml`. However, you can also deploy manually:

```bash
# Update the kubeconfig for your production cluster
aws eks update-kubeconfig --name listener-app-prod --region us-west-2

# Export the required environment variables
export POSTGRES_USER="production_user"
export POSTGRES_PASSWORD="secure_password"
# ... set other variables ...

# Apply the Kubernetes manifests
cd k8s/prod
envsubst < secret.yaml | kubectl apply -f -
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f scraper-deployment.yaml
kubectl apply -f ingress.yaml
```

## Scaling

You can scale the deployments as needed:

```bash
kubectl scale deployment backend --replicas=5 -n listener-app-prod
```

## Monitoring

To view the status of your deployments:

```bash
kubectl get pods -n listener-app-prod
kubectl get deployments -n listener-app-prod
kubectl get services -n listener-app-prod
kubectl get ingress -n listener-app-prod
```

## Logs

To view logs for a specific pod:

```bash
kubectl logs -f <pod-name> -n listener-app-prod
``` 