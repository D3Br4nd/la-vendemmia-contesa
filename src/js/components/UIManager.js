/**
 * La Vendemmia Contesa - UI Manager
 * Gestisce l'interfaccia utente e gli elementi HUD
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

class UIManager {
    /**
     * Constructor for UIManager
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        
        // UI Elements
        this.hudElements = {};
        this.overlayElements = {};
        this.menuElements = {};
        
        // State
        this.isOverlayVisible = false;
        this.currentOverlay = null;
        
        // Data
        this.currentScore = 0;
        this.currentLevel = 1;
        this.timeRemaining = 0;
        this.macchiatoCount = 0;
        
        DebugUtils.log('INFO', 'UIManager initialized');
    }

    /**
     * Create and setup main game HUD
     */
    drawHUD() {
        this.clearHUD();
        
        // Background overlay for HUD area
        this.hudElements.background = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT - 80, 
            GAME_CONFIG.WIDTH, 
            160, 
            COLORS.UI_DARK, 
            0.8
        );
        this.hudElements.background.setDepth(UI_CONFIG.DEPTH_HUD);
        
        // Score display
        this.hudElements.scoreLabel = UIUtils.createText(
            this.scene, 
            50, 
            GAME_CONFIG.HEIGHT - 120, 
            'PUNTEGGIO', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#CCCCCC'
            }
        );
        this.hudElements.scoreLabel.setDepth(UI_CONFIG.DEPTH_HUD + 1);
        
        this.hudElements.scoreValue = UIUtils.createText(
            this.scene, 
            50, 
            GAME_CONFIG.HEIGHT - 90, 
            UIUtils.formatScore(this.currentScore), 
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: '#FFFFFF',
                fontStyle: 'bold'
            }
        );
        this.hudElements.scoreValue.setDepth(UI_CONFIG.DEPTH_HUD + 1);
        
        // Level display
        this.hudElements.levelLabel = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT - 120, 
            'LIVELLO', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#CCCCCC',
                align: 'center'
            }
        );
        this.hudElements.levelLabel.setDepth(UI_CONFIG.DEPTH_HUD + 1);
        
        this.hudElements.levelValue = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT - 90, 
            this.currentLevel.toString(), 
            {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#FFFFFF',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        this.hudElements.levelValue.setDepth(UI_CONFIG.DEPTH_HUD + 1);
        
        // Macchiato counter
        this.hudElements.macchiatoLabel = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH - 50, 
            GAME_CONFIG.HEIGHT - 120, 
            'MACCHIATI', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#CCCCCC',
                align: 'right'
            }
        );
        this.hudElements.macchiatoLabel.setDepth(UI_CONFIG.DEPTH_HUD + 1);
        this.hudElements.macchiatoLabel.setOrigin(1, 0.5);
        
        this.hudElements.macchiatoValue = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH - 50, 
            GAME_CONFIG.HEIGHT - 90, 
            this.macchiatoCount.toString(), 
            {
                fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                color: COLORS.MACCHIATO_TEXT,
                fontStyle: 'bold',
                align: 'right'
            }
        );
        this.hudElements.macchiatoValue.setDepth(UI_CONFIG.DEPTH_HUD + 1);
        this.hudElements.macchiatoValue.setOrigin(1, 0.5);
        
        // Pause button
        this.hudElements.pauseButton = this.scene.add.image(
            GAME_CONFIG.WIDTH - 30, 
            30, 
            'pause_button'
        );
        this.hudElements.pauseButton.setDepth(UI_CONFIG.DEPTH_HUD + 1);
        this.hudElements.pauseButton.setInteractive();
        this.hudElements.pauseButton.on('pointerdown', () => {
            this.showPauseMenu();
        });
        
        // Add hover effect for pause button
        this.hudElements.pauseButton.on('pointerover', () => {
            this.hudElements.pauseButton.setScale(1.1);
        });
        this.hudElements.pauseButton.on('pointerout', () => {
            this.hudElements.pauseButton.setScale(1);
        });
        
        DebugUtils.log('DEBUG', 'HUD elements created');
    }

    /**
     * Update score display
     * @param {number} score - New score value
     */
    updateScore(score) {
        this.currentScore = score;
        
        if (this.hudElements.scoreValue) {
            // Animate score change
            this.scene.tweens.add({
                targets: this.hudElements.scoreValue,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 150,
                yoyo: true,
                ease: 'Power2.easeOut',
                onComplete: () => {
                    this.hudElements.scoreValue.setText(UIUtils.formatScore(this.currentScore));
                }
            });
        }
    }

    /**
     * Update level display
     * @param {number} level - New level number
     */
    updateLevel(level) {
        this.currentLevel = level;
        
        if (this.hudElements.levelValue) {
            this.hudElements.levelValue.setText(this.currentLevel.toString());
        }
    }

    /**
     * Update macchiato count display
     * @param {number} count - Number of remaining macchiato grapes
     */
    updateMacchiatoCount(count) {
        this.macchiatoCount = count;
        
        if (this.hudElements.macchiatoValue) {
            this.hudElements.macchiatoValue.setText(this.macchiatoCount.toString());
            
            // Pulse effect when count changes
            this.scene.tweens.add({
                targets: this.hudElements.macchiatoValue,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 200,
                yoyo: true,
                ease: 'Back.easeOut'
            });
            
            // Change color based on count
            const color = count === 0 ? '#00FF00' : COLORS.MACCHIATO_TEXT;
            this.hudElements.macchiatoValue.setColor(color);
        }
    }

    /**
     * Show level transition overlay
     * @param {string} text - Text to display
     * @param {number} duration - Duration to show overlay
     * @param {Function} callback - Callback when overlay is dismissed
     */
    showLevelOverlay(text, duration = 3000, callback = null) {
        this.clearOverlay();
        
        // Semi-transparent background
        this.overlayElements.background = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT, 
            COLORS.UI_DARK, 
            0.8
        );
        this.overlayElements.background.setDepth(UI_CONFIG.DEPTH_OVERLAY);
        
        // Main text
        this.overlayElements.mainText = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 - 50, 
            text, 
            {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#FFFFFF',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: GAME_CONFIG.WIDTH - 40 }
            }
        );
        this.overlayElements.mainText.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        
        // Level number if applicable
        if (this.currentLevel > 0) {
            this.overlayElements.levelText = UIUtils.createText(
                this.scene, 
                GAME_CONFIG.WIDTH / 2, 
                GAME_CONFIG.HEIGHT / 2 + 20, 
                `Livello ${this.currentLevel}`, 
                {
                    fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
                    color: '#CCCCCC',
                    align: 'center'
                }
            );
            this.overlayElements.levelText.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        }
        
        // Continue button or auto-dismiss
        if (duration > 0) {
            this.scene.time.delayedCall(duration, () => {
                this.clearOverlay();
                if (callback) callback();
            });
        } else {
            // Manual dismiss
            this.overlayElements.continueButton = UIUtils.createButton(
                this.scene,
                GAME_CONFIG.WIDTH / 2,
                GAME_CONFIG.HEIGHT / 2 + 80,
                'CONTINUA',
                () => {
                    this.clearOverlay();
                    if (callback) callback();
                }
            );
            this.overlayElements.continueButton.button.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
            this.overlayElements.continueButton.text.setDepth(UI_CONFIG.DEPTH_OVERLAY + 2);
        }
        
        this.isOverlayVisible = true;
        this.currentOverlay = 'level';
        
        DebugUtils.log('DEBUG', `Level overlay shown: ${text}`);
    }

    /**
     * Show game over screen
     * @param {boolean} isWin - Whether player won or lost
     * @param {number} finalScore - Final score
     * @param {Function} restartCallback - Callback for restart
     * @param {Function} menuCallback - Callback for menu
     */
    showGameOverScreen(isWin, finalScore, restartCallback = null, menuCallback = null) {
        this.clearOverlay();
        
        // Background
        this.overlayElements.background = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT, 
            COLORS.UI_DARK, 
            0.9
        );
        this.overlayElements.background.setDepth(UI_CONFIG.DEPTH_OVERLAY);
        
        // Title
        const titleText = isWin ? 'VITTORIA!' : 'GAME OVER';
        const titleColor = isWin ? '#00FF00' : '#FF0000';
        
        this.overlayElements.title = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 - 120, 
            titleText, 
            {
                fontSize: UI_CONFIG.FONT_SIZE_XLARGE,
                color: titleColor,
                fontStyle: 'bold',
                align: 'center'
            }
        );
        this.overlayElements.title.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        
        // Final score
        this.overlayElements.scoreLabel = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 - 60, 
            'PUNTEGGIO FINALE', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#CCCCCC',
                align: 'center'
            }
        );
        this.overlayElements.scoreLabel.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        
        this.overlayElements.finalScore = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 - 20, 
            UIUtils.formatScore(finalScore), 
            {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#FFFFFF',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        this.overlayElements.finalScore.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        
        // Buttons
        if (restartCallback) {
            this.overlayElements.restartButton = UIUtils.createButton(
                this.scene,
                GAME_CONFIG.WIDTH / 2 - 80,
                GAME_CONFIG.HEIGHT / 2 + 60,
                'RIGIOCA',
                restartCallback
            );
            this.overlayElements.restartButton.button.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
            this.overlayElements.restartButton.text.setDepth(UI_CONFIG.DEPTH_OVERLAY + 2);
        }
        
        if (menuCallback) {
            this.overlayElements.menuButton = UIUtils.createButton(
                this.scene,
                GAME_CONFIG.WIDTH / 2 + 80,
                GAME_CONFIG.HEIGHT / 2 + 60,
                'MENU',
                menuCallback
            );
            this.overlayElements.menuButton.button.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
            this.overlayElements.menuButton.text.setDepth(UI_CONFIG.DEPTH_OVERLAY + 2);
        }
        
        // Show leaderboard input if high score
        if (isWin) {
            this.showLeaderboardInput(finalScore);
        }
        
        this.isOverlayVisible = true;
        this.currentOverlay = 'gameover';
        
        DebugUtils.log('DEBUG', `Game over screen shown: ${isWin ? 'WIN' : 'LOSE'}, Score: ${finalScore}`);
    }

    /**
     * Show leaderboard input form
     * @param {number} score - Player's score
     */
    showLeaderboardInput(score) {
        // Name input background
        this.overlayElements.inputBackground = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 + 120, 
            300, 
            100, 
            COLORS.UI_SECONDARY, 
            0.9
        );
        this.overlayElements.inputBackground.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        
        // Label
        this.overlayElements.inputLabel = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 + 100, 
            'Inserisci il tuo nome:', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#FFFFFF',
                align: 'center'
            }
        );
        this.overlayElements.inputLabel.setDepth(UI_CONFIG.DEPTH_OVERLAY + 2);
        
        // Create HTML input for name (mobile-friendly)
        this.createNameInput(score);
        
        // Save button
        this.overlayElements.saveButton = UIUtils.createButton(
            this.scene,
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 160,
            'SALVA PUNTEGGIO',
            () => this.saveScore()
        );
        this.overlayElements.saveButton.button.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        this.overlayElements.saveButton.text.setDepth(UI_CONFIG.DEPTH_OVERLAY + 2);
    }

    /**
     * Create HTML input element for name entry
     * @param {number} score - Player's score
     */
    createNameInput(score) {
        // Create HTML input element
        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.placeholder = 'Il tuo nome';
        this.nameInput.maxLength = 20;
        this.nameInput.style.position = 'absolute';
        this.nameInput.style.left = '50%';
        this.nameInput.style.top = '65%';
        this.nameInput.style.transform = 'translate(-50%, -50%)';
        this.nameInput.style.padding = '10px';
        this.nameInput.style.fontSize = '16px';
        this.nameInput.style.border = '2px solid #8B4513';
        this.nameInput.style.borderRadius = '5px';
        this.nameInput.style.zIndex = '1000';
        this.nameInput.style.width = '200px';
        
        document.body.appendChild(this.nameInput);
        this.nameInput.focus();
        
        this.playerScore = score;
    }

    /**
     * Save player score to leaderboard
     */
    async saveScore() {
        if (!this.nameInput || !this.nameInput.value.trim()) {
            this.showToast('Inserisci un nome valido!');
            return;
        }
        
        const playerName = this.nameInput.value.trim();
        const score = this.playerScore || 0;
        
        try {
            // Send score to backend
            const response = await fetch('api/save_score.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: playerName,
                    score: score,
                    level: this.currentLevel
                })
            });
            
            if (response.ok) {
                this.showToast('Punteggio salvato!');
                this.removeNameInput();
                
                // Hide leaderboard input elements
                if (this.overlayElements.inputBackground) this.overlayElements.inputBackground.setVisible(false);
                if (this.overlayElements.inputLabel) this.overlayElements.inputLabel.setVisible(false);
                if (this.overlayElements.saveButton) {
                    this.overlayElements.saveButton.button.setVisible(false);
                    this.overlayElements.saveButton.text.setVisible(false);
                }
            } else {
                this.showToast('Errore nel salvare il punteggio');
            }
        } catch (error) {
            DebugUtils.log('ERROR', 'Failed to save score:', error);
            this.showToast('Errore di connessione');
        }
    }

    /**
     * Remove HTML name input element
     */
    removeNameInput() {
        if (this.nameInput && this.nameInput.parentNode) {
            this.nameInput.parentNode.removeChild(this.nameInput);
            this.nameInput = null;
        }
    }

    /**
     * Show pause menu
     */
    showPauseMenu() {
        if (this.scene.scene.isPaused()) return;
        
        this.scene.scene.pause();
        this.clearOverlay();
        
        // Background
        this.overlayElements.background = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2, 
            GAME_CONFIG.WIDTH, 
            GAME_CONFIG.HEIGHT, 
            COLORS.UI_DARK, 
            0.8
        );
        this.overlayElements.background.setDepth(UI_CONFIG.DEPTH_OVERLAY);
        
        // Title
        this.overlayElements.title = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH / 2, 
            GAME_CONFIG.HEIGHT / 2 - 100, 
            'PAUSA', 
            {
                fontSize: UI_CONFIG.FONT_SIZE_LARGE,
                color: '#FFFFFF',
                fontStyle: 'bold',
                align: 'center'
            }
        );
        this.overlayElements.title.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        
        // Resume button
        this.overlayElements.resumeButton = UIUtils.createButton(
            this.scene,
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 - 20,
            'CONTINUA',
            () => {
                this.clearOverlay();
                this.scene.scene.resume();
            }
        );
        this.overlayElements.resumeButton.button.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        this.overlayElements.resumeButton.text.setDepth(UI_CONFIG.DEPTH_OVERLAY + 2);
        
        // Menu button
        this.overlayElements.menuButton = UIUtils.createButton(
            this.scene,
            GAME_CONFIG.WIDTH / 2,
            GAME_CONFIG.HEIGHT / 2 + 40,
            'MENU PRINCIPALE',
            () => {
                this.scene.scene.resume();
                this.scene.scene.start('MenuScene');
            }
        );
        this.overlayElements.menuButton.button.setDepth(UI_CONFIG.DEPTH_OVERLAY + 1);
        this.overlayElements.menuButton.text.setDepth(UI_CONFIG.DEPTH_OVERLAY + 2);
        
        this.isOverlayVisible = true;
        this.currentOverlay = 'pause';
    }

    /**
     * Show toast message
     * @param {string} message - Message to display
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, duration = 2000) {
        // Remove existing toast
        if (this.toastElement) {
            this.toastElement.destroy();
        }
        
        // Create toast background
        this.toastElement = this.scene.add.rectangle(
            GAME_CONFIG.WIDTH / 2, 
            100, 
            message.length * 12 + 40, 
            50, 
            COLORS.UI_DARK, 
            0.9
        );
        this.toastElement.setDepth(UI_CONFIG.DEPTH_TOAST);
        
        // Create toast text
        this.toastText = UIUtils.createText(
            this.scene, 
            GAME_CONFIG.WIDTH / 2, 
            100, 
            message, 
            {
                fontSize: UI_CONFIG.FONT_SIZE_SMALL,
                color: '#FFFFFF',
                align: 'center'
            }
        );
        this.toastText.setDepth(UI_CONFIG.DEPTH_TOAST + 1);
        
        // Auto-hide
        this.scene.time.delayedCall(duration, () => {
            if (this.toastElement) {
                this.toastElement.destroy();
                this.toastElement = null;
            }
            if (this.toastText) {
                this.toastText.destroy();
                this.toastText = null;
            }
        });
    }

    /**
     * Clear current overlay
     */
    clearOverlay() {
        Object.values(this.overlayElements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            } else if (element && element.button) {
                // Handle button objects
                element.button.destroy();
                element.text.destroy();
            }
        });
        
        this.overlayElements = {};
        this.removeNameInput();
        this.isOverlayVisible = false;
        this.currentOverlay = null;
    }

    /**
     * Clear HUD elements
     */
    clearHUD() {
        Object.values(this.hudElements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        
        this.hudElements = {};
    }

    /**
     * Update UI state
     * @param {number} delta - Time delta
     */
    update(delta) {
        // Update any animated UI elements
    }

    /**
     * Cleanup UI resources
     */
    destroy() {
        this.clearHUD();
        this.clearOverlay();
        this.removeNameInput();
        
        DebugUtils.log('DEBUG', 'UIManager destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
