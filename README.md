# 🍇 Setup Manuale - La Vendemmia Contesa

## Prerequisiti e Configurazione di Base

Prima di iniziare, verifica di avere:
- **Docker** installato e funzionante
- **Docker Compose** installato
- **Nginx Proxy Manager** già configurato sulla rete `plv_network`
- **Accesso** alla directory del progetto

## 1. Configurazione Iniziale

### Verifica Rete Docker PLV
Prima di tutto, assicurati che la rete Docker esista:

```bash
# Verifica che la rete plv_network esista
docker network ls | grep plv_network
```

Se non esiste, contatta l'amministratore di sistema che gestisce gli altri servizi ProLoco.

### Setup Directory e Permessi
```bash
# Vai nella directory del progetto
cd /Users/debrand/Desktop/tmp/la-vendemmia-contesa

# Crea le directory necessarie
mkdir -p volume/data
mkdir -p logs
mkdir -p backups

# Imposta i permessi corretti
chmod 755 volume
chmod 755 volume/data
chmod 755 logs
```

### Copia il Codice nell'Area Live
```bash
# Copia tutti i file necessari nell'area volume (live editing)
cp -r assets data levels src index.html asset_preview.html volume/ 2>/dev/null || true

# Imposta permessi per il web server
chmod -R 755 volume
```

## 2. Configurazione Environment

### Crea File .env
```bash
# Copia il template di configurazione
cp env.example .env

# Modifica la configurazione
nano .env
```

### Configurazione .env Personalizzata
Edita il file `.env` con i valori appropriati:

```bash
# ===== CONFIGURAZIONE BASE =====
NGINX_HOST=rm.prolocoventicano.com
NGINX_PORT=80
TZ=Europe/Rome

# ===== CONFIGURAZIONE GIOCO =====
GAME_NAME="La Vendemmia Contesa"
GAME_VERSION=1.0
NODE_ENV=production

# ===== CORS E SICUREZZA =====
ALLOWED_ORIGINS=https://rm.prolocoventicano.com,http://rm.prolocoventicano.com
MAX_SCORES_PER_IP=3
SCORE_COOLDOWN=30

# ===== FUNZIONALITÀ =====
LEADERBOARD_ENABLED=true
MAINTENANCE_MODE=false

# ===== BRANDING =====
GAME_TITLE="La Vendemmia Contesa"
GAME_SUBTITLE="Natale 2025 - Rosso Macchiato"
ORGANIZATION="Comitato Per Aspera ad Astra - ProLoco Venticano"
```

## 3. Build dell'Immagine Docker

### Build Immagine di Produzione
```bash
# Build dell'immagine con target produzione
docker build --target production -t vendemmia-contesa:latest .

# Verifica che l'immagine sia stata creata
docker images | grep vendemmia-contesa
```

### Opzionale: Build Immagine Development
Se vuoi testare in modalità sviluppo:
```bash
# Build immagine development (con tools aggiuntivi)
docker build --target development -t vendemmia-contesa:dev .
```

## 4. Avvio dei Container

### Modalità Produzione
```bash
# Avvia il container in background
docker-compose -f docker-compose.yml up -d

# Verifica che sia avviato correttamente
docker ps | grep vendemmia-contesa
```

### Modalità Development (Opzionale)
Per sviluppo con live reload:
```bash
# Avvia environment di sviluppo
docker-compose -f docker-compose.dev.yml up -d

# Accesso su http://localhost:8080
```

## 5. Configurazione Nginx Proxy Manager

Nel tuo **Nginx Proxy Manager**, configura:

### Proxy Host Settings
- **Domain Names**: `rm.prolocoventicano.com`
- **Scheme**: `http` (interno)
- **Forward Hostname/IP**: `vendemmia-contesa`
- **Forward Port**: `80`
- **Websockets Support**: `❌ No` (non necessario)

### Advanced Settings
```nginx
# Headers personalizzati se necessario
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header Host $host;
```

### SSL Settings
- **SSL Certificate**: `Request a new SSL Certificate`
- **Force SSL**: `✅ Sì`
- **HTTP/2 Support**: `✅ Sì`
- **Email**: Il tuo email per Let's Encrypt

## 6. Verifica Funzionamento

### Test Container
```bash
# Verifica health del container
docker exec vendemmia-contesa /usr/local/bin/healthcheck.sh

# Controlla i log
docker logs vendemmia-contesa

# Test risposta diretta del container
docker exec vendemmia-contesa curl -f http://localhost/
```

### Test API Backend
```bash
# Test endpoint classifica
curl -X GET "http://localhost/src/php/get_classifica.php" \
  -H "Content-Type: application/json"

# Dovrebbe restituire JSON con success: true
```

### Test Dominio Esterno
```bash
# Test tramite NPM (sostituisci con il tuo dominio)
curl -I https://rm.prolocoventicano.com

# Dovrebbe restituire HTTP/2 200
```

## 7. Gestione Operativa

### Visualizzare Log
```bash
# Log del container
docker logs -f vendemmia-contesa

# Log Nginx (se montati)
tail -f ./logs/access.log
tail -f ./logs/error.log
```

### Riavvio Container
```bash
# Riavvio gentile
docker-compose restart

# Riavvio completo
docker-compose down
docker-compose up -d
```

### Aggiornamento Live
```bash
# Modifica file in ./volume/
nano volume/index.html

# I cambiamenti sono immediatamente visibili!
# Refresh del browser per vedere le modifiche
```

### Backup Dati
```bash
# Backup della classifica
cp volume/data/classifica.csv backups/classifica-$(date +%Y%m%d-%H%M%S).csv

# Backup completo volume
tar -czf backups/volume-backup-$(date +%Y%m%d-%H%M%S).tar.gz volume/
```

## 8. Troubleshooting

### Container Non Parte
```bash
# Verifica configurazione
docker-compose config

# Verifica rete
docker network inspect plv_network

# Build forzato
docker-compose build --no-cache
docker-compose up -d
```

### Problemi Permessi File
```bash
# Ripristina permessi
chmod -R 755 volume/
chown -R $USER:$USER volume/

# Verifica all'interno del container
docker exec vendemmia-contesa ls -la /usr/share/nginx/html/data/
```

### NPM Non Raggiunge Container
```bash
# Verifica che container sia sulla rete giusta
docker inspect vendemmia-contesa | grep plv_network

# Test connettività dalla rete
docker run --rm --network=plv_network alpine wget -qO- http://vendemmia-contesa/
```

### Errori PHP
```bash
# Log errori PHP
docker exec vendemmia-contesa tail -f /var/log/php_errors.log

# Test PHP-FPM
docker exec vendemmia-contesa pgrep -f php-fpm
```

## 9. Gestione Asset

### Aggiunta Nuovi Asset
```bash
# Copia asset nella directory live
cp nuovo-asset.jpg volume/assets/images/backgrounds/

# Verifica permessi
chmod 644 volume/assets/images/backgrounds/nuovo-asset.jpg

# Asset immediatamente disponibile al gioco!
```

### Conversione SVG → PNG (Se Necessario)
```bash
# Se hai ImageMagick installato
brew install imagemagick

# Converti SVG in PNG
cd volume/assets/images/grapes
for file in *.svg; do
    convert "$file" -resize 64x64 "${file%.svg}.png"
done
```

## 10. Modalità Manutenzione

### Attivare Manutenzione
```bash
# Modifica .env
nano .env

# Cambia
MAINTENANCE_MODE=true
MAINTENANCE_MESSAGE="Manutenzione in corso. Torna tra 10 minuti!"

# Riavvia
docker-compose restart
```

### Stato Container e Risorse
```bash
# Uso risorse
docker stats vendemmia-contesa

# Spazio disco
du -sh volume/
df -h
```

## 11. Deploy Completo - Checklist

### Pre-Deploy
- [ ] Rete `plv_network` esistente
- [ ] File `.env` configurato correttamente  
- [ ] Directory `volume/` popolata con asset
- [ ] Build immagine Docker completato

### Deploy
- [ ] `docker-compose up -d` eseguito con successo
- [ ] Container healthy (`docker ps` mostra UP)
- [ ] NPM configurato per `rm.prolocoventicano.com`
- [ ] Certificato SSL attivo

### Post-Deploy
- [ ] Sito raggiungibile da browser
- [ ] API `/src/php/get_classifica.php` risponde
- [ ] Test salvataggio punteggio funziona
- [ ] Asset grafici caricano correttamente
- [ ] Log non mostrano errori critici

## 12. Comandi Rapidi di Riferimento

```bash
# === COMANDI ESSENZIALI ===

# Setup iniziale completo
cp env.example .env && nano .env
mkdir -p volume/data logs backups
cp -r assets data levels src index.html volume/
chmod -R 755 volume

# Build e avvio
docker build --target production -t vendemmia-contesa:latest .
docker-compose up -d

# Verifica stato
docker ps | grep vendemmia-contesa
docker logs vendemmia-contesa

# Riavvio
docker-compose restart

# Backup
cp volume/data/classifica.csv backups/classifica-$(date +%Y%m%d).csv

# Stop completo
docker-compose down
```

---

**🎯 Con questi comandi hai il controllo completo del progetto senza dipendenze da Makefile!**

La configurazione è progettata per integrarsi perfettamente con il tuo Nginx Proxy Manager esistente.