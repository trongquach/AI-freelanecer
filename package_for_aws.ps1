Remove-Item -Recurse -Force deploy_aws -ErrorAction Ignore
New-Item -ItemType Directory -Path deploy_aws\backend
New-Item -ItemType Directory -Path deploy_aws\frontend
Copy-Item backend\target\*.jar deploy_aws\backend\app.jar
Copy-Item -Recurse frontend\dist deploy_aws\frontend\
Copy-Item frontend\nginx.conf deploy_aws\frontend\
Copy-Item .env.prod deploy_aws\ -ErrorAction Ignore

# Create backend/Dockerfile
@"
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY app.jar app.jar
RUN chown appuser:appgroup app.jar
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-Xmx300m", "-Xms300m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
"@ | Out-File -Encoding UTF8 deploy_aws\backend\Dockerfile

# Create frontend/Dockerfile
@"
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
"@ | Out-File -Encoding UTF8 deploy_aws\frontend\Dockerfile

# Create docker-compose.yml
@"
version: '3.9'
networks:
  aimarket-network:
    driver: bridge
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: aimarket-backend
    restart: unless-stopped
    ports:
      - "8080:8080"
    env_file:
      - .env.prod
    networks:
      - aimarket-network
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: aimarket-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - aimarket-network
"@ | Out-File -Encoding UTF8 deploy_aws\docker-compose.yml

Compress-Archive -Path deploy_aws\* -DestinationPath deploy_aws.zip -Force
Write-Host "XONG! File deploy_aws.zip da duoc tao thanh cong."
