# 🐋 Docker Build Fix Guide
**La Vendemmia Contesa - Docker Troubleshooting**

## ✅ **PROBLEMI RISOLTI**

### **1. File asset_preview.html Mancante**
**Errore**: `"/asset_preview.html": not found`  
**Soluzione**: ✅ Rimosso dal Dockerfile

**Prima:**
```dockerfile
COPY asset_preview.html /usr/share/nginx/html/
```

**Dopo:**
```dockerfile
# Riga rimossa - file non necessario
```

### **2. Case Mismatch Warning**
**Warning**: `'as' and 'FROM' keywords' casing do not match`  
**Soluzione**: ✅ Case unificato

**Prima:**
```dockerfile
FROM nginx:alpine as development
FROM nginx:alpine as production
```

**Dopo:**
```dockerfile
FROM nginx:alpine AS development
FROM nginx:alpine AS production
```

---

## 🚀 **BUILD COMMANDS CORRETTI**

### **Build Produzione (Raccomandato)**
```bash
cd /path/to/la-vendemmia-contesa

# Build senza cache per assicurare fresh build
docker build --no-cache --target production -t vendemmia-contesa:latest .

# Oppure build normale
docker build --target production -t vendemmia-contesa:latest .
```

### **Build Development (Opzionale)**
```bash
# Build development con tools extra
docker build --target development -t vendemmia-contesa:dev .
```

### **Verifica Build**
```bash
# Lista immagini create
docker images | grep vendemmia-contesa

# Dovrebbe mostrare:
# vendemmia-contesa   latest   [IMAGE_ID]   [TIME]   [SIZE]
```

---

## 🔧 **DOCKERFILE FINAL STATE**

Il Dockerfile ora è configurato correttamente per:

### **Files Copiati**
```dockerfile
COPY index.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY src/ /usr/share/nginx/html/src/
COPY levels/ /usr/share/nginx/html/levels/
COPY src/php/ /var/www/html/
```

### **Directories Create**
```dockerfile
RUN mkdir -p /var/www/html /usr/share/nginx/html/data
```

### **Permessi Impostati**
```dockerfile
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/www/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/www/html && \
    chmod 775 /usr/share/nginx/html/data
```

---

## 📁 **STRUTTURA FINALE NEL CONTAINER**

```
/usr/share/nginx/html/
├── index.html                 # Pagina principale
├── assets/                    # Asset grafici/audio
│   ├── images/
│   │   ├── backgrounds/       # 11 background files
│   │   ├── grapes/           # 6 grape sprites
│   │   ├── ui/               # 4 UI buttons
│   │   ├── icons/            # 3 icons/logos
│   │   └── effects/          # 1 effects file
│   └── audio/
│       ├── bgm/              # 4 background music
│       └── sfx/              # 8 sound effects
├── src/
│   ├── js/                   # 10 JavaScript files
│   └── css/                  # 2 CSS files
├── levels/                   # 10 level JSON files
└── data/                     # Leaderboard data (writable)

/var/www/html/                # PHP backend
├── get_classifica.php
├── salva_punteggio.php
└── [altri file PHP]
```

---

## 🧪 **TESTING POST-BUILD**

### **Test Container Health**
```bash
# Avvia container
docker run -d --name vendemmia-test \
  -p 8080:80 \
  vendemmia-contesa:latest

# Test health
docker exec vendemmia-test /usr/local/bin/healthcheck.sh

# Test web response
curl -I http://localhost:8080

# Test PHP backend
curl http://localhost:8080/src/php/get_classifica.php

# Cleanup test
docker stop vendemmia-test && docker rm vendemmia-test
```

---

## 🎯 **DEPLOY PRODUCTION**

### **Con Docker Compose**
```bash
# Avvio produzione
docker-compose up -d

# Verifica
docker ps | grep vendemmia-contesa
docker logs vendemmia-contesa
```

### **Senza Docker Compose**
```bash
# Avvio diretto
docker run -d \
  --name vendemmia-contesa \
  --network plv_network \
  -p 80:80 \
  -v $(pwd)/volume:/usr/share/nginx/html/volume \
  vendemmia-contesa:latest
```

---

## 🛠️ **TROUBLESHOOTING**

### **Build Errors**
- ✅ **asset_preview.html not found** → RISOLTO (rimosso dal Dockerfile)
- ✅ **Case mismatch warnings** → RISOLTO (FROM/AS uppercase)
- ✅ **Permission errors** → Chmod 755 impostato nel Dockerfile

### **Runtime Errors**
```bash
# Container non parte
docker logs vendemmia-contesa

# PHP-FPM non funziona
docker exec vendemmia-contesa ps aux | grep php

# Nginx non serve file
docker exec vendemmia-contesa ls -la /usr/share/nginx/html/

# Permessi data directory
docker exec vendemmia-contesa ls -la /usr/share/nginx/html/data/
```

### **Asset Loading Errors**
```bash
# Verifica asset nel container
docker exec vendemmia-contesa find /usr/share/nginx/html/assets -name "*.svg" | head -5

# Test asset accessibility
curl http://localhost:8080/assets/images/grapes/grape_aglianico_normal.svg
```

---

## ✅ **BUILD SUCCESS INDICATORS**

Quando il build è completato con successo, dovresti vedere:
```bash
Successfully built [HASH]
Successfully tagged vendemmia-contesa:latest
```

E quando avvii il container:
```bash
# Healthy container
docker ps
# STATUS dovrebbe essere "Up X minutes (healthy)"

# Successful response
curl -I http://localhost:8080
# HTTP/1.1 200 OK
```

---

**🎉 Il Dockerfile è ora completamente funzionante e pronto per il deploy!**
