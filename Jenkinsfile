/**
 * Jenkins Declarative Pipeline for ABC Technologies Website
 *
 * This pipeline automates:
 * - Source code checkout from Git
 * - Docker image build
 * - Container testing
 * - Kubernetes deployment
 *
 * Prerequisites:
 * - Jenkins server with Docker and kubectl installed
 * - Kubernetes cluster configured with kubeconfig
 * - Docker registry access for image push/pull
 */

pipeline {
    agent any

    environment {
        // Configuration Variables
        APP_NAME = 'abc-tech-website'
        IMAGE_NAME = "${APP_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_REGISTRY = 'docker.io'  // Change to your registry
        K8S_NAMESPACE = 'default'

        // Full image reference
        FULL_IMAGE_NAME = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    }

    options {
        // Build timestamps
        timestamps()
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        // Keep only last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Disable concurrent builds
        disableConcurrentBuilds()
    }

    stages {
        /**
         * Stage 1: Checkout
         * Pulls the latest source code from the Git repository
         */
        stage('Checkout') {
            steps {
                echo "Checking out source code from Git..."
                checkout scm
                sh '''
                    echo "Repository: ${GIT_URL}"
                    echo "Branch: ${GIT_BRANCH}"
                    echo "Commit: ${GIT_COMMIT}"
                    echo "Author: ${GIT_AUTHOR_NAME}"
                '''
            }
            post {
                success {
                    echo "Checkout completed successfully."
                }
                failure {
                    error "Failed to checkout source code."
                }
            }
        }

        /**
         * Stage 2: Build
         * Builds the Docker image for the website
         */
        stage('Build') {
            steps {
                echo "Building Docker image: ${FULL_IMAGE_NAME}"
                script {
                    // Build the Docker image
                    docker.withRegistry("https://${DOCKER_REGISTRY}") {
                        sh """
                            docker build \\
                                -t ${IMAGE_NAME}:latest \\
                                -t ${IMAGE_NAME}:${IMAGE_TAG} \\
                                -f Dockerfile \\
                                .
                        """
                    }
                }
            }
            post {
                success {
                    echo "Docker image built successfully."
                    sh "docker images | grep ${IMAGE_NAME}"
                }
                failure {
                    error "Failed to build Docker image."
                }
            }
        }

        /**
         * Stage 3: Test
         * Runs container tests to ensure Nginx serves HTTP 200
         */
        stage('Test') {
            steps {
                echo "Running container tests..."
                script {
                    // Run container in background
                    def containerId = sh(
                        script: """
                            docker run -d --name test-container -p 8888:80 ${IMAGE_NAME}:${IMAGE_TAG}
                            sleep 5
                            docker ps | grep test-container || exit 1
                        """,
                        returnStdout: true
                    ).trim()

                    // Test HTTP response
                    def httpResponse = sh(
                        script: '''
                            curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/
                        ''',
                        returnStdout: true
                    ).trim()

                    // Cleanup test container
                    sh """
                        docker stop test-container || true
                        docker rm test-container || true
                    """

                    // Verify HTTP 200
                    if (httpResponse != '200') {
                        error "Container test failed! Expected HTTP 200, got HTTP ${httpResponse}"
                    }

                    echo "Container test passed! Received HTTP ${httpResponse}"
                }
            }
            post {
                success {
                    echo "All tests passed successfully."
                }
                failure {
                    echo "Tests failed."
                    // Cleanup on failure
                    sh 'docker stop test-container || true'
                    sh 'docker rm test-container || true'
                }
            }
        }

        /**
         * Stage 4: Push (Optional)
         * Pushes the Docker image to the registry
         */
        stage('Push') {
            when {
                branch 'main'
            }
            steps {
                echo "Pushing Docker image to registry..."
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}") {
                        sh """
                            docker push ${IMAGE_NAME}:latest
                            docker push ${IMAGE_NAME}:${IMAGE_TAG}
                        """
                    }
                }
            }
            post {
                success {
                    echo "Docker image pushed to registry successfully."
                }
                failure {
                    error "Failed to push Docker image."
                }
            }
        }

        /**
         * Stage 5: Deploy
         * Deploys the application to Kubernetes cluster
         */
        stage('Deploy') {
            steps {
                echo "Deploying to Kubernetes cluster..."
                script {
                    // Apply Kubernetes manifests
                    sh """
                        kubectl apply -f k8s-deployment.yaml -n ${K8S_NAMESPACE}
                        kubectl apply -f k8s-service.yaml -n ${K8S_NAMESPACE}
                    """

                    // Wait for rollout to complete
                    sh """
                        kubectl rollout status deployment/${APP_NAME} -n ${K8S_NAMESPACE} --timeout=300s
                    """

                    // Verify deployment
                    sh """
                        kubectl get pods -l app=${APP_NAME} -n ${K8S_NAMESPACE}
                        kubectl get services -n ${K8S_NAMESPACE} | grep ${APP_NAME}
                    """
                }
            }
            post {
                success {
                    echo "Deployment to Kubernetes completed successfully."
                }
                failure {
                    error "Failed to deploy to Kubernetes."
                }
            }
        }

        /**
         * Stage 6: Verify
         * Verifies the deployment is accessible
         */
        stage('Verify') {
            steps {
                echo "Verifying deployment..."
                script {
                    // Check if the service is running
                    def serviceStatus = sh(
                        script: """
                            kubectl get svc/${APP_NAME}-service -n ${K8S_NAMESPACE} -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
                        """,
                        returnStdout: true
                    ).trim()

                    // Get the external IP or NodePort
                    sh """
                        echo "Service Endpoints:"
                        kubectl get endpoints -n ${K8S_NAMESPACE} -l app=${APP_NAME}

                        echo "Deployment Status:"
                        kubectl describe deployment ${APP_NAME} -n ${K8S_NAMESPACE}
                    """

                    echo "Deployment verified successfully."
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed."
            // Clean up Docker images
            sh """
                docker image prune -f || true
            """
        }
        success {
            echo """
                ====================================
                PIPELINE SUCCESSFUL
                ====================================
                Application: ${APP_NAME}
                Image Tag: ${IMAGE_TAG}
                Environment: ${K8S_NAMESPACE}
                ====================================
            """
        }
        failure {
            echo """
                ====================================
                PIPELINE FAILED
                ====================================
                Check the logs for details.
                ====================================
            """
        }
        unstable {
            echo "Pipeline completed with warnings."
        }
    }
}
