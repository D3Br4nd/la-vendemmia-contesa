# Multi-stage Dockerfile for La Vendemmia Contesa

# Development stage
FROM nginx:alpine AS development

# Install development tools
RUN apk add --no-cache \
    php81 \
    php81-fpm \
    php81-session \
    php81-json \
    php81-mbstring \
    php81-openssl \
    php81-dev \
    supervisor \
    curl \
    nodejs \
    npm

# Copy development configurations
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/php-fpm.conf /etc/php81/php-fpm.d/www.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Development volumes will be mounted
EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Production stage
FROM nginx:alpine AS production

# Set maintainer info
LABEL maintainer="Comitato PAAA <paaa@example.com>"
LABEL description="La Vendemmia Contesa - HTML5 Game Container"
LABEL version="1.0"

# Install only production dependencies
RUN apk add --no-cache \
    php81 \
    php81-fpm \
    php81-session \
    php81-json \
    php81-mbstring \
    php81-openssl \
    supervisor \
    curl \
    && rm -rf /var/cache/apk/*

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy configurations
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/php-fpm.conf /etc/php81/php-fpm.d/www.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy application files (excluding development files)
COPY index.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY src/ /usr/share/nginx/html/src/
COPY levels/ /usr/share/nginx/html/levels/

# Copy PHP backend
COPY src/php/ /var/www/html/

# Create required directories
RUN mkdir -p /var/www/html /usr/share/nginx/html/data

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/www/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/www/html && \
    chmod 775 /usr/share/nginx/html/data

# Create non-root user for security
RUN adduser -D -s /bin/sh gameuser && \
    adduser gameuser nginx

# Security: Remove unnecessary packages and clean up
RUN rm -rf /tmp/* /var/tmp/* /var/cache/apk/*

# Add health check script
COPY docker/healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Use non-root user (commented for nginx compatibility)
# USER gameuser

# Start supervisor to manage nginx and php-fpm
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
