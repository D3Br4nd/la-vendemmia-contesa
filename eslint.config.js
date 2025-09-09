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
        MenuScene: "readonly",
        GameScene: "readonly",
        GameOverScene: "readonly",
        // Game Components
        Grape: "readonly",
        GridManager: "readonly",
        Shooter: "readonly",
        UIManager: "readonly",
        // Utils
        GAME_CONFIG: "readonly",
        COLORS: "readonly",
        PHYSICS: "readonly",
        GRID: "readonly",
        GRAPE_TYPES: "readonly",
        SHOOTER_CONFIG: "readonly",
        UI_SETTINGS: "readonly",
        AUDIO_CONFIG: "readonly",
        LEVELS_CONFIG: "readonly",
        DEBUG_CONFIG: "readonly",
        MathUtils: "readonly",
        GridUtils: "readonly",
        UIUtils: "readonly",
        AudioUtils: "readonly",
        StorageUtils: "readonly",
        DebugUtils: "readonly",
        // Game main object
        VendemmiaGame: "readonly",
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
        location: "readonly"
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
