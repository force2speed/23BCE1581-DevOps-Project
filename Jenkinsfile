

pipeline {
    agent any

    environment {
        APP_NAME = 'abc-tech-website'
        IMAGE_NAME = "${APP_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_REGISTRY = 'docker.io'
        K8S_NAMESPACE = 'default'

        FULL_IMAGE_NAME = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
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

        stage('Build') {
            steps {
                echo "Building Docker image: ${FULL_IMAGE_NAME}"
                script {
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

        stage('Test') {
            steps {
                echo "Running container tests..."
                script {
                    def containerId = sh(
                        script: """
                            docker run -d --name test-container -p 8888:80 ${IMAGE_NAME}:${IMAGE_TAG}
                            sleep 5
                            docker ps | grep test-container || exit 1
                        """,
                        returnStdout: true
                    ).trim()

                    def httpResponse = sh(
                        script: '''
                            curl -s -o /dev/null -w "%{http_code}" http://localhost:8888/
                        ''',
                        returnStdout: true
                    ).trim()

                    sh """
                        docker stop test-container || true
                        docker rm test-container || true
                    """

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
                    sh 'docker stop test-container || true'
                    sh 'docker rm test-container || true'
                }
            }
        }

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

        stage('Deploy') {
            steps {
                echo "Deploying to Kubernetes cluster..."
                script {
                    sh """
                        kubectl apply -f k8s-deployment.yaml -n ${K8S_NAMESPACE}
                        kubectl apply -f k8s-service.yaml -n ${K8S_NAMESPACE}
                    """

                    sh """
                        kubectl rollout status deployment/${APP_NAME} -n ${K8S_NAMESPACE} --timeout=300s
                    """

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
        stage('Verify') {
            steps {
                echo "Verifying deployment..."
                script {
                    def serviceStatus = sh(
                        script: """
                            kubectl get svc/${APP_NAME}-service -n ${K8S_NAMESPACE} -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
                        """,
                        returnStdout: true
                    ).trim()

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
