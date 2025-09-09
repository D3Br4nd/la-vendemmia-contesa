# 🚀 Comandi Docker Semplificati
**La Vendemmia Contesa - Build Commands**

## 📋 **COMANDI PRINCIPALI (SEMPLIFICATI)**

### **🔨 Build Standard**
```bash
# Build normale (raccomandato)
docker build -t vendemmia-contesa:latest .
```

### **🔨 Build Clean (Se Problemi)**
```bash
# Build con cache pulita
docker build --no-cache -t vendemmia-contesa:latest .
```

### **🚀 Deploy**
```bash
# Avvio container
docker-compose up -d

# Verifica
docker ps | grep vendemmia-contesa
docker logs vendemmia-contesa
```

### **🔧 Fix e Restart Automatico**
```bash
# Script automatico (include tutti i fix)
./docker-fix.sh
```

---

## 📊 **OUTPUT ATTESO**

### **Build Success:**
```
Successfully built [HASH]
Successfully tagged vendemmia-contesa:latest
```

### **Container Running:**
```
vendemmia-contesa  Up X seconds (healthy)
```

### **Logs Puliti:**
```
INFO success: nginx entered RUNNING state
INFO success: php-fpm entered RUNNING state
```

---

## 🎯 **NOTE IMPORTANTI**

### **❌ EVITARE:**
- `--target production` (non più necessario)
- Versioni obsolete di docker-compose
- Build senza correzioni nginx

### **✅ USARE:**
- Build standard senza target
- Docker Compose senza version
- Script di fix automatico per problemi

### **🔍 DEBUG:**
```bash
# Se container non parte
docker logs vendemmia-contesa

# Se nginx ha errori
docker exec vendemmia-contesa nginx -t

# Se PHP non funziona
docker exec vendemmia-contesa php -v
```

---

**🍇 Comandi Docker ora semplificati e funzionanti!** 🚀
