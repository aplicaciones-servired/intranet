pipeline {
  agent any

  tools {
    nodejs 'node-v22'
  }

  environment {
    ENV_CLIENT_INTRANET = credentials('ENV_CLIENT_INTRANET')
    ENV_SERVER_INTRANET = credentials('ENV_SERVER_INTRANET')
    JWT_SECRET_INTRANET     = credentials('JWT_SECRET_INTRANET')
  }

  stages {

    stage('Copy .env files') {
      steps {
        script {
          def env_server = readFile(ENV_SERVER_INTRANET)
          def env_client = readFile(ENV_CLIENT_INTRANET)

          // Inyectar JWT_SECRET (mismo valor en cliente y servidor)
          def env_client_completo = env_client + "\nJWT_SECRET=${JWT_SECRET_INTRANET}\nPUBLIC_URL_API=/api\nPUBLIC_LOGIN_URL=/apilogin\nLOGIN_API_URL=http://proxy_intranet:8081/apilogin\n"

          def env_server_completo = env_server + "\nJWT_SECRET=${JWT_SECRET_INTRANET}\n"

          writeFile file: './server/.env', text: env_server_completo
          writeFile file: './client/.env', text: env_client_completo

          // Verificar
          sh 'ls -la ./server/.env'
          sh 'ls -la ./client/.env'
          sh 'cat ./client/.env | grep PUBLIC_URL_API || true'
          sh 'cat ./client/.env | grep PUBLIC_LOGIN_URL || true'
          sh 'cat ./client/.env | grep LOGIN_API_URL || true'
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

    stage('healthcheck proxy to api') {
      steps {
        script {
          sh 'docker compose ps'
          // Validar que nginx vea al backend dentro de la red docker
          sh 'docker compose exec -T proxy_intranet sh -c "wget -q -O- http://api_intranet:3000/getImagenes >/dev/null"'
          // Validar ruta final con prefijo /api que usa el frontend
          sh 'docker compose exec -T proxy_intranet sh -c "wget -q -O- http://localhost:8081/api/getImagenes >/dev/null"'
        }
      }
    }
  }
}
