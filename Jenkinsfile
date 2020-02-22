pipeline {
  agent {
    docker {
      image 'node:13'
    }
  }

  options {
    timeout(time: 10, unit: 'MINUTES')
    ansiColor('xterm')
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }

    stage('Test') {
      steps {
        sh 'npm run test'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Deploy') {
      when {
        branch 'master'
      }
      environment {
        SURGE = credentials('halkeye-surge')
      }
      steps {
        sh 'SURGE_LOGIN=$SURGE_USR SURGE_TOKEN=$SURGE_PSW npx surge -p dist -d infinicatr.gavinmogan.com'
      }
    }
  }
}
