/**
 * La Vendemmia Contesa - Menu Scene
 * Scena del menu principale
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

window.MenuScene = class MenuScene extends Phaser.Scene {
    /**
     * Constructor for MenuScene
     */
    constructor() {
        super({ key: 'MenuScene' });
        
        this.uiManager = null;
        this.backgroundMusic = null;
        this.menuElements = {};
        this.isTransitioning = false;
    }

    /**
     * Preload assets for menu
     */
    preload() {
        // Load menu-specific assets
        this.loadAssets();
        
        // Show loading progress
        this.showLoadingScreen();
    }

    /**
     * Load game assets
     */
    loadAssets() {
        // Set base path for assets
        this.load.setBaseURL('assets/');
        
        // Background images
        this.load.image('menu_background', 'images/backgrounds/bg_vineyard_main.svg');
        this.load.image('background_game', 'images/backgrounds/bg_level_01.jpg');
        
        // Logo and UI elements
        this.load.image('logo', 'images/icons/logo_vendemmia_contesa.png');
        this.load.image('app_icon', 'images/icons/icon_app_512.png');
        this.load.image('proloco_logo', 'images/icons/logo_proloco_venticano.png');
        
        // UI Buttons
        this.load.image('btn_play', 'images/ui/btn_play_normal.svg');
        this.load.image('btn_menu', 'images/ui/btn_menu_normal.svg');
        this.load.image('btn_pause', 'images/ui/btn_pause_normal.svg');
        this.load.image('btn_save_score', 'images/ui/btn_save_score_normal.svg');
        
        // Grape textures - Normal varieties
        this.load.image('grape_aglianico', 'images/grapes/grape_aglianico_normal.svg');
        this.load.image('grape_fiano', 'images/grapes/grape_fiano_normal.svg');
        this.load.image('grape_greco', 'images/grapes/grape_greco_normal.svg');
        
        // Grape textures - Macchiato varieties
        this.load.image('grape_aglianico_macchiato', 'images/grapes/grape_aglianico_macchiato.svg');
        this.load.image('grape_fiano_macchiato', 'images/grapes/grape_fiano_macchiato.svg');
        this.load.image('grape_greco_macchiato', 'images/grapes/grape_greco_macchiato.svg');
        
        // Effects and particles
        this.load.json('explosion_anim', 'images/effects/explosion_anim.json');
        
        // Level backgrounds
        for (let i = 1; i <= 10; i++) {
            this.load.image(`bg_level_${i.toString().padStart(2, '0')}`, `images/backgrounds/bg_level_${i.toString().padStart(2, '0')}.jpg`);
        }
        
        // Background Music
        this.load.audio('menu_music', 'audio/bgm/bgm_menu_theme.wav');
        this.load.audio('game_music', 'audio/bgm/bgm_gameplay_loop.wav');
        this.load.audio('level_complete_music', 'audio/bgm/bgm_level_complete.wav');
        this.load.audio('game_over_music', 'audio/bgm/bgm_game_over.wav');
        
        // Sound Effects
        this.load.audio('grape_launch', 'audio/sfx/sfx_grape_launch.wav');
        this.load.audio('grape_match', 'audio/sfx/sfx_grape_match.wav');
        this.load.audio('grape_explosion', 'audio/sfx/sfx_grape_explosion.wav');
        this.load.audio('grape_bounce', 'audio/sfx/sfx_grape_bounce.wav');
        this.load.audio('macchiato_drop', 'audio/sfx/sfx_macchiato_drop.wav');
        this.load.audio('button_click', 'audio/sfx/sfx_button_click.wav');
        this.load.audio('level_complete', 'audio/sfx/sfx_level_complete.wav');
        this.load.audio('game_over', 'audio/sfx/sfx_game_over.wav');
        
        // Set up progress tracking
        this.load.on('progress', (value) => {
            this.updateLoadingProgress(value);
        });
        
        this.load.on('complete', () => {
            this.assetsLoaded = true;
        });
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        // Loading background
        this.loadingBg = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT, 
            COLORS.UI_DARK
        );
        
        // Loading text
        this.loadingText = UIUtils.createText(
            this, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 - 50, 
            'Caricamento...', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#FFFFFF',
                align: 'center'
            }
        );
        
        // Progress bar background
        this.progressBg = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            250, 
            20, 
            COLORS.UI_SECONDARY
        );
        
        // Progress bar
        this.progressBar = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2 - 125, 
            GAME_CONFIG.HEIGHT / 2, 
            0, 
            16, 
            COLORS.UI_PRIMARY
        );
        this.progressBar.setOrigin(0, 0.5);
    }

    /**
     * Update loading progress
     * @param {number} value - Progress value (0-1)
     */
    updateLoadingProgress(value) {
        if (this.progressBar) {
            this.progressBar.setSize(250 * value, 16);
        }
        
        if (this.loadingText) {
            this.loadingText.setText(`Caricamento... ${Math.round(value * 100)}%`);
        }
    }

    /**
     * Scene creation - called after preload
     */
    create() {
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Setup UI Manager
        this.uiManager = new UIManager(this);
        
        // Create menu elements
        this.createBackground();
        this.createLogo();
        this.createMenuButtons();
        this.createDecorations();
        
        // Start background music
        this.startBackgroundMusic();
        
        // Initialize saved data
        this.loadSavedData();
        
        DebugUtils.log('INFO', 'MenuScene created');
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.loadingBg) this.loadingBg.destroy();
        if (this.loadingText) this.loadingText.destroy();
        if (this.progressBg) this.progressBg.destroy();
        if (this.progressBar) this.progressBar.destroy();
    }

    /**
     * Create background elements
     */
    createBackground() {
        // Main background
        this.menuElements.background = this.add.image(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            'menu_background'
        );
        this.menuElements.background.setDisplaySize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        // Add subtle overlay for better text readability
        this.menuElements.overlay = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT, 
            COLORS.UI_DARK, 
            0.3
        );
    }

    /**
     * Create game logo
     */
    createLogo() {
        // Main logo
        this.menuElements.logo = this.add.image(
            GAME_CONFIG.WIDTH / 2, 
            150, 
            'logo'
        );
        this.menuElements.logo.setScale(0.8);
        
        // Game title
        this.menuElements.title = UIUtils.createText(
            this, 
            GAME_CONFIG.WIDTH / 2, 
            220, 
            'LA VENDEMMIA\nCONTESA', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_XLARGE,
                color: '#FFFFFF',
                fontStyle: 'bold',
                align: 'center',
                stroke: COLORS.UI_DARK,
                strokeThickness: 4
            }
        );
        
        // Subtitle
        this.menuElements.subtitle = UIUtils.createText(
            this, 
            GAME_CONFIG.WIDTH / 2, 
            280, 
            'Natale 2025 - Rosso Macchiato', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#CCCCCC',
                align: 'center',
                fontStyle: 'italic'
            }
        );
        
        // Add gentle floating animation to logo
        this.tweens.add({
            targets: this.menuElements.logo,
            y: '+=10',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Create menu buttons
     */
    createMenuButtons() {
        const buttonSpacing = 80;
        const startY = GAME_CONFIG.HEIGHT / 2 + 50;
        
        // Play button
        this.menuElements.playButton = UIUtils.createButton(
            this,
            GAME_CONFIG.WIDTH / 2,
            startY,
            'GIOCA',
            () => this.startGame()
        );
        this.menuElements.playButton.button.setDepth(UI_CONFIG.DEPTH_UI);
        this.menuElements.playButton.text.setDepth(UI_CONFIG.DEPTH_UI + 1);
        
        // Continue button (if saved game exists)
        const savedLevel = StorageUtils.load('currentLevel', 1);
        if (savedLevel > 1) {
            this.menuElements.continueButton = UIUtils.createButton(
                this,
                GAME_CONFIG.WIDTH / 2,
                startY + buttonSpacing,
                'CONTINUA',
                () => this.continueGame()
            );
            this.menuElements.continueButton.button.setDepth(UI_CONFIG.DEPTH_UI);
            this.menuElements.continueButton.text.setDepth(UI_CONFIG.DEPTH_UI + 1);
        }
        
        // Instructions button
        this.menuElements.instructionsButton = UIUtils.createButton(
            this,
            GAME_CONFIG.WIDTH / 2,
            startY + (savedLevel > 1 ? buttonSpacing * 2 : buttonSpacing),
            'ISTRUZIONI',
            () => this.showInstructions()
        );
        this.menuElements.instructionsButton.button.setDepth(UI_CONFIG.DEPTH_UI);
        this.menuElements.instructionsButton.text.setDepth(UI_CONFIG.DEPTH_UI + 1);
        
        // Leaderboard button
        this.menuElements.leaderboardButton = UIUtils.createButton(
            this,
            GAME_CONFIG.WIDTH / 2,
            startY + (savedLevel > 1 ? buttonSpacing * 3 : buttonSpacing * 2),
            'CLASSIFICA',
            () => this.showLeaderboard()
        );
        this.menuElements.leaderboardButton.button.setDepth(UI_CONFIG.DEPTH_UI);
        this.menuElements.leaderboardButton.text.setDepth(UI_CONFIG.DEPTH_UI + 1);
        
        // Add hover effects to buttons
        this.addButtonEffects();
    }

    /**
     * Add hover effects to buttons
     */
    addButtonEffects() {
        Object.values(this.menuElements).forEach(element => {
            if (element.button && element.text) {
                element.button.on('pointerover', () => {
                    this.tweens.add({
                        targets: [element.button, element.text],
                        scaleX: 1.1,
                        scaleY: 1.1,
                        duration: 150,
                        ease: 'Power2.easeOut'
                    });
                });
                
                element.button.on('pointerout', () => {
                    this.tweens.add({
                        targets: [element.button, element.text],
                        scaleX: 1,
                        scaleY: 1,
                        duration: 150,
                        ease: 'Power2.easeOut'
                    });
                });
            }
        });
    }

    /**
     * Create decorative elements
     */
    createDecorations() {
        // Grape previews
        const grapeColors = Object.values(GRAPE_COLORS);
        const grapeY = GAME_CONFIG.HEIGHT - 100;
        
        grapeColors.forEach((color, index) => {
            const x = 50 + index * 80;
            const grape = this.add.image(x, grapeY, `grape_${color.toLowerCase()}`);
            grape.setScale(0.6);
            grape.setAlpha(0.7);
            
            // Add subtle rotation animation
            this.tweens.add({
                targets: grape,
                rotation: Math.PI * 2,
                duration: 10000 + index * 1000,
                repeat: -1,
                ease: 'Linear'
            });
        });
        
        // Version info
        this.menuElements.version = UIUtils.createText(
            this, 
            GAME_CONFIG.WIDTH - 10, 
            GAME_CONFIG.HEIGHT - 10, 
            'v1.1', 
            {
                fontSize: '12px',
                color: '#666666',
                align: 'right'
            }
        );
        this.menuElements.version.setOrigin(1, 1);
    }

    /**
     * Start background music
     */
    startBackgroundMusic() {
        if (this.sound.get('menu_music')) {
            this.backgroundMusic = AudioUtils.playMusic(this, 'menu_music', 0.6);
        }
    }

    /**
     * Load saved game data
     */
    loadSavedData() {
        // Load audio settings
        const masterVolume = StorageUtils.load('masterVolume', AUDIO_CONFIG.MASTER_VOLUME);
        AudioUtils.setMasterVolume(masterVolume);
        
        DebugUtils.log('DEBUG', 'Saved data loaded');
    }

    /**
     * Start new game
     */
    startGame() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Play button sound
        AudioUtils.playSound(this, 'button_click');
        
        // Save starting level
        StorageUtils.save('currentLevel', 1);
        StorageUtils.save('currentScore', 0);
        
        // Transition to game
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
            }
            this.scene.start('GameScene', { level: 1, score: 0 });
        });
        
        DebugUtils.log('INFO', 'Starting new game');
    }

    /**
     * Continue saved game
     */
    continueGame() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Play button sound
        AudioUtils.playSound(this, 'button_click');
        
        // Load saved data
        const level = StorageUtils.load('currentLevel', 1);
        const score = StorageUtils.load('currentScore', 0);
        
        // Transition to game
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
            }
            this.scene.start('GameScene', { level, score });
        });
        
        DebugUtils.log('INFO', `Continuing game at level ${level}`);
    }

    /**
     * Show game instructions
     */
    showInstructions() {
        const instructionText = `COME GIOCARE:

• Tocca lo schermo per mirare
• Rilascia per sparare l'acino
• Raggruppa 3+ acini dello stesso colore
• Elimina tutti gli ACINI MACCHIATI per vincere
• Non far raggiungere la linea rossa!

TIPI DI UVA:
• AGLIANICO (rosso scuro)
• FIANO (giallo dorato)  
• GRECO (verde chiaro)
• MACCHIATI (da eliminare!)

Buona fortuna, vignaiolo!`;
        
        this.uiManager.showLevelOverlay(instructionText, 0, () => {
            // Callback when instructions are dismissed
        });
    }

    /**
     * Show leaderboard
     */
    async showLeaderboard() {
        try {
            // Fetch leaderboard data
            const response = await fetch('api/get_leaderboard.php');
            const data = await response.json();
            
            let leaderboardText = 'CLASSIFICA:\n\n';
            
            if (data.scores && data.scores.length > 0) {
                data.scores.slice(0, 10).forEach((entry, index) => {
                    leaderboardText += `${index + 1}. ${entry.name} - ${UIUtils.formatScore(entry.score)}\n`;
                });
            } else {
                leaderboardText += 'Nessun punteggio salvato.\nSii il primo a giocare!';
            }
            
            this.uiManager.showLevelOverlay(leaderboardText, 0);
            
        } catch (error) {
            DebugUtils.log('ERROR', 'Failed to load leaderboard:', error);
            this.uiManager.showLevelOverlay('Errore nel caricamento\ndella classifica.', 2000);
        }
    }

    /**
     * Scene update loop
     * @param {number} time - Current time
     * @param {number} delta - Time delta
     */
    update(time, delta) {
        // Update UI manager
        if (this.uiManager) {
            this.uiManager.update(delta);
        }
        
        // Show FPS if debug mode
        DebugUtils.showFPS(this);
    }

    /**
     * Cleanup when scene is destroyed
     */
    destroy() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }
        
        if (this.uiManager) {
            this.uiManager.destroy();
        }
        
        // Clear all menu elements
        Object.values(this.menuElements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            } else if (element && element.button) {
                element.button.destroy();
                element.text.destroy();
            }
        });
        
        DebugUtils.log('DEBUG', 'MenuScene destroyed');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.MenuScene;
}
