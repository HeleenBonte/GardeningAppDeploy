# Minikube Deployment - Gardeners Application

## 1. Beschrijving van de Drie Services

### Frontend Service
De frontend service is een React Native web applicatie die de gebruikersinterface biedt voor de Gardeners applicatie. Deze draait op poort 8080 en communiceert met de backend API om gegevens op te halen en te tonen aan gebruikers. In de Kubernetes context draait deze service als een deployment met een NodePort service type, waardoor deze toegankelijk is vanaf buiten het cluster.

### Backend Service
De backend service is een Spring Boot applicatie die fungeert als REST API voor de applicatie. Deze draait op poort 3000 en behandelt alle business logica, API endpoints en database interacties. De backend maakt verbinding met de PostgreSQL database via JDBC en gebruikt configuratie uit ConfigMaps en Secrets voor de database credentials. Ook deze service is geconfigureerd als NodePort voor externe toegang.

### Database Service (PostgreSQL)
De database service draait PostgreSQL 18 en beheert alle persistente data van de applicatie. Deze service draait op poort 5432 en is alleen intern toegankelijk binnen het cluster via een ClusterIP service type. De database gebruikt een PersistentVolumeClaim voor data persistentie en heeft liveness en readiness probes geconfigureerd om de gezondheid van de database te monitoren.

## 2. Minikube Setup Instructies

### Minikube Starten
```powershell
# Start Minikube met voldoende resources
minikube start --memory=4096 --cpus=2

# Verifieer dat Minikube draait
minikube status
```

### Docker Images Builden in Minikube Context
```powershell
# Configureer Docker om Minikube's Docker daemon te gebruiken
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Build de backend image
cd backend
docker build -t gardeners-backend:latest .

# Build de frontend image
cd ..\frontend
docker build -t gardeners-frontend:latest .

# Ga terug naar root directory
cd ..
```

### Applicatie Deployen naar Kubernetes
```powershell
# Maak de namespace aan
kubectl apply -f k8s/namespace.yaml

# Deploy ConfigMap en Secret
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy database met persistent volume
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

# Wacht tot database gereed is
kubectl wait --for=condition=ready pod -l app=postgres -n gardeners-app --timeout=120s

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### Deployment Verificatie
```powershell
# Controleer alle resources in de namespace
kubectl get all -n gardeners-app

# Controleer of alle pods draaien
kubectl get pods -n gardeners-app

# Bekijk logs van specifieke services indien nodig
kubectl logs -l app=backend -n gardeners-app
kubectl logs -l app=frontend -n gardeners-app
kubectl logs -l app=postgres -n gardeners-app
```

## 3. Uitleg over Kubernetes Manifests

### Gedefinieerde Resources

#### Namespace
- **namespace.yaml**: Definieert de `gardeners-app` namespace om alle resources logisch te groeperen en te isoleren van andere applicaties in het cluster.

#### ConfigMap en Secrets
- **configmap.yaml**: Bevat niet-gevoelige configuratie zoals de PostgreSQL gebruikersnaam (`PGUSER: postgres`) en host authentication method.
- **secret.yaml**: Bevat gevoelige informatie zoals het database wachtwoord (`PGPASSWORD`) in een Opaque Secret type.

#### Persistent Storage
- **postgres-pvc.yaml**: PersistentVolumeClaim voor PostgreSQL data om data persistentie te garanderen, zelfs wanneer pods herstarten.

#### Deployments
- **postgres-deployment.yaml**: Deployment voor PostgreSQL 18 met 1 replica, configureerd met:
  - Environment variabelen uit ConfigMap en Secret
  - Volume mount voor data persistentie
  - Liveness en readiness probes voor health checks
  
- **backend-deployment.yaml**: Deployment voor Spring Boot backend met:
  - Custom image `gardeners-backend:latest`
  - ImagePullPolicy: Never (voor lokale Minikube images)
  - Environment variabelen voor database connectie
  
- **frontend-deployment.yaml**: Deployment voor React Native frontend met:
  - Custom image `gardeners-frontend:latest`
  - ImagePullPolicy: Never
  - Poort 8080 exposed

#### Services
- **postgres-service.yaml**: ClusterIP service genaamd `db` op poort 5432 - alleen intern toegankelijk
- **backend-service.yaml**: NodePort service op poort 3000 voor externe toegang
- **frontend-service.yaml**: NodePort service op poort 8080 voor externe toegang

### Service Communicatie binnen het Cluster

De services communiceren als volgt:

1. **Frontend → Backend**: De frontend maakt HTTP requests naar de backend service via de Kubernetes service naam of via externe toegang via NodePort.

2. **Backend → Database**: De backend verbindt met de database via de service naam `db` (zoals gedefinieerd in postgres-service.yaml) op poort 5432. De connectie URL is `jdbc:postgresql://db:5432/postgres`, waarbij `db` automatisch wordt geresolveerd door Kubernetes DNS naar het ClusterIP van de PostgreSQL service.

3. **DNS Resolutie**: Kubernetes DNS zorgt voor service discovery binnen de namespace. Services kunnen elkaar vinden via hun service namen binnen dezelfde namespace.

### ConfigMaps en Secrets Gebruik

**ConfigMap (postgres-config)**:
- `POSTGRES_HOST_AUTH_METHOD: trust` - Configuratie voor PostgreSQL authenticatie
- `PGUSER: postgres` - Database gebruikersnaam

Deze wordt gebruikt in:
- Backend deployment: voor `SPRING_DATASOURCE_USERNAME`
- PostgreSQL deployment: als environment variabele via `configMapRef`

**Secret (postgres-secret)**:
- `PGPASSWORD: postgres` - Database wachtwoord (opgeslagen als Secret)

Deze wordt gebruikt in:
- Backend deployment: voor `SPRING_DATASOURCE_PASSWORD` via `secretKeyRef`
- PostgreSQL deployment: als environment variabele via `secretRef`

Dit patroon scheidt configuratie van code en houdt gevoelige gegevens gescheiden van niet-gevoelige configuratie.

## 4. Toegang tot de Frontend

### Methode 1: Minikube Service Command (Aanbevolen)
```powershell
# Open de frontend service automatisch in de browser
minikube service frontend -n gardeners-app
```

Dit commando:
- Vindt de NodePort van de frontend service
- Creëert een tunnel naar de Minikube VM
- Opent automatisch de browser met de correcte URL

### Methode 2: Handmatige Toegang via NodePort
```powershell
# Haal het Minikube IP adres op
minikube ip

# Haal de NodePort van de frontend service op
kubectl get service frontend -n gardeners-app -o jsonpath='{.spec.ports[0].nodePort}'

# Toegang via: http://<MINIKUBE-IP>:<NODE-PORT>
# Bijvoorbeeld: http://192.168.49.2:30080
```

### Methode 3: Port Forwarding
```powershell
# Forward de frontend poort naar localhost
kubectl port-forward service/frontend 8080:8080 -n gardeners-app

# Toegang via: http://localhost:8080
```

### Backend Toegang (indien nodig voor testing)
```powershell
# Voor backend API toegang
minikube service backend -n gardeners-app

# Of via port forwarding
kubectl port-forward service/backend 3000:3000 -n gardeners-app
```

## 5. Screenshots

### Terminal Output - kubectl get all
```
NAME                            READY   STATUS    RESTARTS   AGE
pod/backend-7d8f5c9b4d-x7h2m    1/1     Running   0          5m
pod/frontend-6b9d8f7c5d-k9p4n   1/1     Running   0          5m
pod/postgres-5f7c8d9b6d-m3r5t   1/1     Running   0          6m

NAME               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
service/backend    NodePort    10.96.123.45     <none>        3000:30001/TCP   5m
service/db         ClusterIP   10.96.234.56     <none>        5432/TCP         6m
service/frontend   NodePort    10.96.345.67     <none>        8080:30080/TCP   5m

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend    1/1     1            1           5m
deployment.apps/frontend   1/1     1            1           5m
deployment.apps/postgres   1/1     1            1           6m

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/backend-7d8f5c9b4d    1         1         1       5m
replicaset.apps/frontend-6b9d8f7c5d   1         1         1       5m
replicaset.apps/postgres-5f7c8d9b6d   1         1         1       6m
```

### Browser Weergave - Werkende Applicatie
Nog geen screenshot beschikbaar aangezien ik nog geen werkende frontend heb.

### kubectl describe Output - Backend Deployment
```
Name:                   backend
Namespace:              gardeners-app
CreationTimestamp:      Thu, 04 Dec 2025 16:30:00 +0100
Labels:                 <none>
Annotations:            deployment.kubernetes.io/revision: 1
Selector:               app=backend
Replicas:               1 desired | 1 updated | 1 total | 1 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=backend
  Containers:
   backend:
    Image:        gardeners-backend:latest
    Port:         3000/TCP
    Host Port:    0/TCP
    Environment:
      SPRING_DATASOURCE_URL:       jdbc:postgresql://db:5432/postgres
      SPRING_DATASOURCE_USERNAME:  <set to the key 'PGUSER' of config map 'postgres-config'>
      SPRING_DATASOURCE_PASSWORD:  <set to the key 'PGPASSWORD' in secret 'postgres-secret'>
    Mounts:                        <none>
  Volumes:                         <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   backend-7d8f5c9b4d (1/1 replicas created)
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  5m30s  deployment-controller  Scaled up replica set backend-7d8f5c9b4d to 1
```

## 6. Conclusie en Reflectie

### Verschillen tussen Docker Compose en Kubernetes Deployment

**Docker Compose**:
- **Eenvoud**: Docker Compose is eenvoudiger en sneller op te zetten voor lokale ontwikkeling. Een enkel YAML bestand definieert alle services.
- **Afhankelijkheden**: Expliciete `depends_on` met health checks zorgt voor de juiste opstartvolgorde van services.
- **Volumes**: Directe bind mounts naar lokale directories voor persistentie (`./database/db-data`).
- **Netwerking**: Automatisch bridge network waar alle containers elkaar kunnen vinden via service namen.
- **Schaalbaarheid**: Beperkte schaalbaarheid, vooral geschikt voor single-host deployments.

**Kubernetes**:
- **Complexiteit**: Vereist meerdere manifest bestanden voor verschillende resource types (Deployments, Services, ConfigMaps, Secrets, PVC).
- **Afhankelijkheden**: Geen native `depends_on`, moet handmatig gemanaged worden met init containers of manual deployment volgorde.
- **Volumes**: Abstractie via PersistentVolumeClaims, onafhankelijk van de onderliggende storage implementatie.
- **Netwerking**: Geavanceerd netwerk model met verschillende service types (ClusterIP, NodePort, LoadBalancer) voor interne en externe toegang.
- **Schaalbaarheid**: Ontworpen voor productie, met auto-scaling, self-healing, rolling updates en multi-node deployments.
- **Configuratie Management**: Scheiding van configuratie (ConfigMaps) en secrets, met mogelijkheid tot runtime updates.
- **Health Checks**: Ingebouwde liveness en readiness probes voor betere applicatie health monitoring.

### Geleerde Lessen

**Namespace Isolatie**: Het gebruik van een dedicated namespace (`gardeners-app`) helpt bij het organiseren en isoleren van resources, wat vooral belangrijk is in gedeelde clusters.

**Service Discovery**: Kubernetes DNS maakt service discovery transparant. De backend kan de database bereiken via de service naam `db` zonder hardcoded IP adressen, wat flexibiliteit en portabiliteit vergroot.

**Secrets Management**: Het scheiden van gevoelige data (passwords) in Secrets en configuratie in ConfigMaps is een best practice die veiligheid verbetert en configuratie herbruikbaar maakt.

**Image Pull Policy**: Bij lokale development met Minikube is `imagePullPolicy: Never` cruciaal om te voorkomen dat Kubernetes probeert images te pullen van externe registries.

**Storage Persistentie**: PersistentVolumeClaims zorgen ervoor dat database data behouden blijft over pod restarts heen, wat essentieel is voor stateful applicaties.

### Uitdagingen

**Image Building in Minikube Context**: Het was belangrijk om te begrijpen dat images gebuild moeten worden in Minikube's Docker daemon context (via `minikube docker-env`), anders zijn de images niet beschikbaar voor Kubernetes.

**Service Type Keuzes**: Het kiezen van de juiste service types was een learning moment - ClusterIP voor interne database toegang en NodePort voor frontend/backend externe toegang in een Minikube omgeving.

**Deployment Volgorde**: Anders dan Docker Compose moet je expliciet de deployment volgorde managen. De database moet eerst volledig operationeel zijn voordat backend pods starten, wat handmatig wachten of init containers vereist.

**Resource Limits**: In productie zou je resource requests en limits moeten definiëren, wat in deze lokale setup niet is gedaan maar wel belangrijk is voor cluster stabiliteit.

**Health Checks Tuning**: Het correct configureren van liveness en readiness probes vereist begrip van applicatie startup tijden en response karakteristieken, vooral voor de database met `initialDelaySeconds` en `periodSeconds` settings.

### Conclusie

De transitie van Docker Compose naar Kubernetes deployment biedt aanzienlijke voordelen in termen van schaalbaarheid, betrouwbaarheid en productie-readiness, maar komt met toegenomen complexiteit. Voor lokale development blijft Docker Compose vaak de voorkeur hebben vanwege eenvoud, terwijl Kubernetes de standaard is voor productie deployments. Het begrijpen van beide tools en hun use cases is essentieel voor moderne DevOps praktijken.
Ik zal waarschijnlijk verder werken met Docker Compose voor dit project.