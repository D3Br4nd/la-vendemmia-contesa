/**
 * La Vendemmia Contesa - Shooter Component
 * Sistema di mira e lancio degli acini (mobile-first)
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

class Shooter {
    /**
     * Constructor for Shooter
     * @param {Phaser.Scene} scene - The game scene
     * @param {GridManager} gridManager - Reference to grid manager
     */
    constructor(scene, gridManager) {
        this.scene = scene;
        this.gridManager = gridManager;
        
        // Shooter state
        this.isAiming = false;
        this.isLoaded = false;
        this.canShoot = true;
        
        // Current grape
        this.currentGrape = null;
        this.nextGrape = null;
        
        // Aiming
        this.aimLine = null;
        this.aimStartX = GAME_CONFIG.WIDTH / 2;
        this.aimStartY = GAME_CONFIG.HEIGHT - SHOOTER_CONFIG.SHOOTER_Y_OFFSET;
        this.aimDirection = { x: 0, y: -1 };
        this.aimPower = 1;
        
        // Visual elements
        this.shooterBase = null;
        this.trajectoryLine = null;
        this.powerIndicator = null;
        
        // Initialize shooter
        this.setupShooter();
        this.loadNextGrape();
        
        DebugUtils.log('INFO', 'Shooter initialized');
    }

    /**
     * Setup shooter visual elements
     */
    setupShooter() {
        // Create shooter base (tralcio)
        this.shooterBase = this.scene.add.image(this.aimStartX, this.aimStartY, 'shooter_base');
        this.shooterBase.setOrigin(0.5, 1);
        this.shooterBase.setDepth(UI_CONFIG.DEPTH_SHOOTER);
        
        // Create trajectory line graphics
        this.trajectoryLine = this.scene.add.graphics();
        this.trajectoryLine.setDepth(UI_CONFIG.DEPTH_TRAJECTORY);
        
        // Create power indicator
        this.powerIndicator = this.scene.add.graphics();
        this.powerIndicator.setDepth(UI_CONFIG.DEPTH_UI);
        
        DebugUtils.log('DEBUG', 'Shooter visual elements created');
    }

    /**
     * Load next grape into shooter
     */
    loadNextGrape() {
        if (this.currentGrape) {
            this.currentGrape.destroy();
        }
        
        // Move next grape to current
        this.currentGrape = this.nextGrape;
        
        // Generate new next grape
        this.nextGrape = this.generateRandomGrape();
        
        // Position current grape at shooter
        if (this.currentGrape) {
            this.currentGrape.setPosition(this.aimStartX, this.aimStartY - 30);
            this.currentGrape.setAsShooterGrape();
            this.isLoaded = true;
        }
        
        // Position next grape preview
        if (this.nextGrape) {
            this.nextGrape.setPosition(
                this.aimStartX + SHOOTER_CONFIG.NEXT_GRAPE_OFFSET_X, 
                this.aimStartY + SHOOTER_CONFIG.NEXT_GRAPE_OFFSET_Y
            );
            this.nextGrape.setScale(0.7); // Smaller preview
            this.nextGrape.setAlpha(0.8);
        }
        
        DebugUtils.log('DEBUG', 'Next grape loaded');
    }

    /**
     * Generate a random grape for shooting
     * @returns {Grape} New grape instance
     */
    generateRandomGrape() {
        // Get colors that exist in the grid to ensure strategic play
        const existingColors = this.getExistingGrapeColors();
        
        let color;
        if (existingColors.length > 0 && Math.random() < 0.8) {
            // 80% chance to match existing colors
            color = ArrayUtils.randomElement(existingColors);
        } else {
            // 20% chance for any color
            color = ArrayUtils.randomElement(Object.values(GRAPE_COLORS));
        }
        
        const grape = new Grape(
            this.scene, 
            0, 0, 
            color, 
            GRAPE_TYPES.NORMAL
        );
        
        return grape;
    }

    /**
     * Get colors of grapes currently in the grid
     * @returns {Array} Array of grape colors
     */
    getExistingGrapeColors() {
        const colors = new Set();
        
        this.gridManager.grapes.forEach(grape => {
            if (!grape.isMacchiato()) {
                colors.add(grape.grapeColor);
            }
        });
        
        return Array.from(colors);
    }

    /**
     * Start aiming process
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     */
    aim(targetX, targetY) {
        if (!this.canShoot || !this.isLoaded) return;
        
        // Only allow aiming in upper half of screen
        if (!InputUtils.isInAimingArea(targetY)) return;
        
        this.isAiming = true;
        
        // Calculate aim direction
        const dx = targetX - this.aimStartX;
        const dy = targetY - this.aimStartY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 0) {
            this.aimDirection.x = dx / length;
            this.aimDirection.y = dy / length;
            
            // Limit vertical aiming (prevent shooting down)
            this.aimDirection.y = Math.min(this.aimDirection.y, -0.1);
        }
        
        // Calculate power based on distance
        this.aimPower = MathUtils.clamp(length / 200, 0.5, 1.5);
        
        // Update visual indicators
        this.updateTrajectoryLine();
        this.updatePowerIndicator();
        
        DebugUtils.log('DEBUG', `Aiming at (${targetX}, ${targetY}) with power ${this.aimPower}`);
    }

    /**
     * Update trajectory line visualization
     */
    updateTrajectoryLine() {
        if (!this.trajectoryLine || !this.isAiming) return;
        
        this.trajectoryLine.clear();
        
        if (!SHOOTER_CONFIG.SHOW_TRAJECTORY) return;
        
        // Draw dotted trajectory line
        this.trajectoryLine.lineStyle(3, COLORS.UI_SECONDARY, 0.7);
        
        const maxDistance = 300;
        const segments = 20;
        const segmentLength = maxDistance / segments;
        
        for (let i = 0; i < segments; i++) {
            if (i % 2 === 0) continue; // Create dotted effect
            
            const startDist = i * segmentLength;
            const endDist = (i + 1) * segmentLength;
            
            const startX = this.aimStartX + this.aimDirection.x * startDist;
            const startY = this.aimStartY + this.aimDirection.y * startDist;
            const endX = this.aimStartX + this.aimDirection.x * endDist;
            const endY = this.aimStartY + this.aimDirection.y * endDist;
            
            // Stop if we hit screen bounds
            if (startY < 0 || startX < 0 || startX > GAME_CONFIG.WIDTH) break;
            
            this.trajectoryLine.beginPath();
            this.trajectoryLine.moveTo(startX, startY);
            this.trajectoryLine.lineTo(endX, endY);
            this.trajectoryLine.strokePath();
        }
    }

    /**
     * Update power indicator visualization
     */
    updatePowerIndicator() {
        if (!this.powerIndicator || !this.isAiming) return;
        
        this.powerIndicator.clear();
        
        if (!SHOOTER_CONFIG.SHOW_POWER) return;
        
        // Draw power indicator arc around shooter
        const radius = 40;
        const startAngle = -Math.PI / 4;
        const endAngle = startAngle + (Math.PI / 2) * this.aimPower;
        
        this.powerIndicator.lineStyle(5, COLORS.UI_PRIMARY, 0.8);
        this.powerIndicator.beginPath();
        this.powerIndicator.arc(this.aimStartX, this.aimStartY - 30, radius, startAngle, endAngle);
        this.powerIndicator.strokePath();
    }

    /**
     * Fire the current grape
     * @returns {boolean} True if grape was fired successfully
     */
    fire() {
        if (!this.canShoot || !this.isLoaded || !this.currentGrape) {
            DebugUtils.log('WARN', 'Cannot fire: not ready');
            return false;
        }
        
        // Clear aiming visuals
        this.clearAimingVisuals();
        
        // Calculate velocity
        const speed = PHYSICS.SHOOT_SPEED * this.aimPower;
        const velocityX = this.aimDirection.x * speed;
        const velocityY = this.aimDirection.y * speed;
        
        // Set grape physics
        if (this.currentGrape.body) {
            this.currentGrape.body.setVelocity(velocityX, velocityY);
            this.currentGrape.body.setBounce(PHYSICS.BOUNCE_FACTOR);
        } else {
            // Manual physics fallback
            this.currentGrape.velocityX = velocityX;
            this.currentGrape.velocityY = velocityY;
        }
        
        // Track the shot grape
        this.setupGrapeTracking(this.currentGrape);
        
        // Play shooting sound
        AudioUtils.playSound(this.scene, 'grape_launch');
        
        // Shooter feedback
        this.playShootAnimation();
        
        // Reset shooter state
        this.isAiming = false;
        this.isLoaded = false;
        this.canShoot = false;
        this.currentGrape = null;
        
        // Load next grape after delay
        this.scene.time.delayedCall(SHOOTER_CONFIG.RELOAD_DELAY, () => {
            this.loadNextGrape();
            this.canShoot = true;
        });
        
        DebugUtils.log('INFO', `Grape fired with velocity (${velocityX.toFixed(2)}, ${velocityY.toFixed(2)})`);
        return true;
    }

    /**
     * Setup tracking for a fired grape
     * @param {Grape} grape - The grape to track
     */
    setupGrapeTracking(grape) {
        // Create update function for manual physics
        const updateGrape = () => {
            if (!grape || !grape.scene) return;
            
            if (!grape.body && grape.velocityX !== undefined) {
                // Manual physics update
                grape.x += grape.velocityX * (1/60); // Assuming 60 FPS
                grape.y += grape.velocityY * (1/60);
                
                // Wall bounce
                if (grape.x <= grape.displayWidth/2 || grape.x >= GAME_CONFIG.WIDTH - grape.displayWidth/2) {
                    grape.velocityX *= -PHYSICS.BOUNCE_FACTOR;
                    grape.x = MathUtils.clamp(grape.x, grape.displayWidth/2, GAME_CONFIG.WIDTH - grape.displayWidth/2);
                    AudioUtils.playSound(this.scene, 'grape_bounce');
                }
                
                // Top wall bounce
                if (grape.y <= grape.displayHeight/2) {
                    grape.velocityY *= -PHYSICS.BOUNCE_FACTOR;
                    grape.y = grape.displayHeight/2;
                    AudioUtils.playSound(this.scene, 'grape_bounce');
                }
            }
            
            // Check collisions with grid grapes
            const collisions = this.gridManager.getCollisions(grape);
            
            if (collisions.length > 0) {
                this.handleGrapeCollision(grape);
            }
            // Continue tracking if grape is still moving
            else if (grape.body ? grape.body.velocity.length() > 10 : 
                     (Math.abs(grape.velocityX) > 10 || Math.abs(grape.velocityY) > 10)) {
                this.scene.time.delayedCall(16, updateGrape); // ~60 FPS
            }
            // Grape stopped moving without collision (shouldn't happen, but safety)
            else {
                this.handleGrapeStop(grape);
            }
        };
        
        // Start tracking
        this.scene.time.delayedCall(16, updateGrape);
    }

    /**
     * Handle grape collision with grid
     * @param {Grape} grape - The collided grape
     */
    handleGrapeCollision(grape) {
        if (!grape || !grape.scene) return;
        
        // Stop grape movement
        if (grape.body) {
            grape.body.setVelocity(0, 0);
        } else {
            grape.velocityX = 0;
            grape.velocityY = 0;
        }
        
        // Find position in grid
        const gridPos = this.gridManager.snapToGrid(grape);
        
        if (gridPos) {
            // Animate snap to grid
            grape.snapToGridAnimated(gridPos.col, gridPos.row, () => {
                this.processGrapePlacement(grape);
            });
        } else {
            // No valid position found, remove grape
            grape.destroy();
            DebugUtils.log('WARN', 'No valid grid position found for collided grape');
        }
        
        // Play collision sound
        AudioUtils.playSound(this.scene, 'grape_collision');
    }

    /**
     * Handle grape stopping without collision
     * @param {Grape} grape - The stopped grape
     */
    handleGrapeStop(grape) {
        // This shouldn't normally happen, but handle it gracefully
        const gridPos = this.gridManager.snapToGrid(grape);
        
        if (gridPos) {
            grape.snapToGridAnimated(gridPos.col, gridPos.row, () => {
                this.processGrapePlacement(grape);
            });
        } else {
            grape.destroy();
        }
    }

    /**
     * Process grape placement and check for matches
     * @param {Grape} grape - The placed grape
     */
    processGrapePlacement(grape) {
        // Find matches
        const matches = this.gridManager.findMatches(grape);
        
        if (matches.length >= GAME_CONFIG.MIN_MATCH_SIZE) {
            // Process matches and calculate score
            const score = this.gridManager.processMatches(matches);
            
            // Notify scene of score change
            if (this.scene.addScore) {
                this.scene.addScore(score);
            }
            
            // Check win condition
            if (this.gridManager.checkWinCondition()) {
                this.scene.time.delayedCall(500, () => {
                    if (this.scene.levelComplete) {
                        this.scene.levelComplete();
                    }
                });
            }
        }
        
        // Check lose condition
        if (this.gridManager.checkLoseCondition()) {
            this.scene.time.delayedCall(100, () => {
                if (this.scene.gameOver) {
                    this.scene.gameOver();
                }
            });
        }
    }

    /**
     * Play shooting animation
     */
    playShootAnimation() {
        if (this.shooterBase) {
            this.scene.tweens.add({
                targets: this.shooterBase,
                scaleX: 1.1,
                scaleY: 0.9,
                duration: 100,
                yoyo: true,
                ease: 'Power2.easeOut'
            });
        }
    }

    /**
     * Clear aiming visual indicators
     */
    clearAimingVisuals() {
        if (this.trajectoryLine) {
            this.trajectoryLine.clear();
        }
        if (this.powerIndicator) {
            this.powerIndicator.clear();
        }
        this.isAiming = false;
    }

    /**
     * Enable/disable shooter
     * @param {boolean} enabled - Whether shooter should be enabled
     */
    setEnabled(enabled) {
        this.canShoot = enabled;
        
        if (!enabled) {
            this.clearAimingVisuals();
        }
        
        // Visual feedback
        const alpha = enabled ? 1 : 0.5;
        if (this.currentGrape) this.currentGrape.setAlpha(alpha);
        if (this.nextGrape) this.nextGrape.setAlpha(alpha * 0.8);
        if (this.shooterBase) this.shooterBase.setAlpha(alpha);
    }

    /**
     * Update shooter state
     * @param {number} delta - Time delta
     */
    update(delta) {
        // Update any continuous animations or effects
        if (this.isAiming) {
            this.updateTrajectoryLine();
            this.updatePowerIndicator();
        }
    }

    /**
     * Cleanup shooter resources
     */
    destroy() {
        if (this.currentGrape) {
            this.currentGrape.destroy();
        }
        if (this.nextGrape) {
            this.nextGrape.destroy();
        }
        if (this.trajectoryLine) {
            this.trajectoryLine.destroy();
        }
        if (this.powerIndicator) {
            this.powerIndicator.destroy();
        }
        if (this.shooterBase) {
            this.shooterBase.destroy();
        }
        
        DebugUtils.log('DEBUG', 'Shooter destroyed');
    }
}

// Export for use in other modules
window.Shooter = Shooter;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Shooter;
}
