FROM nginx:alpine

WORKDIR /etc/nginx

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (optional - for production)
# COPY certs/ /etc/nginx/certs/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
