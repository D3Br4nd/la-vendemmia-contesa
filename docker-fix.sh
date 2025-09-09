#!/bin/bash
# La Vendemmia Contesa - Quick Docker Fix & Restart
# Risolve i problemi di runtime e riavvia il container

echo "🍇 La Vendemmia Contesa - Docker Quick Fix"
echo "=========================================="

# Stop container attuale
echo "🛑 Stopping current container..."
docker-compose down

# Rebuild with cache clear per essere sicuri
echo "🔨 Rebuilding image with fixes..."
docker build --no-cache --target production -t vendemmia-contesa:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Restart container
    echo "🚀 Starting container..."
    docker-compose up -d
    
    # Wait a bit
    sleep 5
    
    # Check status
    echo "📊 Container status:"
    docker ps | grep vendemmia-contesa
    
    echo ""
    echo "📝 Container logs (last 20 lines):"
    docker logs --tail 20 vendemmia-contesa
    
    echo ""
    echo "🔍 Health check:"
    docker exec vendemmia-contesa /usr/local/bin/healthcheck.sh 2>/dev/null || echo "Health check script not ready yet"
    
    echo ""
    echo "🌐 Testing web response:"
    sleep 2
    curl -s -I http://localhost:80 2>/dev/null | head -1 || echo "Web server not ready yet"
    
    echo ""
    echo "✅ Fix completed! Check http://rm.prolocoventicano.com"
    
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi
