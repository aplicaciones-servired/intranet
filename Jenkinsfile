pipeline {
  agent any

  tools {
    nodejs 'node-v22'
  }

  environment {
    ENV_CLIENT_INTRANET = credentials('ENV_CLIENT_INTRANET')
    ENV_SERVER_INTRANET = credentials('ENV_SERVER_INTRANET')
    CLERK_SECRET_KEY_INTRANET    = credentials('CLERK_SECRET_KEY_INTRANET')
    CLERK_PUBLISHABLE_KEY_INTRANET = credentials('CLERK_PUBLISHABLE_KEY_INTRANET')
  }

  stages {

    stage('Copy .env files') {
      steps {
        script {
          def env_server = readFile(ENV_SERVER_INTRANET)
          def env_client = readFile(ENV_CLIENT_INTRANET)

          // Añadir clave Clerk al env del cliente
          def env_client_completo = env_client + "\nCLERK_SECRET_KEY=${CLERK_SECRET_KEY_INTRANET}\n"
          env_client_completo = env_client_completo + "PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY_INTRANET}\n"

          // Añadir claves Clerk al env del servidor
          def env_server_completo = env_server + "\nCLERK_SECRET_KEY=${CLERK_SECRET_KEY_INTRANET}\n"
          env_server_completo = env_server_completo + "CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY_INTRANET}\n"

          writeFile file: './server/.env', text: env_server_completo
          writeFile file: './client/.env', text: env_client_completo

          // Verificar
          sh 'ls -la ./server/.env'
          sh 'ls -la ./client/.env'
          sh 'cat ./client/.env | grep PUBLIC_URL_API'
          sh 'cat ./client/.env | grep CLERK_SECRET_KEY'
          sh 'cat ./client/.env | grep PUBLIC_CLERK_PUBLISHABLE_KEY'
        }
      }
    }

    stage('install dependencies server') {
      steps {
        script {
          sh 'cd ./server && npm install'
        }
      }
    }

    stage('install dependencies client') {
      steps {
        script {
          sh 'cd ./client && npm install --legacy-peer-deps'
        }
      }
    }

    stage('down docker compose') {
      steps {
        script {
          sh 'docker compose down --remove-orphans'
        }
      }
    }

    stage('delete images client') {
      steps {
        script {
          def images = 'web-intranet'
          if (sh(script: "docker images -q ${images}", returnStdout: true).trim()) {
            sh "docker rmi ${images}"
          } else {
            echo "Image ${images} does not exist."
          }
        }
      }
    }

    stage('delete images server') {
      steps {
        script {
          def images = 'intranet-server'
          if (sh(script: "docker images -q ${images}", returnStdout: true).trim()) {
            sh "docker rmi ${images}"
          } else {
            echo "Image ${images} does not exist."
          }
        }
      }
    }

    stage('run docker compose') {
      steps {
        script {
          // ✅ docker-compose cargará automáticamente server/.env y client/.env
          sh 'docker compose up -d'
        }
      }
    }
  }
}
