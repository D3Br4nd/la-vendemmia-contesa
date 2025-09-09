/**
 * La Vendemmia Contesa - Game Over Scene
 * Scena di game over e vittoria
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

class GameOverScene extends Phaser.Scene {
    /**
     * Constructor for GameOverScene
     */
    constructor() {
        super({ key: 'GameOverScene' });
        
        this.uiManager = null;
        this.isWin = false;
        this.finalScore = 0;
        this.finalLevel = 1;
        this.elements = {};
        this.isTransitioning = false;
        this.backgroundMusic = null;
    }

    /**
     * Initialize scene with data
     * @param {Object} data - Scene initialization data
     */
    init(data) {
        this.isWin = data.isWin || false;
        this.finalScore = data.score || 0;
        this.finalLevel = data.level || 1;
        this.previousScene = data.previousScene || 'GameScene';
        
        DebugUtils.log('INFO', `GameOverScene initialized - Win: ${this.isWin}, Score: ${this.finalScore}, Level: ${this.finalLevel}`);
    }

    /**
     * Create game over scene
     */
    create() {
        // Setup UI Manager
        this.uiManager = new UIManager(this);
        
        // Create scene elements
        this.createBackground();
        this.createTitle();
        this.createScoreDisplay();
        this.createStatistics();
        this.createButtons();
        this.createDecorations();
        
        // Start appropriate music
        this.startBackgroundMusic();
        
        // Handle leaderboard if winning
        if (this.isWin) {
            this.setupLeaderboardInput();
        }
        
        // Animate entrance
        this.animateEntrance();
        
        DebugUtils.log('INFO', 'GameOverScene created');
    }

    /**
     * Create background elements
     */
    createBackground() {
        // Background with appropriate color
        const bgColor = this.isWin ? COLORS.WIN_BACKGROUND : COLORS.LOSE_BACKGROUND;
        
        this.elements.background = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT, 
            bgColor
        );
        
        // Overlay for better text readability
        this.elements.overlay = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT, 
            COLORS.UI_DARK, 
            0.6
        );
        
        // Add subtle background pattern
        if (this.isWin) {
            this.createVictoryEffects();
        } else {
            this.createDefeatEffects();
        }
    }

    /**
     * Create victory visual effects
     */
    createVictoryEffects() {
        // Create floating grapes
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * GAME_CONFIG.WIDTH;
            const y = Math.random() * GAME_CONFIG.HEIGHT;
            const colors = Object.values(GRAPE_COLORS);
            const color = ArrayUtils.randomElement(colors);
            
            const grape = this.add.image(x, y, `grape_${color.toLowerCase()}`);
            grape.setAlpha(0.3);
            grape.setScale(0.5);
            grape.setDepth(-1);
            
            // Floating animation
            this.tweens.add({
                targets: grape,
                y: y - 100,
                alpha: 0,
                duration: 3000 + Math.random() * 2000,
                delay: Math.random() * 2000,
                ease: 'Power2.easeOut',
                repeat: -1
            });
        }
        
        // Sparkle effects
        this.createSparkleEffect();
    }

    /**
     * Create defeat visual effects
     */
    createDefeatEffects() {
        // Create falling macchiato grapes
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * GAME_CONFIG.WIDTH;
            const y = -50;
            
            const grape = this.add.image(x, y, 'grape_macchiato');
            grape.setAlpha(0.4);
            grape.setScale(0.6);
            grape.setDepth(-1);
            
            // Falling animation
            this.tweens.add({
                targets: grape,
                y: GAME_CONFIG.HEIGHT + 50,
                rotation: Math.PI * 2,
                duration: 2000 + Math.random() * 1000,
                delay: Math.random() * 3000,
                ease: 'Power2.easeIn',
                repeat: -1
            });
        }
    }

    /**
     * Create sparkle particle effect
     */
    createSparkleEffect() {
        if (!this.isWin) return;
        
        // Create sparkle particles
        const sparkles = this.add.particles(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'grape_particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            frequency: 100,
            quantity: 2,
            tint: [0xFFD700, 0xFFA500, 0xFF6347]
        });
        
        sparkles.setDepth(UI_CONFIG.DEPTH_EFFECTS);
    }

    /**
     * Create title elements
     */
    createTitle() {
        const titleText = this.isWin ? 'VITTORIA!' : 'GAME OVER';
        const titleColor = this.isWin ? '#00FF00' : '#FF0000';
        const subtitle = this.isWin ? 'La Vendemmia è Salvata!' : 'Gli Acini Macchiati Hanno Vinto...';
        
        // Main title
        this.elements.title = UIUtils.createText(
            this, 
            GAME_CONFIG.WIDTH / 2, 
            120, 
            titleText, 
            {
                fontSize: UI_CONFIG.FONT_SIZE_XLARGE,
                color: titleColor,
                fontStyle: 'bold',
                align: 'center',
                stroke: COLORS.UI_DARK,
                strokeThickness: 6
            }
        );
        this.elements.title.setDepth(UI_CONFIG.DEPTH_UI);
        
        // Subtitle
        this.elements.subtitle = UIUtils.createText(
            this, 
            GAME_CONFIG.WIDTH / 2, 
            170, 
            subtitle, 
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#FFFFFF',
                align: 'center',
                fontStyle: 'italic'
            }
        );
        this.elements.subtitle.setDepth(UI_CONFIG.DEPTH_UI);
    }

    /**
     * Create score display
     */
    createScoreDisplay() {
        // Score label
        this.elements.scoreLabel = UIUtils.createText(
            this, 
            GAME_CONFIG.WIDTH / 2, 
            230, 
            'PUNTEGGIO FINALE', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#CCCCCC',
                align: 'center'
            }
        );
        this.elements.scoreLabel.setDepth(UI_CONFIG.DEPTH_UI);
        
        // Score value with animation
        this.elements.scoreValue = UIUtils.createText(
            this, 
            GAME_CONFIG.WIDTH / 2, 
            270, 
            '000000', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#FFFFFF',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        this.elements.scoreValue.setDepth(UI_CONFIG.DEPTH_UI);
        
        // Animate score counting up
        this.animateScoreCounter();
    }

    /**
     * Animate score counter
     */
    animateScoreCounter() {
        let currentScore = 0;
        const increment = Math.max(1, Math.floor(this.finalScore / 60)); // Count up over ~1 second at 60fps
        
        const countUp = () => {
            currentScore = Math.min(currentScore + increment, this.finalScore);
            this.elements.scoreValue.setText(UIUtils.formatScore(currentScore));
            
            if (currentScore < this.finalScore) {
                this.time.delayedCall(16, countUp); // ~60fps
            } else {
                // Score animation complete, add emphasis
                this.tweens.add({
                    targets: this.elements.scoreValue,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 300,
                    yoyo: true,
                    ease: 'Back.easeOut'
                });
            }
        };
        
        // Start counting after a delay
        this.time.delayedCall(500, countUp);
    }

    /**
     * Create statistics display
     */
    createStatistics() {
        const statsY = 330;
        
        // Level reached
        this.elements.levelLabel = UIUtils.createText(
            this, 
            GAME_CONFIG.WIDTH / 2, 
            statsY, 
            `Livello Raggiunto: ${this.finalLevel}`, 
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#CCCCCC',
                align: 'center'
            }
        );
        this.elements.levelLabel.setDepth(UI_CONFIG.DEPTH_UI);
        
        // Additional stats based on game type
        if (this.isWin) {
            this.elements.congratsText = UIUtils.createText(
                this, 
                GAME_CONFIG.WIDTH / 2, 
                statsY + 30, 
                'Hai completato tutti i livelli!\nSei un vero Maestro Vignaiolo!', 
                {
                    fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                    color: '#FFFF00',
                    align: 'center',
                    wordWrap: { width: GAME_CONFIG.WIDTH - 40 }
                }
            );
            this.elements.congratsText.setDepth(UI_CONFIG.DEPTH_UI);
        } else {
            // Calculate percentage progress
            const progress = Math.round((this.finalLevel / GAME_CONFIG.MAX_LEVELS) * 100);
            
            this.elements.progressText = UIUtils.createText(
                this, 
                GAME_CONFIG.WIDTH / 2, 
                statsY + 30, 
                `Progresso: ${progress}%\nNon arrenderti, riprova!`, 
                {
                    fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                    color: '#FFAAAA',
                    align: 'center'
                }
            );
            this.elements.progressText.setDepth(UI_CONFIG.DEPTH_UI);
        }
    }

    /**
     * Create action buttons
     */
    createButtons() {
        const buttonY = GAME_CONFIG.HEIGHT - 150;
        const buttonSpacing = 120;
        
        // Restart button
        this.elements.restartButton = UIUtils.createButton(
            this,
            GAME_CONFIG.WIDTH / 2 - buttonSpacing / 2,
            buttonY,
            this.isWin ? 'RIGIOCA' : 'RIPROVA',
            () => this.restartGame()
        );
        this.elements.restartButton.button.setDepth(UI_CONFIG.DEPTH_UI);
        this.elements.restartButton.text.setDepth(UI_CONFIG.DEPTH_UI + 1);
        
        // Menu button
        this.elements.menuButton = UIUtils.createButton(
            this,
            GAME_CONFIG.WIDTH / 2 + buttonSpacing / 2,
            buttonY,
            'MENU',
            () => this.returnToMenu()
        );
        this.elements.menuButton.button.setDepth(UI_CONFIG.DEPTH_UI);
        this.elements.menuButton.text.setDepth(UI_CONFIG.DEPTH_UI + 1);
        
        // Add button hover effects
        this.addButtonEffects();
    }

    /**
     * Add hover effects to buttons
     */
    addButtonEffects() {
        [this.elements.restartButton, this.elements.menuButton].forEach(buttonObj => {
            if (buttonObj && buttonObj.button) {
                buttonObj.button.on('pointerover', () => {
                    this.tweens.add({
                        targets: [buttonObj.button, buttonObj.text],
                        scaleX: 1.1,
                        scaleY: 1.1,
                        duration: 150,
                        ease: 'Power2.easeOut'
                    });
                });
                
                buttonObj.button.on('pointerout', () => {
                    this.tweens.add({
                        targets: [buttonObj.button, buttonObj.text],
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
        // Frame decoration
        const frameThickness = 8;
        const frameColor = this.isWin ? COLORS.UI_PRIMARY : COLORS.UI_SECONDARY;
        
        // Top border
        this.elements.topBorder = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2, frameThickness / 2, 
            GAME_CONFIG.WIDTH, frameThickness, 
            frameColor
        );
        this.elements.topBorder.setDepth(UI_CONFIG.DEPTH_UI);
        
        // Bottom border
        this.elements.bottomBorder = this.add.rectangle(
            GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - frameThickness / 2, 
            GAME_CONFIG.WIDTH, frameThickness, 
            frameColor
        );
        this.elements.bottomBorder.setDepth(UI_CONFIG.DEPTH_UI);
        
        // Side borders
        this.elements.leftBorder = this.add.rectangle(
            frameThickness / 2, GAME_CONFIG.HEIGHT / 2, 
            frameThickness, GAME_CONFIG.HEIGHT, 
            frameColor
        );
        this.elements.leftBorder.setDepth(UI_CONFIG.DEPTH_UI);
        
        this.elements.rightBorder = this.add.rectangle(
            GAME_CONFIG.WIDTH - frameThickness / 2, GAME_CONFIG.HEIGHT / 2, 
            frameThickness, GAME_CONFIG.HEIGHT, 
            frameColor
        );
        this.elements.rightBorder.setDepth(UI_CONFIG.DEPTH_UI);
    }

    /**
     * Setup leaderboard input for winning players
     */
    setupLeaderboardInput() {
        // Show leaderboard input after a delay
        this.time.delayedCall(2000, () => {
            this.uiManager.showLeaderboardInput(this.finalScore);
        });
    }

    /**
     * Start appropriate background music
     */
    startBackgroundMusic() {
        const musicKey = this.isWin ? 'level_complete' : 'game_over';
        
        if (this.sound.get(musicKey)) {
            this.backgroundMusic = AudioUtils.playMusic(this, musicKey, 0.6);
        }
    }

    /**
     * Animate scene entrance
     */
    animateEntrance() {
        // Start with elements off-screen or invisible
        this.elements.title.setY(-100);
        this.elements.subtitle.setAlpha(0);
        this.elements.scoreLabel.setAlpha(0);
        this.elements.scoreValue.setAlpha(0);
        
        if (this.elements.levelLabel) this.elements.levelLabel.setAlpha(0);
        if (this.elements.congratsText) this.elements.congratsText.setAlpha(0);
        if (this.elements.progressText) this.elements.progressText.setAlpha(0);
        
        if (this.elements.restartButton) this.elements.restartButton.button.setY(GAME_CONFIG.HEIGHT + 100);
        if (this.elements.menuButton) this.elements.menuButton.button.setY(GAME_CONFIG.HEIGHT + 100);
        if (this.elements.restartButton) this.elements.restartButton.text.setY(GAME_CONFIG.HEIGHT + 100);
        if (this.elements.menuButton) this.elements.menuButton.text.setY(GAME_CONFIG.HEIGHT + 100);
        
        // Animate elements in sequence
        const timeline = this.tweens.createTimeline();
        
        // Title slides in
        timeline.add({
            targets: this.elements.title,
            y: 120,
            duration: 600,
            ease: 'Back.easeOut'
        });
        
        // Subtitle fades in
        timeline.add({
            targets: this.elements.subtitle,
            alpha: 1,
            duration: 400,
            ease: 'Power2.easeOut'
        });
        
        // Score elements fade in
        timeline.add({
            targets: [this.elements.scoreLabel, this.elements.scoreValue],
            alpha: 1,
            duration: 400,
            ease: 'Power2.easeOut'
        });
        
        // Stats fade in
        const statsElements = [this.elements.levelLabel, this.elements.congratsText, this.elements.progressText].filter(el => el);
        if (statsElements.length > 0) {
            timeline.add({
                targets: statsElements,
                alpha: 1,
                duration: 400,
                ease: 'Power2.easeOut'
            });
        }
        
        // Buttons slide in
        const buttonElements = [];
        if (this.elements.restartButton) {
            buttonElements.push(this.elements.restartButton.button, this.elements.restartButton.text);
        }
        if (this.elements.menuButton) {
            buttonElements.push(this.elements.menuButton.button, this.elements.menuButton.text);
        }
        
        timeline.add({
            targets: buttonElements,
            y: GAME_CONFIG.HEIGHT - 150,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        timeline.play();
    }

    /**
     * Restart the game
     */
    restartGame() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Play button sound
        AudioUtils.playSound(this, 'grape_pop');
        
        // Clear saved progress
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
        
        DebugUtils.log('INFO', 'Restarting game');
    }

    /**
     * Return to main menu
     */
    returnToMenu() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Play button sound
        AudioUtils.playSound(this, 'grape_pop');
        
        // Transition to menu
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
            }
            this.scene.start('MenuScene');
        });
        
        DebugUtils.log('INFO', 'Returning to menu');
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
        
        // Clear all elements
        Object.values(this.elements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            } else if (element && element.button) {
                element.button.destroy();
                element.text.destroy();
            }
        });
        
        DebugUtils.log('DEBUG', 'GameOverScene destroyed');
    }
}

// Export for use in other modules
window.GameOverScene = GameOverScene;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameOverScene;
}
