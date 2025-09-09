# 🍇 La Vendemmia Contesa - Guida all'Installazione
**Bubble Shooter Mobile-First con Tema Vino Italiano**  
*Versione: 1.1 - Natale 2025 Rosso Macchiato*  
*Comitato "Per Aspera ad Astra" - Pro Loco Venticano*

---

## 📋 **Panoramica del Progetto**

**La Vendemmia Contesa** è un gioco bubble shooter mobile-first completo che celebra la tradizione vinicola italiana. Il gioco include 10 livelli narrativi, 3 varietà di uva (Aglianico, Fiano, Greco), un sistema di classifica e un backend PHP completo.

### 🎮 **Caratteristiche Principali**
- **10 Livelli Narrativi** con ambientazioni italiane autentiche.
- **Design Mobile-First** ottimizzato per smartphone.
- **3 Varietà di Uva**: Aglianico, Fiano, Greco + Acini Macchiati.
- **Meccaniche Uniche**: Terremoti, ombre di uccelli, effetti lunari.
- **Boss Finale**: Il Cuore del Rosso Macchiato.
- **Sistema di Classifica** con backend PHP.
- **Audio Completo**: Musiche di sottofondo ed effetti sonori.

### 📁 **Struttura dei File**
```
la-vendemmia-contesa/
├── index.html
├── src/
│   ├── js/
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── components/
│   │   │   ├── Grape.js
│   │   │   ├── GridManager.js
│   │   │   ├── Shooter.js
│   │   │   └── UIManager.js
│   │   ├── scenes/
│   │   │   ├── MenuScene.js
│   │   │   ├── GameScene.js
│   │   │   └── GameOverScene.js
│   │   └── game.js
│   └── css/
│       ├── main.css
│       └── mobile.css
├── levels/
│   ├── level_1.json
│   ... (fino a level_10.json)
└── assets/
    ├── images/
    │   ├── backgrounds/
    │   ├── grapes/
    │   ├── ui/
    │   ├── icons/
    │   └── effects/
    └── audio/
        ├── bgm/
        └── sfx/
```

---

## 🚀 **Installazione e Avvio**

### **Prerequisiti**
- Un server web con supporto PHP (es. Apache, Nginx).
- Un browser moderno che supporti HTML5/Canvas.

### **1. Installazione**
1.  Copia tutti i file del progetto nella root del tuo server web.
2.  Assicurati che il server abbia i permessi di scrittura per la directory `data/` se vuoi utilizzare la funzionalità di classifica.

### **2. Avvio**
Apri il file `index.html` nel tuo browser. Il gioco dovrebbe avviarsi automaticamente.

---

## 🎮 **Come Giocare**

### **🎯 Obiettivo**
- **Obiettivo**: Eliminare tutti gli "Acini Macchiati".
- **Controlli**: Controlli touch ottimizzati per dispositivi mobili.
- **Meccanica**: Bubble shooter con una griglia esagonale.
- **Condizione di Vittoria**: Tutti gli acini macchiati vengono eliminati.
- **Condizione di Sconfitta**: Gli acini raggiungono la linea rossa.

### **🍇 Varietà di Uva (Autentiche DOC/DOCG)**
- **AGLIANICO**: Rosso scuro - Taurasi DOCG, Aglianico del Taburno.
- **FIANO**: Giallo dorato - Fiano di Avellino DOCG.
- **GRECO**: Verde chiaro - Greco di Tufo DOCG.
- **MACCHIATI**: Acini corrotti da eliminare.

---

## 🔧 **Sviluppo e Debug**

### **Opzioni di Debug**
Modifica il file `src/js/utils/constants.js` per abilitare le opzioni di debug:
```javascript
const DEBUG_CONFIG = {
    SHOW_GRID: true,       // Mostra la griglia
    SHOW_PHYSICS: true,    // Mostra i corpi fisici
    SHOW_FPS: true,        // Mostra gli FPS
    ENABLE_CHEATS: true,   // Abilita i cheat
    LOG_LEVEL: 'DEBUG'     // Livello di log
};
```

---

## 🇮🇹 **Autenticità Culturale Italiana**

### **Regioni Rappresentate**
1.  **Campania** - Taurasi DOCG
2.  **Irpinia** - Greco di Tufo DOCG
3.  **Montefusco** - Fiano di Avellino DOCG
4.  **Vesuvio** - Lacryma Christi DOC
5.  **Benevento** - Falanghina del Sannio DOC
6.  **Cilento** - Aglianico del Cilento DOC
7.  **Amalfi** - Costa d'Amalfi DOC
8.  **Monti Lattari** - Penisola Sorrentina DOC

---

**🎉 La Vendemmia Contesa è pronta per celebrare il Natale 2025!**  
**🍇 Per aspera ad astra - Attraverso le difficoltà, fino alle stelle! 🌟**

*Sviluppato con ❤️ per la comunità italiana e la tradizione vinicola.*
