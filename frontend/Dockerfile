# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS build
WORKDIR /app

# Cache node_modules
COPY package*.json ./
RUN npm ci --silent

# Build app
COPY . .
RUN npm run build

# ================================
# Stage 2: Serve with Nginx
# ================================
FROM nginx:alpine AS runtime

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
