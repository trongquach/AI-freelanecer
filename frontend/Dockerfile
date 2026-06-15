# ================================
# Build Stage
# ================================
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ================================
# Serve with Nginx
# ================================
FROM nginx:alpine AS runtime

# Copy built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
