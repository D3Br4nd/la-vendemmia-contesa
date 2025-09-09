/**
 * La Vendemmia Contesa - Grape Component
 * Classe che rappresenta un singolo acino d'uva
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

class Grape extends Phaser.GameObjects.Sprite {
    /**
     * Constructor for Grape
     * @param {Phaser.Scene} scene - The scene this grape belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Grape color (AGLIANICO, FIANO, GRECO)
     * @param {string} type - Grape type (NORMAL, MACCHIATO)
     */
    constructor(scene, x, y, color = GRAPE_COLORS.AGLIANICO, type = GRAPE_TYPES.NORMAL) {
        // Use the appropriate texture based on type and color
        let textureKey;
        if (type === GRAPE_TYPES.MACCHIATO) {
            textureKey = `grape_${color.toLowerCase()}_macchiato`;
        } else {
            textureKey = `grape_${color.toLowerCase()}`;
        }
        
        super(scene, x, y, textureKey);
        
        // Add to scene
        scene.add.existing(this);
        
        // Properties
        this.grapeColor = color;
        this.grapeType = type;
        this.gridPosition = { col: -1, row: -1 };
        this.isAttached = true;
        this.isMoving = false;
        this.isMarkedForRemoval = false;
        this.fallSpeed = 0;
        
        // Visual properties
        this.setOrigin(0.5, 0.5);
        this.setDisplaySize(GRID_CONFIG.CELL_SIZE * 0.8, GRID_CONFIG.CELL_SIZE * 0.8);
        
        // Physics setup if needed
        if (scene.physics && scene.physics.world) {
            scene.physics.world.enable(this);
            this.body.setCircle(this.displayWidth / 2);
            this.body.setCollideWorldBounds(true);
        }
        
        // Visual effects
        this.setupVisualEffects();
        
        // Debug info
        DebugUtils.log('DEBUG', `Created grape: ${color} ${type} at (${x}, ${y})`);
    }

    /**
     * Setup visual effects for the grape
     */
    setupVisualEffects() {
        // Add subtle glow for macchiato grapes
        if (this.grapeType === GRAPE_TYPES.MACCHIATO) {
            this.setTint(COLORS.MACCHIATO);
            
            // Add pulsing effect for macchiato grapes
            this.scene.tweens.add({
                targets: this,
                alpha: 0.7,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } else {
            // Set color tint for normal grapes
            this.setTint(ColorUtils.getGrapeColor(this.grapeColor, this.grapeType));
        }
        
        // Add slight scale animation on creation
        this.setScale(0);
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Set the grid position of this grape
     * @param {number} col - Column position
     * @param {number} row - Row position
     */
    setGridPosition(col, row) {
        this.gridPosition.col = col;
        this.gridPosition.row = row;
        
        // Update screen position based on grid
        const screenPos = GridUtils.gridToScreen(col, row);
        this.setPosition(screenPos.x, screenPos.y);
        
        DebugUtils.log('DEBUG', `Grape positioned at grid (${col}, ${row}) screen (${screenPos.x}, ${screenPos.y})`);
    }

    /**
     * Get the current grid position
     * @returns {Object} Grid position {col, row}
     */
    getGridPosition() {
        return { ...this.gridPosition };
    }

    /**
     * Check if this grape matches another grape's color
     * @param {Grape} otherGrape - The grape to compare with
     * @returns {boolean} True if colors match
     */
    matchesColor(otherGrape) {
        // Macchiato grapes don't match with anything
        if (this.grapeType === GRAPE_TYPES.MACCHIATO || otherGrape.grapeType === GRAPE_TYPES.MACCHIATO) {
            return false;
        }
        
        return this.grapeColor === otherGrape.grapeColor;
    }

    /**
     * Check if this grape is a macchiato (spotted) grape
     * @returns {boolean} True if this is a macchiato grape
     */
    isMacchiato() {
        return this.grapeType === GRAPE_TYPES.MACCHIATO;
    }

    /**
     * Mark this grape as detached (floating)
     */
    detach() {
        this.isAttached = false;
        this.startFalling();
    }

    /**
     * Start the falling animation
     */
    startFalling() {
        if (this.isMoving) return;
        
        this.isMoving = true;
        this.fallSpeed = PHYSICS.GRAVITY;
        
        // Add rotation while falling
        this.scene.tweens.add({
            targets: this,
            rotation: this.rotation + (Math.random() > 0.5 ? Math.PI * 2 : -Math.PI * 2),
            duration: 1000,
            ease: 'Linear'
        });
        
        // Add falling physics
        if (this.body) {
            this.body.setVelocityY(this.fallSpeed);
        }
        
        DebugUtils.log('DEBUG', `Grape started falling from (${this.x}, ${this.y})`);
    }

    /**
     * Update the grape's state
     * @param {number} delta - Time delta
     */
    update(delta) {
        if (this.isMoving && !this.body) {
            // Manual falling physics if no physics body
            this.y += this.fallSpeed * (delta / 1000);
            this.fallSpeed += PHYSICS.GRAVITY * (delta / 1000);
            
            // Remove if fallen off screen
            if (this.y > GAME_CONFIG.HEIGHT + 100) {
                this.destroy();
            }
        }
    }

    /**
     * Play pop animation and destroy
     * @param {Function} callback - Callback to execute after animation
     */
    pop(callback = null) {
        if (this.isMarkedForRemoval) return;
        
        this.isMarkedForRemoval = true;
        
        // Play pop sound
        AudioUtils.playSound(this.scene, 'grape_explosion');
        
        // Create pop effect
        this.createPopEffect();
        
        // Scale down animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete: () => {
                if (callback) callback();
                this.destroy();
            }
        });
        
        DebugUtils.log('DEBUG', `Grape popped at (${this.x}, ${this.y})`);
    }

    /**
     * Create visual pop effect
     */
    createPopEffect() {
        // Create particle effect for popping
        const particles = this.scene.add.particles(this.x, this.y, 'grape_particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.3, end: 0 },
            lifespan: 300,
            quantity: 5,
            tint: ColorUtils.getGrapeColor(this.grapeColor, this.grapeType)
        });
        
        // Remove particles after animation
        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
    }

    /**
     * Highlight this grape (for matching indication)
     */
    highlight() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Animate the grape snapping to grid position
     * @param {number} targetCol - Target column
     * @param {number} targetRow - Target row
     * @param {Function} callback - Callback after animation
     */
    snapToGridAnimated(targetCol, targetRow, callback = null) {
        const targetPos = GridUtils.gridToScreen(targetCol, targetRow);
        
        this.scene.tweens.add({
            targets: this,
            x: targetPos.x,
            y: targetPos.y,
            duration: 300,
            ease: 'Power2.easeOut',
            onComplete: () => {
                this.setGridPosition(targetCol, targetRow);
                this.isMoving = false;
                if (callback) callback();
            }
        });
        
        // Play snap sound
        AudioUtils.playSound(this.scene, 'grape_match');
    }

    /**
     * Check collision with another grape
     * @param {Grape} otherGrape - The other grape to check collision with
     * @returns {boolean} True if colliding
     */
    isCollidingWith(otherGrape) {
        const distance = MathUtils.distance(this.x, this.y, otherGrape.x, otherGrape.y);
        const collisionDistance = (this.displayWidth + otherGrape.displayWidth) / 2 * 0.9; // Slightly smaller for better feel
        
        return distance < collisionDistance;
    }

    /**
     * Set the grape as a shooter grape (different behavior)
     */
    setAsShooterGrape() {
        this.isAttached = false;
        this.isMoving = true;
        
        // Disable physics body collision with world bounds for shooter grape
        if (this.body) {
            this.body.setCollideWorldBounds(false);
        }
    }

    /**
     * Get grape data for saving/loading
     * @returns {Object} Grape data
     */
    serialize() {
        return {
            color: this.grapeColor,
            type: this.grapeType,
            gridPosition: { ...this.gridPosition },
            isAttached: this.isAttached
        };
    }

    /**
     * Load grape from data
     * @param {Object} data - Grape data
     */
    deserialize(data) {
        this.grapeColor = data.color;
        this.grapeType = data.type;
        this.isAttached = data.isAttached;
        
        if (data.gridPosition.col !== -1 && data.gridPosition.row !== -1) {
            this.setGridPosition(data.gridPosition.col, data.gridPosition.row);
        }
        
        // Update visual appearance
        this.setupVisualEffects();
    }

    /**
     * Cleanup when grape is destroyed
     */
    destroy() {
        // Stop all tweens targeting this grape
        this.scene.tweens.killTweensOf(this);
        
        // Call parent destroy
        super.destroy();
        
        DebugUtils.log('DEBUG', `Grape destroyed at (${this.x}, ${this.y})`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Grape;
}
