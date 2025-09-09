/**
 * La Vendemmia Contesa - Game Scene
 * Scena principale del gioco
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

window.GameScene = class GameScene extends Phaser.Scene {
    /**
     * Constructor for GameScene
     */
    constructor() {
        super({ key: 'GameScene' });
        
        // Game managers
        this.uiManager = null;
        this.gridManager = null;
        this.shooter = null;
        
        // Game state
        this.gameState = GAME_STATES.LOADING;
        this.currentLevel = 1;
        this.currentScore = 0;
        this.levelData = null;
        this.backgroundMusic = null;
        
        // Input handling
        this.isInputEnabled = false;
        this.touchStartPos = null;
        this.isDragging = false;
        
        // Debug graphics
        this.debugGraphics = null;
    }

    /**
     * Initialize scene with data
     * @param {Object} data - Scene initialization data
     */
    init(data) {
        this.currentLevel = data.level || 1;
        this.currentScore = data.score || 0;
        
        DebugUtils.log('INFO', `GameScene initialized - Level: ${this.currentLevel}, Score: ${this.currentScore}`);
    }

    /**
     * Create game scene
     */
    create() {
        // Setup physics if needed
        this.setupPhysics();
        
        // Create game elements
        this.createBackground();
        this.createManagers();
        this.setupInput();
        this.setupDebug();
        
        // Load and start level
        this.loadLevel(this.currentLevel);
        
        // Start background music
        this.startBackgroundMusic();
        
        DebugUtils.log('INFO', 'GameScene created');
    }

    /**
     * Setup physics system
     */
    setupPhysics() {
        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
            this.physics.world.gravity.y = PHYSICS.GRAVITY;
        }
    }

    /**
     * Create background elements
     */
    createBackground() {
        // Game background - use level-specific background
        const bgKey = `bg_level_${this.currentLevel.toString().padStart(2, '0')}`;
        this.backgroundImage = this.add.image(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            bgKey
        );
        this.backgroundImage.setDisplaySize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        this.backgroundImage.setDepth(-1);
        
        // Danger line indicator
        this.dangerLine = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2,
            GRID_CONFIG.START_Y + (GRID_CONFIG.DANGER_LINE_ROW * GRID_CONFIG.CELL_SIZE),
            GAME_CONFIG.WIDTH,
            3,
            0xFF0000,
            0.7
        );
        this.dangerLine.setDepth(UI_CONFIG.DEPTH_UI);
        
        // Add pulsing effect to danger line
        this.tweens.add({
            targets: this.dangerLine,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Create game managers
     */
    createManagers() {
        // Create UI Manager
        this.uiManager = new UIManager(this);
        this.uiManager.drawHUD();
        this.uiManager.updateLevel(this.currentLevel);
        this.uiManager.updateScore(this.currentScore);
        
        // Create Grid Manager
        this.gridManager = new GridManager(this);
        
        // Create Shooter
        this.shooter = new Shooter(this, this.gridManager);
        
        DebugUtils.log('DEBUG', 'Game managers created');
    }

    /**
     * Setup input handling
     */
    setupInput() {
        // Touch/click input
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerup', this.onPointerUp, this);
        
        // Keyboard input for debugging
        if (DEBUG_CONFIG.ENABLED) {
            this.input.keyboard.on('keydown-R', () => {
                this.restartLevel();
            });
            
            this.input.keyboard.on('keydown-N', () => {
                this.nextLevel();
            });
        }
        
        DebugUtils.log('DEBUG', 'Input handlers setup');
    }

    /**
     * Setup debug graphics
     */
    setupDebug() {
        if (DEBUG_CONFIG.ENABLED) {
            this.debugGraphics = this.add.graphics();
            this.debugGraphics.setDepth(UI_CONFIG.DEPTH_DEBUG);
        }
    }

    /**
     * Load level data and setup game
     * @param {number} levelNumber - Level number to load
     */
    async loadLevel(levelNumber) {
        this.gameState = GAME_STATES.LOADING;
        this.setInputEnabled(false);
        
        try {
            // Load level data
            this.levelData = await this.loadLevelData(levelNumber);
            
            if (!this.levelData) {
                throw new Error(`Level ${levelNumber} data not found`);
            }
            
            // Setup grid with level data
            this.gridManager.populateGrid(this.levelData);
            
            // Update UI
            this.updateMacchiatoCount();
            
            // Show level intro
            this.showLevelIntro();
            
        } catch (error) {
            DebugUtils.log('ERROR', 'Failed to load level:', error);
            this.handleLevelLoadError();
        }
    }

    /**
     * Load level data from file
     * @param {number} levelNumber - Level number
     * @returns {Object} Level data
     */
    async loadLevelData(levelNumber) {
        try {
            const response = await fetch(`levels/level_${levelNumber}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            DebugUtils.log('INFO', `Level ${levelNumber} data loaded`);
            return data;
            
        } catch (error) {
            DebugUtils.log('WARN', `Failed to load level ${levelNumber}, using fallback`);
            return this.generateFallbackLevel(levelNumber);
        }
    }

    /**
     * Generate fallback level data
     * @param {number} levelNumber - Level number
     * @returns {Object} Generated level data
     */
    generateFallbackLevel(levelNumber) {
        const grapes = [];
        const colors = Object.values(GRAPE_COLORS);
        const macchiatoCount = Math.min(levelNumber + 2, 10);
        
        // Generate basic grid pattern
        for (let row = 0; row < Math.min(5 + levelNumber, GRID_CONFIG.ROWS - 5); row++) {
            for (let col = 0; col < GRID_CONFIG.COLS; col++) {
                if (Math.random() < 0.7) { // 70% chance of grape
                    const color = ArrayUtils.randomElement(colors);
                    const type = grapes.filter(g => g.type === GRAPE_TYPES.MACCHIATO).length < macchiatoCount && Math.random() < 0.1 
                        ? GRAPE_TYPES.MACCHIATO 
                        : GRAPE_TYPES.NORMAL;
                    
                    grapes.push({ col, row, color, type });
                }
            }
        }
        
        return {
            level: levelNumber,
            grapes: grapes,
            narrative: this.getLevelNarrative(levelNumber)
        };
    }

    /**
     * Get narrative text for level
     * @param {number} levelNumber - Level number
     * @returns {string} Narrative text
     */
    getLevelNarrative(levelNumber) {
        const narratives = [
            "La vendemmia è iniziata, ma alcuni acini sono macchiati...",
            "Il vento del nord ha portato una malattia strana...",
            "I grappoli più alti nascondono il segreto del Rosso Macchiato...",
            "Le foglie sussurrano di antiche maledizioni...",
            "La luna piena rivela la vera natura degli acini...",
            "Il suolo trema sotto il peso del mistero...",
            "Le radici profonde custodiscono memorie oscure...",
            "Il sole al tramonto tinge tutto di rosso...",
            "Gli uccelli evitano questi grappoli maledetti...",
            "L'ultima battaglia contro il Rosso Macchiato è iniziata..."
        ];
        
        return narratives[Math.min(levelNumber - 1, narratives.length - 1)];
    }

    /**
     * Show level introduction
     */
    showLevelIntro() {
        const narrative = this.levelData.narrative || this.getLevelNarrative(this.currentLevel);
        
        this.uiManager.showLevelOverlay(narrative, 2000, () => {
            this.startLevel();
        });
    }

    /**
     * Start level gameplay
     */
    startLevel() {
        this.gameState = GAME_STATES.PLAYING;
        this.setInputEnabled(true);
        
        // Enable shooter
        this.shooter.setEnabled(true);
        
        DebugUtils.log('INFO', `Level ${this.currentLevel} started`);
    }

    /**
     * Handle level load error
     */
    handleLevelLoadError() {
        this.uiManager.showLevelOverlay('Errore nel caricamento del livello', 2000, () => {
            this.scene.start('MenuScene');
        });
    }

    /**
     * Pointer down handler
     * @param {Phaser.Input.Pointer} pointer - Pointer object
     */
    onPointerDown(pointer) {
        if (!this.isInputEnabled || this.gameState !== GAME_STATES.PLAYING) return;
        
        const touchPos = InputUtils.getTouchPosition(pointer, this.game);
        
        // Only handle touches in aiming area
        if (InputUtils.isInAimingArea(touchPos.y)) {
            this.touchStartPos = touchPos;
            this.isDragging = true;
            
            // Start aiming
            this.shooter.aim(touchPos.x, touchPos.y);
        }
    }

    /**
     * Pointer move handler
     * @param {Phaser.Input.Pointer} pointer - Pointer object
     */
    onPointerMove(pointer) {
        if (!this.isInputEnabled || !this.isDragging || this.gameState !== GAME_STATES.PLAYING) return;
        
        const touchPos = InputUtils.getTouchPosition(pointer, this.game);
        
        if (InputUtils.isInAimingArea(touchPos.y)) {
            // Update aiming
            this.shooter.aim(touchPos.x, touchPos.y);
        }
    }

    /**
     * Pointer up handler
     * @param {Phaser.Input.Pointer} pointer - Pointer object
     */
    onPointerUp(pointer) {
        if (!this.isInputEnabled || !this.isDragging || this.gameState !== GAME_STATES.PLAYING) return;
        
        this.isDragging = false;
        
        // Fire shooter
        if (this.touchStartPos) {
            this.shooter.fire();
            this.touchStartPos = null;
        }
    }

    /**
     * Add score to current total
     * @param {number} points - Points to add
     */
    addScore(points) {
        this.currentScore += points;
        this.uiManager.updateScore(this.currentScore);
        
        // Save score
        StorageUtils.save('currentScore', this.currentScore);
        
        DebugUtils.log('DEBUG', `Score added: ${points}, Total: ${this.currentScore}`);
    }

    /**
     * Update macchiato count display
     */
    updateMacchiatoCount() {
        const count = this.gridManager.macchiatoGrapes.filter(grape => 
            grape && !grape.isMarkedForRemoval && grape.scene
        ).length;
        
        this.uiManager.updateMacchiatoCount(count);
    }

    /**
     * Handle level completion
     */
    levelComplete() {
        if (this.gameState !== GAME_STATES.PLAYING) return;
        
        this.gameState = GAME_STATES.LEVEL_TRANSITION;
        this.setInputEnabled(false);
        
        // Play level complete sound
        AudioUtils.playSound(this, 'level_complete');
        
        // Calculate level bonus
        const levelBonus = GAME_CONFIG.LEVEL_COMPLETE_BONUS * this.currentLevel;
        this.addScore(levelBonus);
        
        // Save progress
        StorageUtils.save('currentLevel', this.currentLevel + 1);
        
        // Show completion message
        this.uiManager.showLevelOverlay(
            `Livello ${this.currentLevel} Completato!\nBonus: ${levelBonus} punti`, 
            2000, 
            () => {
                this.nextLevel();
            }
        );
        
        DebugUtils.log('INFO', `Level ${this.currentLevel} completed`);
    }

    /**
     * Handle game over
     */
    gameOver() {
        if (this.gameState === GAME_STATES.GAME_OVER) return;
        
        this.gameState = GAME_STATES.GAME_OVER;
        this.setInputEnabled(false);
        
        // Disable shooter
        this.shooter.setEnabled(false);
        
        // Play game over sound
        AudioUtils.playSound(this, 'game_over');
        
        // Show game over screen
        this.uiManager.showGameOverScreen(
            false, // isWin
            this.currentScore,
            () => this.restartLevel(), // restart callback
            () => this.returnToMenu()   // menu callback
        );
        
        DebugUtils.log('INFO', 'Game Over');
    }

    /**
     * Proceed to next level
     */
    nextLevel() {
        this.currentLevel++;
        
        // Check if we've completed all levels
        if (this.currentLevel > GAME_CONFIG.MAX_LEVELS) {
            this.gameComplete();
            return;
        }
        
        // Clear current grid
        this.gridManager.clearGrid();
        
        // Load next level
        this.loadLevel(this.currentLevel);
    }

    /**
     * Handle game completion (all levels finished)
     */
    gameComplete() {
        this.gameState = GAME_STATES.GAME_OVER;
        
        // Calculate final bonus
        const finalBonus = GAME_CONFIG.GAME_COMPLETE_BONUS;
        this.addScore(finalBonus);
        
        // Show victory screen
        this.uiManager.showGameOverScreen(
            true, // isWin
            this.currentScore,
            () => this.restartGame(), // restart callback
            () => this.returnToMenu()  // menu callback
        );
        
        DebugUtils.log('INFO', 'Game Completed!');
    }

    /**
     * Restart current level
     */
    restartLevel() {
        this.scene.restart({ level: this.currentLevel, score: Math.max(0, this.currentScore - 1000) });
    }

    /**
     * Restart entire game
     */
    restartGame() {
        StorageUtils.save('currentLevel', 1);
        StorageUtils.save('currentScore', 0);
        this.scene.restart({ level: 1, score: 0 });
    }

    /**
     * Return to main menu
     */
    returnToMenu() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
        }
        this.scene.start('MenuScene');
    }

    /**
     * Start background music
     */
    startBackgroundMusic() {
        if (this.sound.get('game_music')) {
            this.backgroundMusic = AudioUtils.playMusic(this, 'game_music', 0.4);
        }
    }

    /**
     * Enable/disable input
     * @param {boolean} enabled - Whether input should be enabled
     */
    setInputEnabled(enabled) {
        this.isInputEnabled = enabled;
        
        if (!enabled) {
            this.isDragging = false;
            this.touchStartPos = null;
            
            if (this.shooter) {
                this.shooter.clearAimingVisuals();
            }
        }
    }

    /**
     * Scene update loop
     * @param {number} time - Current time
     * @param {number} delta - Time delta
     */
    update(time, delta) {
        // Update managers
        if (this.gridManager) {
            this.gridManager.update(delta);
        }
        
        if (this.shooter) {
            this.shooter.update(delta);
        }
        
        if (this.uiManager) {
            this.uiManager.update(delta);
        }
        
        // Update macchiato count
        if (this.gameState === GAME_STATES.PLAYING) {
            this.updateMacchiatoCount();
            
            // Check win condition
            if (this.gridManager.checkWinCondition()) {
                this.levelComplete();
            }
        }
        
        // Draw debug info
        if (DEBUG_CONFIG.ENABLED && this.debugGraphics) {
            DebugUtils.drawGrid(this.debugGraphics, this);
            DebugUtils.showFPS(this);
        }
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
        
        if (this.gridManager) {
            this.gridManager.clearGrid();
        }
        
        if (this.shooter) {
            this.shooter.destroy();
        }
        
        DebugUtils.log('DEBUG', 'GameScene destroyed');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.GameScene;
}
