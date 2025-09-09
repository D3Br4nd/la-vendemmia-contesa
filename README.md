# 🍇 La Vendemmia Contesa - Game Setup Guide
**Bubble Shooter Mobile-First con Tema Vino Italiano**  
*Versione: 1.1 - Natale 2025 Rosso Macchiato*  
*Comitato "Per Aspera ad Astra" - Pro Loco Venticano*

---

## 📋 **Panoramica Progetto**

**La Vendemmia Contesa** è un gioco bubble shooter mobile-first completamente sviluppato che celebra la tradizione vinicola italiana. Il gioco include 10 livelli narrativi, 3 varietà di uva (Aglianico, Fiano, Greco), sistema di classifica e backend PHP completo.

### 🎮 **Caratteristiche Principali**
- **10 Livelli Narrativi** con ambientazioni italiane autentiche
- **Mobile-First Design** ottimizzato per smartphone
- **3 Varietà Uva**: Aglianico, Fiano, Greco + Acini Macchiati
- **Meccaniche Uniche**: Terremoti, ombre uccelli, effetti lunari
- **Boss Fight Finale**: Il Cuore del Rosso Macchiato
- **Sistema Classifica** con backend PHP
- **Audio Completo**: Musiche di sottofondo + effetti sonori

### 📁 **Struttura Files (24 Files Completati)**
```
la-vendemmia-contesa/
├── index.html                    # Pagina principale
├── .gitignore                   # Git ignore professionale
├── ASSET_REFERENCE.md           # Documentazione asset
│
├── src/
│   ├── js/
│   │   ├── utils/
│   │   │   ├── constants.js     # Costanti gioco
│   │   │   └── helpers.js       # Funzioni utilità
│   │   ├── components/
│   │   │   ├── Grape.js         # Classe acino
│   │   │   ├── GridManager.js   # Gestione griglia
│   │   │   ├── Shooter.js       # Sistema lancio
│   │   │   └── UIManager.js     # Interfaccia utente
│   │   ├── scenes/
│   │   │   ├── MenuScene.js     # Menu principale
│   │   │   ├── GameScene.js     # Gioco principale
│   │   │   └── GameOverScene.js # Game over
│   │   └── game.js             # Inizializzazione Phaser.js
│   │
│   └── css/
│       ├── main.css            # Stili principali
│       └── mobile.css          # Ottimizzazioni mobile
│
├── levels/                     # Configurazioni livelli
│   ├── level_1.json           # L'Inizio della Vendemmia
│   ├── level_2.json           # Il Vento del Nord
│   ├── level_3.json           # I Grappoli Alti
│   ├── level_4.json           # Il Sussurro delle Foglie
│   ├── level_5.json           # La Luna Piena
│   ├── level_6.json           # Il Tremore della Terra
│   ├── level_7.json           # Le Radici Profonde
│   ├── level_8.json           # Il Tramonto Rosso
│   ├── level_9.json           # L'Ombra degli Uccelli
│   └── level_10.json          # L'Ultima Battaglia
│
└── assets/                    # Asset grafici e audio
    ├── images/
    │   ├── backgrounds/       # Sfondi livelli (11 files)
    │   ├── grapes/           # Sprite acini (6 files)
    │   ├── ui/               # Elementi UI (4 files)
    │   ├── icons/            # Loghi e icone (3 files)
    │   └── effects/          # Effetti animazione
    └── audio/
        ├── bgm/              # Musiche sottofondo (4 files)
        └── sfx/              # Effetti sonori (8 files)
```

---

## 🚀 **Setup e Deploy**

### **Prerequisiti**
- **Docker** e **Docker Compose** installati
- **Nginx Proxy Manager** configurato sulla rete `plv_network`
- **Browser moderno** con supporto HTML5/Canvas

### **1. Configurazione Iniziale**

```bash
# Clona/scarica il progetto
cd /path/to/la-vendemmia-contesa

# Verifica rete Docker PLV
docker network ls | grep plv_network

# Crea directory necessarie
mkdir -p volume/data logs backups
chmod -R 755 volume logs
```

### **2. Configurazione Environment**

```bash
# Copia e modifica configurazione
cp env.example .env
nano .env
```

**Configurazione .env essenziale:**
```bash
# Dominio e server
NGINX_HOST=rm.prolocoventicano.com
NGINX_PORT=80
TZ=Europe/Rome

# Gioco
GAME_NAME="La Vendemmia Contesa"
GAME_VERSION=1.1
NODE_ENV=production

# Sicurezza
ALLOWED_ORIGINS=https://rm.prolocoventicano.com
LEADERBOARD_ENABLED=true
MAINTENANCE_MODE=false

# Branding
GAME_TITLE="La Vendemmia Contesa"
GAME_SUBTITLE="Natale 2025 - Rosso Macchiato"
ORGANIZATION="Comitato Per Aspera ad Astra"
```

### **3. Build e Deploy**

```bash
# Build immagine Docker
docker build --target production -t vendemmia-contesa:latest .

# Avvio container
docker-compose up -d

# Verifica stato
docker ps | grep vendemmia-contesa
docker logs vendemmia-contesa
```

### **4. Configurazione Nginx Proxy Manager**

**Proxy Host Settings:**
- **Domain**: `rm.prolocoventicano.com`
- **Scheme**: `http`
- **Forward Host**: `vendemmia-contesa`
- **Forward Port**: `80`
- **SSL**: Let's Encrypt + Force SSL

---

## 🎮 **Funzionalità Gioco**

### **🎯 Gameplay Core**
- **Obiettivo**: Eliminare tutti gli "Acini Macchiati" 
- **Controlli**: Touch mobile ottimizzati
- **Meccanica**: Bubble shooter con griglia esagonale
- **Condizione Vittoria**: Tutti i macchiati eliminati
- **Condizione Sconfitta**: Acini raggiungono linea rossa

### **🍇 Varietà Uva (Autentiche DOC/DOCG)**
- **AGLIANICO**: Rosso scuro - Taurasi DOCG, Aglianico del Taburno
- **FIANO**: Giallo dorato - Fiano di Avellino DOCG  
- **GRECO**: Verde chiaro - Greco di Tufo DOCG
- **MACCHIATI**: Acini corrotti da eliminare

### **🏆 Sistema Progressione**
- **10 Livelli** con difficoltà crescente
- **Narrativa Italiana** per ogni livello
- **Meccaniche Speciali**:
  - Livello 5: Effetti luna piena
  - Livello 6: Terremoti vesuviani
  - Livello 7: Radici sotterranee
  - Livello 8: Camuffamento tramonto
  - Livello 9: Ombre uccelli mobili
  - Livello 10: Boss fight finale

### **📱 Mobile Optimization**
- **Portrait Mode** ottimizzato
- **Touch Controls** con una mano
- **Safe Area Support** per iPhone notch
- **Performance Mobile** con hardware acceleration
- **Responsive Design** 360px → tablet

---

## 🔧 **Sviluppo e Debug**

### **Modalità Development**
```bash
# Build development
docker build --target development -t vendemmia-contesa:dev .

# Avvio con live reload
docker-compose -f docker-compose.dev.yml up -d

# Accesso: http://localhost:8080
```

### **Debug Options**
Nel codice `constants.js`:
```javascript
const DEBUG_CONFIG = {
    ENABLED: true,          // Abilita debug
    SHOW_GRID: true,       // Mostra griglia
    SHOW_FPS: true,        // Mostra FPS
    LOG_LEVEL: 'DEBUG'     // Livello log
};
```

### **Live Editing**
```bash
# Modifica asset live
cp nuovo-asset.png volume/assets/images/grapes/
# Ricarica browser - cambiamenti immediatamente visibili!

# Modifica livelli
nano volume/levels/level_1.json
# Restart livello per vedere modifiche
```

---

## 🎵 **Asset e Multimedia**

### **🎨 Asset Grafici (26 Files)**
- **Backgrounds**: 1 menu + 10 livelli specifici
- **Grapes**: 6 texture SVG (3 normali + 3 macchiati)
- **UI**: 4 bottoni SVG + 3 loghi/icone
- **Effects**: JSON animazioni particelle

### **🎵 Asset Audio (12 Files)**
- **BGM**: Menu, Game, Level Complete, Game Over
- **SFX**: Launch, Match, Explosion, Bounce, ecc.

### **Formato Asset**
- **Grafici**: SVG (scalabili), JPG (backgrounds), PNG (icons)
- **Audio**: WAV (compatibilità massima), 44.1kHz
- **Configurazioni**: JSON (livelli), CSS/JS (codice)

---

## 🛡️ **Sicurezza e Performance**

### **Sicurezza**
- **CORS Protection** con domini allowlist
- **Rate Limiting** su API classifica
- **Input Sanitization** su save score
- **No sensitive data** in frontend

### **Performance**
- **Asset Optimization** con lazy loading
- **Mobile Hardware Acceleration** 
- **Memory Management** con object pooling
- **Progressive Loading** degli asset

### **Backup**
```bash
# Backup classifica
cp volume/data/classifica.csv backups/classifica-$(date +%Y%m%d).csv

# Backup completo
tar -czf backups/full-backup-$(date +%Y%m%d).tar.gz volume/
```

---

## 🎯 **Testing e Verifica**

### **Test Funzionalità**
```bash
# Test health container
docker exec vendemmia-contesa /usr/local/bin/healthcheck.sh

# Test API classifica
curl -X GET "http://localhost/src/php/get_classifica.php"

# Test dominio esterno
curl -I https://rm.prolocoventicano.com
```

### **Test Mobile**
- **Chrome DevTools**: Device simulation
- **Safari iOS**: Remote debugging
- **Touch Events**: Gesture testing
- **Performance**: FPS monitoring

---

## 📚 **Documentazione Tecnica**

### **Architecture Pattern**
- **Component-Based**: Grape, GridManager, Shooter, UIManager
- **Scene Management**: Menu → Game → GameOver
- **Event-Driven**: Touch input → Physics → Audio feedback
- **Mobile-First**: Touch controls, responsive UI

### **Key Technologies**
- **Phaser.js 3**: Game engine
- **HTML5 Canvas**: Rendering
- **CSS Grid/Flexbox**: Responsive layout
- **PHP**: Backend classifica
- **Docker**: Containerization
- **Nginx**: Web server

### **Code Standards**
- **ES6+** JavaScript con moduli
- **JSDoc** documentation completa
- **Mobile-first** CSS con media queries
- **Semantic HTML5** structure
- **RESTful** API design

---

## 🇮🇹 **Autenticità Culturale Italiana**

### **Regioni Rappresentate**
1. **Campania** - Taurasi DOCG
2. **Irpinia** - Greco di Tufo DOCG  
3. **Montefusco** - Fiano di Avellino DOCG
4. **Vesuvio** - Lacryma Christi DOC
5. **Benevento** - Falanghina del Sannio DOC
6. **Cilento** - Aglianico del Cilento DOC
7. **Amalfi** - Costa d'Amalfi DOC
8. **Monti Lattari** - Penisola Sorrentina DOC

### **Elementi Tradizionali**
- **Proverbi Contadini**: "Vento del nord, vino d'oro"
- **Tradizioni**: Vendemmia notturna, raccolta sui terrazzamenti
- **Folklore**: Leggende delle radici profonde
- **Dialetti**: Espressioni regionali autentiche

---

## 🏆 **Deploy Checklist**

### **Pre-Deploy**
- [ ] ✅ Codice completo (24 files)
- [ ] ✅ Asset mappati correttamente
- [ ] ✅ Docker build successful
- [ ] ✅ Environment configurato
- [ ] ✅ Rete Docker PLV verificata

### **Deploy**
- [ ] Container running (docker ps)
- [ ] Health check passing
- [ ] NPM proxy configurato
- [ ] SSL certificato attivo
- [ ] Backup strategy implementata

### **Post-Deploy**
- [ ] Sito raggiungibile pubblicamente
- [ ] API classifica funzionante
- [ ] Audio/video caricano correttamente
- [ ] Mobile testing completato
- [ ] Performance monitoring attivo

---

## 📞 **Supporto**

### **Log e Debugging**
```bash
# Log container
docker logs -f vendemmia-contesa

# Log web server
tail -f logs/access.log
tail -f logs/error.log

# Test PHP
docker exec vendemmia-contesa php -v
```

### **Comandi Rapidi**
```bash
# Riavvio veloce
docker-compose restart

# Reset completo
docker-compose down && docker-compose up -d

# Backup express
cp volume/data/classifica.csv backups/backup-$(date +%H%M%S).csv
```

---

**🎉 La Vendemmia Contesa è pronta per celebrare il Natale 2025!**  
**🍇 Per aspera ad astra - Attraverso le difficoltà alle stelle! 🌟**

*Sviluppato con ❤️ per la comunità italiana e la tradizione vinicola*
