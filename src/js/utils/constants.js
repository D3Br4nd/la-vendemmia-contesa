/**
 * La Vendemmia Contesa - Game Constants
 * Costanti di gioco per "La Vendemmia Contesa"
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

// Game States
const GAME_STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    LEVEL_TRANSITION: 'LEVEL_TRANSITION',
    GAME_OVER: 'GAME_OVER',
    PAUSED: 'PAUSED'
};

// Grape Types
const GRAPE_TYPES = {
    NORMAL: 'NORMAL',
    MACCHIATO: 'MACCHIATO'
};

// Grape Colors (Varietà vitigni Campani)
const GRAPE_COLORS = {
    AGLIANICO: 'aglianico',
    FIANO: 'fiano',
    GRECO: 'greco'
};

// Grid Configuration
const GRID_CONFIG = {
    COLS: 8,
    ROWS: 12,
    CELL_SIZE: 45,
    OFFSET_X: 22.5, // Half cell size for offset rows
    OFFSET_Y: 50,
    START_Y: 100
};

// Game Configuration
const GAME_CONFIG = {
    WIDTH: 375,  // iPhone portrait width
    HEIGHT: 667, // iPhone portrait height
    BACKGROUND_COLOR: '#2c1810',
    MAX_LIVES: 3,
    POINTS_PER_GRAPE: 10,
    BONUS_MULTIPLIER: 1.5,
    DEATH_LINE_Y: 550 // Line of no return
};

// Physics
const PHYSICS = {
    GRAVITY: 300,
    BOUNCE: 0.3,
    GRAPE_SPEED: 800,
    MIN_MATCH_SIZE: 3
};

// Colors for rendering
const COLORS = {
    [GRAPE_COLORS.AGLIANICO]: 0x722F37, // Dark red
    [GRAPE_COLORS.FIANO]: 0xF4D03F,     // Golden yellow
    [GRAPE_COLORS.GRECO]: 0x58D68D,     // Light green
    MACCHIATO: 0x1C1C1C,                // Dark spots
    UI_PRIMARY: 0x8B4513,               // Saddle brown
    UI_SECONDARY: 0xDEB887,             // Burlywood
    TEXT_PRIMARY: 0xFFFFFF,             // White
    TEXT_SECONDARY: 0xF5DEB3,           // Wheat
    DANGER: 0xFF6B6B,                   // Red warning
    SUCCESS: 0x51CF66                   // Green success
};

// UI Configuration
const UI_CONFIG = {
    HUD_HEIGHT: 80,
    BUTTON_WIDTH: 120,
    BUTTON_HEIGHT: 40,
    FONT_SIZE_LARGE: '32px',
    FONT_SIZE_MEDIUM: '24px',
    FONT_SIZE_SMALL: '18px',
    FONT_FAMILY: 'Georgia, serif',
    PADDING: 20,
    MARGIN: 10
};

// Audio Configuration
const AUDIO_CONFIG = {
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.5,
    SOUNDS: {
        SHOOT: 'shoot',
        POP: 'pop',
        DROP: 'drop',
        LEVEL_COMPLETE: 'level_complete',
        GAME_OVER: 'game_over',
        MENU_CLICK: 'menu_click'
    }
};

// Level Configuration
const LEVEL_CONFIG = {
    TOTAL_LEVELS: 10,
    STORY_PHRASES: [
        "Nel cuore dell'Irpinia, dove i vigneti si perdono tra le colline...",
        "L'antica tradizione vinicola tramanda segreti di generazione in generazione...",
        "Ogni acino racconta una storia di terra, sole e passione...",
        "Il Natale si avvicina e i preparativi fervono nelle cantine...",
        "Ma quest'anno qualcosa di strano sta accadendo ai nostri preziosi grappoli...",
        "Macchie scure appaiono sugli acini più belli, minacciando il raccolto...",
        "Solo un abile vendemmiatore può salvare la tradizione del Rosso Macchiato...",
        "Separa gli acini sani da quelli macchiati con precisione e destrezza...",
        "Ogni mossa conta: la qualità del vino dipende dalla tua abilità...",
        "Il destino del Natale 2025 è nelle tue mani..."
    ]
};

// Touch/Input Configuration
const INPUT_CONFIG = {
    TOUCH_THRESHOLD: 10, // Minimum movement for drag detection
    AIM_LINE_SEGMENTS: 20,
    AIM_LINE_COLOR: 0xFFFFFF,
    AIM_LINE_ALPHA: 0.5,
    DOUBLE_TAP_TIME: 300 // ms
};

// Animation Configuration
const ANIMATION_CONFIG = {
    GRAPE_FALL_DURATION: 800,
    GRAPE_POP_DURATION: 200,
    UI_FADE_DURATION: 500,
    LEVEL_TRANSITION_DURATION: 2000,
    SHOOTER_ROTATION_SPEED: 0.05
};

// Development/Debug
const DEBUG_CONFIG = {
    SHOW_GRID: false,
    SHOW_PHYSICS: false,
    SHOW_FPS: false,
    ENABLE_CHEATS: false,
    LOG_LEVEL: 'INFO' // 'DEBUG', 'INFO', 'WARN', 'ERROR'
};

// API Configuration
const API_CONFIG = {
    BASE_URL: window.location.origin,
    ENDPOINTS: {
        SAVE_SCORE: '/src/php/salva_punteggio.php',
        GET_LEADERBOARD: '/src/php/get_classifica.php'
    },
    TIMEOUT: 5000 // ms
};

// Export all constants
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_STATES,
        GRAPE_TYPES,
        GRAPE_COLORS,
        GRID_CONFIG,
        GAME_CONFIG,
        PHYSICS,
        COLORS,
        UI_CONFIG,
        AUDIO_CONFIG,
        LEVEL_CONFIG,
        INPUT_CONFIG,
        ANIMATION_CONFIG,
        DEBUG_CONFIG,
        API_CONFIG
    };
}
