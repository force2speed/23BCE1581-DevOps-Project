# ABC Technologies Corporate Website

A modern, responsive corporate website for ABC Technologies, built with HTML5, CSS3, and JavaScript. This project is designed for a DevOps deployment pipeline demonstration.

## Project Structure

```
project/
├── index.html              # Home page
├── about.html              # Company vision, mission, history
├── services.html           # DevOps, Cloud, Software Engineering services
├── careers.html            # Job listings and application form
├── contact.html            # Contact form and office locations
├── gallery.html            # Photo gallery with lightbox
├── styles.css              # Shared CSS styles
├── main.js                 # JavaScript functionality
├── package.json            # NPM configuration
├── vite.config.js          # Vite build configuration
├── Dockerfile              # Multi-stage Docker build
├── nginx.conf              # Nginx server configuration
├── k8s-deployment.yaml     # Kubernetes Deployment manifest
├── k8s-service.yaml        # Kubernetes Service manifest
├── Jenkinsfile             # Jenkins CI/CD pipeline
└── .dockerignore           # Docker build exclusions
```

## Features

### Website
- 6 responsive pages with modern corporate design
- Blue/slate professional color palette
- Mobile-friendly navigation with hamburger menu
- Interactive forms with validation
- Gallery with category filters and lightbox
- FAQ accordion
- Smooth scrolling and animations

### DevOps Components
- **Docker**: Multi-stage build with nginx:alpine
- **Kubernetes**: Deployment (2 replicas) + NodePort Service
- **Jenkins**: Full CI/CD pipeline with stages for checkout, build, test, and deploy

## Development

### Prerequisites
- Node.js 18+
- Docker
- kubectl (for Kubernetes deployment)
- Jenkins (for CI/CD)

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

### Build Image
```bash
docker build -t abc-tech-website:latest .
```

### Run Container
```bash
docker run -d -p 8080:80 abc-tech-website:latest
```

### Test
```bash
curl http://localhost:8080/health
# Expected: healthy
```

## Kubernetes Deployment

### Deploy to Cluster
```bash
# Apply manifests
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-service.yaml

# Verify deployment
kubectl get pods -l app=abc-tech-website
kubectl get services

# Access the application
# The website will be available on NodePort 30080
```

### Rollout Status
```bash
kubectl rollout status deployment/abc-tech-website
```

### Scale Deployment
```bash
kubectl scale deployment abc-tech-website --replicas=4
```

## Jenkins Pipeline

The Jenkinsfile defines a complete CI/CD pipeline:

1. **Checkout** - Pulls source code from Git
2. **Build** - Builds Docker image with tag
3. **Test** - Runs container test (HTTP 200 check)
4. **Push** - Pushes image to registry (main branch only)
5. **Deploy** - Applies Kubernetes manifests
6. **Verify** - Verifies deployment status

### Jenkins Requirements
- Docker plugin installed
- kubectl configured
- Kubernetes cluster access
- Docker registry credentials

## License

Copyright 2024 ABC Technologies. All rights reserved.
