/**
 * La Vendemmia Contesa - Main Game File
 * Inizializzazione Phaser.js e orchestrazione del gioco
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

// Game instance
let game = null;

/**
 * Game configuration for Phaser.js
 */
const gameConfig = {
    type: Phaser.CANVAS,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-canvas', // HTML element ID where game will be mounted
    backgroundColor: COLORS.UI_DARK,
    
    // Canvas configuration for better compatibility
    canvas: null,
    canvasStyle: null,
    
    // Physics configuration
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: PHYSICS.GRAVITY },
            debug: DEBUG_CONFIG.SHOW_PHYSICS
        }
    },
    
    // Scene configuration
    scene: [
        MenuScene,
        GameScene,
        GameOverScene
    ],
    
    // Scale configuration for mobile responsiveness
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game-canvas',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_CONFIG.WIDTH,
        height: GAME_CONFIG.HEIGHT,
        min: {
            width: GAME_CONFIG.MIN_WIDTH,
            height: GAME_CONFIG.MIN_HEIGHT
        },
        max: {
            width: GAME_CONFIG.MAX_WIDTH,
            height: GAME_CONFIG.MAX_HEIGHT
        }
    },
    
    // Input configuration
    input: {
        activePointers: 1, // Single touch for mobile
        touch: true,
        mouse: true,
        keyboard: DEBUG_CONFIG.ENABLED
    },
    
    // Audio configuration
    audio: {
        disableWebAudio: false
    },
    
    // Rendering options
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false
    },
    
    // Plugin configuration
    plugins: {
        // Add any Phaser plugins here if needed
    },
    
    // Callbacks
    callbacks: {
        preBoot: preBootCallback,
        postBoot: postBootCallback
    }
};

/**
 * Pre-boot callback - called before game starts
 * @param {Phaser.Game} game - The game instance
 */
function preBootCallback() {
    DebugUtils.log('INFO', 'La Vendemmia Contesa - Pre-boot initialization');
    
    // Setup global error handling
    setupErrorHandling();
    
    // Setup mobile-specific configurations
    setupMobileConfiguration();
    
    // Initialize analytics (if needed)
    initializeAnalytics();
}

/**
 * Post-boot callback - called after game starts
 * @param {Phaser.Game} game - The game instance
 */
function postBootCallback(game) {
    DebugUtils.log('INFO', 'La Vendemmia Contesa - Post-boot initialization complete');
    
    // Setup game-wide event listeners
    setupGameEventListeners(game);
    
    // Initialize save system
    initializeSaveSystem();
    
    // Setup performance monitoring
    setupPerformanceMonitoring(game);
    
    // Show game ready notification
    showGameReady();
}

/**
 * Setup global error handling
 */
function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        DebugUtils.log('ERROR', 'Global error:', event.error);
        
        // Send error to analytics if available
        if (window.gtag) {
            gtag('event', 'exception', {
                description: event.error.message,
                fatal: false
            });
        }
        
        // Show user-friendly error message
        showErrorMessage('Si è verificato un errore. Prova a ricaricare la pagina.');
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        DebugUtils.log('ERROR', 'Unhandled promise rejection:', event.reason);
        
        // Prevent default browser error handling
        event.preventDefault();
        
        // Show user-friendly error message
        showErrorMessage('Errore di connessione. Controlla la tua connessione internet.');
    });
}

/**
 * Setup mobile-specific configurations
 */
function setupMobileConfiguration() {
    // Disable context menu on long press (mobile)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Prevent zoom on double tap (mobile)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Prevent scrolling on touch (mobile)
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('#game-container')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Setup viewport meta tag for mobile
    setupMobileViewport();
    
    DebugUtils.log('DEBUG', 'Mobile configuration setup complete');
}

/**
 * Setup mobile viewport
 */
function setupMobileViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no';
}

/**
 * Initialize analytics
 */
function initializeAnalytics() {
    // Google Analytics or other analytics setup
    if (typeof gtag !== 'undefined') {
        gtag('event', 'game_start', {
            event_category: 'gameplay',
            event_label: 'la_vendemmia_contesa'
        });
    }
    
    DebugUtils.log('DEBUG', 'Analytics initialized');
}

/**
 * Setup game-wide event listeners
 * @param {Phaser.Game} game - The game instance
 */
function setupGameEventListeners(game) {
    // Visibility change handling (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            game.scene.pause();
            AudioUtils.setMasterVolume(0);
        } else {
            game.scene.resume();
            const savedVolume = StorageUtils.load('masterVolume', AUDIO_CONFIG.MASTER_VOLUME);
            AudioUtils.setMasterVolume(savedVolume);
        }
    });
    
    // Window focus/blur handling
    window.addEventListener('blur', () => {
        game.scene.pause();
    });
    
    window.addEventListener('focus', () => {
        game.scene.resume();
    });
    
    // Before unload - save game state
    window.addEventListener('beforeunload', () => {
        saveGameState(game);
    });
    
    DebugUtils.log('DEBUG', 'Game event listeners setup complete');
}

/**
 * Initialize save system
 */
function initializeSaveSystem() {
    // Test localStorage availability
    try {
        const testKey = 'vendemmia_test';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        
        DebugUtils.log('INFO', 'Local storage available');
    } catch {
        DebugUtils.log('WARN', 'Local storage not available, using fallback');
        setupFallbackStorage();
    }
}

/**
 * Setup fallback storage when localStorage is not available
 */
function setupFallbackStorage() {
    // Simple in-memory storage fallback
    window.fallbackStorage = {};
    
    // Override StorageUtils methods to use fallback
    StorageUtils.save = function(key, data) {
        try {
            window.fallbackStorage[`vendemmia_${key}`] = JSON.stringify(data);
            return true;
        } catch {
            return false;
        }
    };
    
    StorageUtils.load = function(key, defaultValue = null) {
        try {
            const data = window.fallbackStorage[`vendemmia_${key}`];
            return data ? JSON.parse(data) : defaultValue;
        } catch {
            return defaultValue;
        }
    };
}

/**
 * Setup performance monitoring
 * @param {Phaser.Game} game - The game instance
 */
function setupPerformanceMonitoring() {
    if (!DEBUG_CONFIG.ENABLED) return;
    
    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    
    const monitorPerformance = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 5000) { // Every 5 seconds
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            DebugUtils.log('DEBUG', `Average FPS: ${fps}`);
            
            // Warn if performance is poor
            if (fps < 30) {
                DebugUtils.log('WARN', 'Low performance detected');
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(monitorPerformance);
    };
    
    requestAnimationFrame(monitorPerformance);
}

/**
 * Save current game state
 * @param {Phaser.Game} game - The game instance
 */
function saveGameState(game) {
    try {
        const currentScene = game.scene.getScene('GameScene');
        if (currentScene && currentScene.scene.isActive()) {
            // Save current progress
            StorageUtils.save('currentLevel', currentScene.currentLevel);
            StorageUtils.save('currentScore', currentScene.currentScore);
            StorageUtils.save('lastPlayed', Date.now());
        }
        
        DebugUtils.log('DEBUG', 'Game state saved');
    } catch (error) {
        DebugUtils.log('WARN', 'Failed to save game state:', error);
    }
}

/**
 * Show game ready notification
 */
function showGameReady() {
    // Remove loading overlay if it exists
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
        }, 500);
    }
    
    // Show game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.opacity = '1';
    }
    
    DebugUtils.log('INFO', 'Game ready and visible');
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    // Create or update error message element
    let errorElement = document.getElementById('game-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'game-error';
        errorElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
            max-width: 300px;
        `;
        document.body.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `
        <h3>Errore</h3>
        <p>${message}</p>
        <button onclick="location.reload()" style="
            background: white;
            color: red;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        ">Ricarica Pagina</button>
    `;
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
        }
    }, 10000);
}

/**
 * Initialize game when DOM is ready
 */
function initializeGame() {
    DebugUtils.log('INFO', 'Starting game initialization...');
    
    // Check if game container exists
    const gameContainer = document.getElementById('game-container');
    const gameCanvas = document.getElementById('game-canvas');
    
    if (!gameContainer) {
        DebugUtils.log('ERROR', 'Game container not found!');
        showErrorMessage('Errore di inizializzazione. Controlla che il container del gioco sia presente.');
        return;
    }
    
    if (!gameCanvas) {
        DebugUtils.log('ERROR', 'Game canvas element not found!');
        showErrorMessage('Errore di inizializzazione. Container canvas non trovato.');
        return;
    }
    
    // Check WebGL support
    if (!checkWebGLSupport()) {
        DebugUtils.log('WARN', 'WebGL not supported, falling back to Canvas');
        gameConfig.type = Phaser.CANVAS;
    }
    
    // Create Phaser game instance
    try {
        DebugUtils.log('INFO', 'Creating Phaser game instance...');
        game = new Phaser.Game(gameConfig);
        
        // Store game instance globally for debugging
        if (DEBUG_CONFIG.ENABLED) {
            window.vendemmiaGame = game;
        }
        
        DebugUtils.log('INFO', 'La Vendemmia Contesa initialized successfully');
        
    } catch (error) {
        DebugUtils.log('ERROR', 'Failed to initialize game:', error);
        
        // Try fallback with Canvas renderer
        if (gameConfig.type !== Phaser.CANVAS) {
            DebugUtils.log('INFO', 'Retrying with Canvas renderer...');
            gameConfig.type = Phaser.CANVAS;
            try {
                game = new Phaser.Game(gameConfig);
                DebugUtils.log('INFO', 'Game initialized with Canvas renderer');
            } catch (fallbackError) {
                DebugUtils.log('ERROR', 'Canvas fallback also failed:', fallbackError);
                showErrorMessage('Errore durante l\'inizializzazione del gioco. Browser non supportato.');
            }
        } else {
            showErrorMessage('Errore durante l\'inizializzazione del gioco.');
        }
    }
}

/**
 * Check WebGL support
 */
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
    } catch {
        return false;
    }
}

/**
 * Cleanup game resources
 */
function destroyGame() {
    if (game) {
        game.destroy(true);
        game = null;
        DebugUtils.log('INFO', 'Game destroyed');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    // DOM is already ready
    initializeGame();
}

// Export for use in other modules or global access
window.VendemmiaGame = {
    game: () => game,
    initializeGame,
    destroyGame,
    gameConfig
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        game: () => game,
        initializeGame,
        destroyGame,
        gameConfig
    };
}

// Add console welcome message
console.log(`
🍇 La Vendemmia Contesa 🍇
Versione 1.1 - Natale 2025 Rosso Macchiato
Sviluppato dal Comitato "Per Aspera ad Astra"

Buona fortuna, Vignaiolo!
`);

DebugUtils.log('INFO', 'Game script loaded and ready');
