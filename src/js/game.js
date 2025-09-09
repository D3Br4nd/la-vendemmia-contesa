/**
 * La Vendemmia Contesa - Main Game File
 * Inizializzazione Phaser.js e orchestrazione del gioco
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

// Game instance
let game = null;

// Simple logger for early initialization
const simpleLogger = {
    log(level, ...args) {
        if (typeof window.DebugUtils !== 'undefined') {
            window.DebugUtils.log(level, ...args);
        } else {
            console[level.toLowerCase()](...args);
        }
    }
};

/**
 * Game configuration for Phaser.js
 */
const gameConfig = {
    type: Phaser.CANVAS, // Force Canvas renderer to avoid WebGL issues
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    parent: 'game-canvas', // HTML element ID where game will be mounted
    backgroundColor: '#2c1810', // Use hex color instead of COLORS constant
    
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
    
    // Scene configuration - verify scenes are loaded
    scene: (function() {
        const scenes = [];
        
        // Always add FallbackScene first
        if (typeof window.FallbackScene !== 'undefined') {
            scenes.push(window.FallbackScene);
        }
        
        // Add other scenes if available
        if (typeof window.MenuScene !== 'undefined') scenes.push(window.MenuScene);
        if (typeof window.GameScene !== 'undefined') scenes.push(window.GameScene);
        if (typeof window.GameOverScene !== 'undefined') scenes.push(window.GameOverScene);
        
        if (scenes.length === 0) {
            console.warn('No scenes loaded, using inline fallback scene');
            scenes.push(class InlineFallbackScene extends Phaser.Scene {
                constructor() { super({ key: 'InlineFallbackScene' }); }
                create() {
                    this.add.text(GAME_CONFIG.WIDTH/2, GAME_CONFIG.HEIGHT/2, 
                        'Errore caricamento scene...', 
                        { fontSize: '24px', color: '#ff6b6b' }
                    ).setOrigin(0.5);
                }
            });
        }
        
        simpleLogger.log('INFO', `Loaded ${scenes.length} scenes`);
        return scenes;
    })(),
    
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
    simpleLogger.log('INFO', 'La Vendemmia Contesa - Pre-boot initialization');
    
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
    simpleLogger.log('INFO', 'La Vendemmia Contesa - Post-boot initialization complete');
    
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
    
    simpleLogger.log('DEBUG', 'Mobile configuration setup complete');
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
    
    simpleLogger.log('DEBUG', 'Analytics initialized');
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
    
    simpleLogger.log('DEBUG', 'Game event listeners setup complete');
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
        
        simpleLogger.log('INFO', 'Local storage available');
    } catch {
        simpleLogger.log('WARN', 'Local storage not available, using fallback');
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
            simpleLogger.log('DEBUG', `Average FPS: ${fps}`);
            
            // Warn if performance is poor
            if (fps < 30) {
                simpleLogger.log('WARN', 'Low performance detected');
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
        
        simpleLogger.log('DEBUG', 'Game state saved');
    } catch (error) {
        simpleLogger.log('WARN', 'Failed to save game state:', error);
    }
}

/**
 * Show game ready notification
 */
function showGameReady() {
    // Remove loading screen if it exists
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }
    
    // Show game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.opacity = '1';
    }
    
    simpleLogger.log('INFO', 'Game ready and visible');
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
 * Check if all required scripts are loaded
 */
function checkScriptsLoaded() {
    const requiredClasses = ['FallbackScene', 'DebugUtils'];
    const optionalClasses = ['MenuScene', 'GameScene', 'GameOverScene'];
    
    // Check required classes
    const requiredLoaded = requiredClasses.every(className => typeof window[className] !== 'undefined');
    
    // Check how many optional classes are loaded
    const optionalLoaded = optionalClasses.filter(className => typeof window[className] !== 'undefined').length;
    
    simpleLogger.log('DEBUG', `Required loaded: ${requiredLoaded}, Optional loaded: ${optionalLoaded}/${optionalClasses.length}`);
    
    // We need at least the required classes
    return requiredLoaded;
}

/**
 * Initialize game when DOM is ready
 */
function initializeGame() {
    simpleLogger.log('INFO', 'Starting game initialization...');
    
    // Check if all scripts are loaded
    if (!checkScriptsLoaded()) {
        simpleLogger.log('WARN', 'Not all scripts loaded yet, retrying in 100ms');
        setTimeout(initializeGame, 100);
        return;
    }
    
    // Check if game container exists
    const gameContainer = document.getElementById('game-container');
    const gameCanvas = document.getElementById('game-canvas');
    
    if (!gameContainer) {
        simpleLogger.log('ERROR', 'Game container not found!');
        showErrorMessage('Errore di inizializzazione. Controlla che il container del gioco sia presente.');
        return;
    }
    
    if (!gameCanvas) {
        simpleLogger.log('ERROR', 'Game canvas element not found!');
        showErrorMessage('Errore di inizializzazione. Container canvas non trovato.');
        return;
    }
    
    // Always use Canvas renderer for maximum compatibility
    gameConfig.type = Phaser.CANVAS;
    simpleLogger.log('INFO', 'Using Canvas renderer for maximum compatibility');
    
    // Create Phaser game instance
    try {
        simpleLogger.log('INFO', 'Creating Phaser game instance...');
        game = new Phaser.Game(gameConfig);
        
        // Store game instance globally for debugging
        if (DEBUG_CONFIG.ENABLED) {
            window.vendemmiaGame = game;
        }
        
        simpleLogger.log('INFO', 'La Vendemmia Contesa initialized successfully');
        
    } catch (error) {
        simpleLogger.log('ERROR', 'Failed to initialize game:', error);
        
        // Try fallback with Canvas renderer
        if (gameConfig.type !== Phaser.CANVAS) {
            simpleLogger.log('INFO', 'Retrying with Canvas renderer...');
            gameConfig.type = Phaser.CANVAS;
            try {
                game = new Phaser.Game(gameConfig);
                simpleLogger.log('INFO', 'Game initialized with Canvas renderer');
            } catch (fallbackError) {
                simpleLogger.log('ERROR', 'Canvas fallback also failed:', fallbackError);
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
    } catch (error) {
        simpleLogger.log('WARN', 'WebGL check failed:', error);
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
        simpleLogger.log('INFO', 'Game destroyed');
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

simpleLogger.log('INFO', 'Game script loaded and ready');
