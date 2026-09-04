# Dockerfile
# Stage 1: Build the React Application
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# This compiles our TypeScript and Tailwind into pure, minified browser assets
RUN npm run build 

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the compiled assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]