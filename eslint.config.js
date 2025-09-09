const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        Phaser: "readonly",
        GAME_STATES: "readonly",
        GRAPE_TYPES: "readonly",
        GRAPE_COLORS: "readonly",
        GRID_CONFIG: "readonly",
        GAME_CONFIG: "readonly",
        PHYSICS: "readonly",
        COLORS: "readonly",
        UI_CONFIG: "readonly",
        AUDIO_CONFIG: "readonly",
        LEVEL_CONFIG: "readonly",
        INPUT_CONFIG: "readonly",
        ANIMATION_CONFIG: "readonly",
        DEBUG_CONFIG: "readonly",
        API_CONFIG: "readonly",
        MathUtils: "readonly",
        GridUtils: "readonly",
        ColorUtils: "readonly",
        ArrayUtils: "readonly",
        InputUtils: "readonly",
        UIUtils: "readonly",
        StorageUtils: "readonly",
        DebugUtils: "readonly",
        AudioUtils: "readonly",
        Grape: "readonly",
        GridManager: "readonly",
        Shooter: "readonly",
        UIManager: "readonly",
        MenuScene: "readonly",
        GameScene: "readonly",
        GameOverScene: "readonly",
        SHOOTER_CONFIG: "readonly",
        gtag: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn"
    }
  }
];
