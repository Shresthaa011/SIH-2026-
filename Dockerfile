# Use lightweight official Nginx Alpine image
FROM nginx:alpine

# Copy static assets to Nginx html directory
COPY index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
