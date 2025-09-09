#!/bin/sh

# Health check script for La Vendemmia Contesa container

# Check if nginx is responding
if ! curl -f -s http://localhost/ > /dev/null; then
    echo "UNHEALTHY: Nginx not responding"
    exit 1
fi

# Check if PHP-FPM is running
if ! pgrep -f php-fpm81 > /dev/null; then
    echo "UNHEALTHY: PHP-FPM not running"
    exit 1
fi

# Check if data directory is writable
if ! touch /usr/share/nginx/html/data/.health_check 2>/dev/null; then
    echo "UNHEALTHY: Data directory not writable"
    exit 1
fi

# Clean up test file
rm -f /usr/share/nginx/html/data/.health_check

# All checks passed
echo "HEALTHY: All services running"
exit 0
