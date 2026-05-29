# ================================
# Serve with Nginx (Pre-built)
# ================================
FROM nginx:alpine AS runtime

# Copy locally built files (Requires npm run build locally first)
COPY dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
