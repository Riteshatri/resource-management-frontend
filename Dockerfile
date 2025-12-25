# -------- Build Stage --------
FROM node AS build
# FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
# RUN npm ci

COPY . .
RUN npm run build

# ==============================
# Runtime Stage (Nginx)
# ==============================
FROM nginx:1.25-alpine

# Install envsubst (from gettext)
RUN apk add --no-cache gettext

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx template (NOT final config)
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# ✅ COPY FRONTEND BUILD FILES
COPY --from=build /app/dist/public /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# ✅ ENTRYPOINT (FIXED STARTUP LOGIC)
ENTRYPOINT ["/docker-entrypoint.sh"]

# ✅ CMD (DEFAULT PROCESS)
CMD ["nginx", "-g", "daemon off;"]


# docker build -t resource-management-frontend:v1 .

# docker run -d -p 80:80 \
#   -e BACKEND_HOST=10.0.0.5 \
#   -e BACKEND_PORT=8000 \
#   riteshatri/resource-management-frontend:tag

# docker run -d -p 80:80 --name resource-management-frontend -e BACKEND_HOST=192.168.29.27 -e BACKEND_PORT=8000 resource-management-frontend:v1