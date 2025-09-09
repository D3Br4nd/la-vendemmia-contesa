module.exports = [
  {
    files: ["src/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        // Phaser
        Phaser: "readonly",
        // Game Scenes
        MenuScene: "writable",
        GameScene: "writable",
        GameOverScene: "writable",
        // Game Components
        Grape: "writable",
        GridManager: "writable",
        Shooter: "writable",
        UIManager: "writable",
        // Constants from constants.js
        GAME_STATES: "writable",
        GRAPE_TYPES: "writable",
        GRAPE_COLORS: "writable",
        GRID_CONFIG: "writable",
        GAME_CONFIG: "writable",
        PHYSICS: "writable",
        COLORS: "writable",
        UI_CONFIG: "writable",
        AUDIO_CONFIG: "writable",
        LEVEL_CONFIG: "writable",
        INPUT_CONFIG: "writable",
        ANIMATION_CONFIG: "writable",
        DEBUG_CONFIG: "writable",
        API_CONFIG: "writable",
        SHOOTER_CONFIG: "writable",
        // Helpers from helpers.js
        MathUtils: "writable",
        GridUtils: "writable",
        ColorUtils: "writable",
        ArrayUtils: "writable",
        InputUtils: "writable",
        UIUtils: "writable",
        StorageUtils: "writable",
        DebugUtils: "writable",
        AudioUtils: "writable",
        // Game main object
        VendemmiaGame: "writable",
        // Browser
        window: "readonly",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        gtag: "readonly",
        performance: "readonly",
        location: "readonly",
        fetch: "readonly",
        module: "readonly"
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-redeclare": "error"
    },
  },
];
