#!/usr/bin/env pwsh
# Deploy script for Kubernetes on Minikube

Write-Host "Starting Minikube..." -ForegroundColor Green
minikube start --driver=docker

Write-Host "`nConfiguring Docker environment to use Minikube's Docker daemon..." -ForegroundColor Green
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

Write-Host "`nBuilding Docker images..." -ForegroundColor Green
Write-Host "Building backend image..."
docker build -t gardeners-backend:latest ../backend

Write-Host "Building frontend image..."
docker build -t gardeners-frontend:latest ../frontend

Write-Host "`nApplying Kubernetes manifests..." -ForegroundColor Green
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

Write-Host "`nWaiting for deployments to be ready..." -ForegroundColor Green
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n gardeners-app
kubectl wait --for=condition=available --timeout=300s deployment/backend -n gardeners-app
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n gardeners-app

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "`nTo access your services, run:" -ForegroundColor Yellow
Write-Host "  Backend:  minikube service backend -n gardeners-app"
Write-Host "  Frontend: minikube service frontend -n gardeners-app"
Write-Host "`nTo check pod status:" -ForegroundColor Yellow
Write-Host "  kubectl get pods -n gardeners-app"
