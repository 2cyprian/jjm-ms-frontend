# ================================
# Stage 1: Build production files
# ================================
FROM node:20-alpine AS builder

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy environment file first
COPY .env ./

# Copy source code
COPY . .

# Build production files
RUN npm run build

# ================================
# Stage 2: Serve with Nginx
# ================================
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from the 'builder' stage
# NOTE: Check if your build folder is 'dist' or 'build' 
# (Vite uses 'dist', Create React App uses 'build')
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx config for SPA routing (important for React/Vue)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]