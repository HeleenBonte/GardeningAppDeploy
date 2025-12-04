# Kubernetes Deployment for Gardeners App

This directory contains Kubernetes manifests to deploy the Gardeners application on Minikube.

## Prerequisites

- Minikube installed
- kubectl installed
- Docker installed
- PowerShell 7+

## Quick Start

Run the deployment script:

```powershell
cd k8s
.\deploy.ps1
```

## Manual Deployment

### 1. Start Minikube

```powershell
minikube start --driver=docker
```

### 2. Configure Docker to use Minikube's Docker daemon

```powershell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

### 3. Build Docker images

```powershell
docker build -t gardeners-backend:latest ../backend
docker build -t gardeners-frontend:latest ../frontend
```

### 4. Apply Kubernetes manifests

```powershell
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

### 5. Wait for pods to be ready

```powershell
kubectl get pods -n gardeners-app -w
```

### 6. Access services

```powershell
# Backend
minikube service backend -n gardeners-app

# Frontend
minikube service frontend -n gardeners-app
```

## Useful Commands

### Check pod status
```powershell
kubectl get pods -n gardeners-app
```

### Check service status
```powershell
kubectl get services -n gardeners-app
```

### View logs
```powershell
kubectl logs -n gardeners-app deployment/backend
kubectl logs -n gardeners-app deployment/frontend
kubectl logs -n gardeners-app deployment/postgres
```

### Access Kubernetes dashboard
```powershell
minikube dashboard
```

### Delete all resources
```powershell
kubectl delete namespace gardeners-app
```

### Stop Minikube
```powershell
minikube stop
```

## Architecture

- **Namespace**: `gardeners-app` - isolates all resources
- **Backend**: Spring Boot application on port 3000
- **Frontend**: Node.js React Native Expo app on port 8080
- **Database**: PostgreSQL 18 with persistent storage
- **Services**: NodePort services for external access

## Troubleshooting

If pods are not starting, check logs:
```powershell
kubectl describe pod <pod-name> -n gardeners-app
kubectl logs <pod-name> -n gardeners-app
```

If images are not found, ensure you're using Minikube's Docker daemon:
```powershell
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker images | Select-String gardeners
```
