/**
 * La Vendemmia Contesa - Helper Functions
 * Funzioni di utilità per "La Vendemmia Contesa"
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

/**
 * Utility functions for mathematical operations
 */
const MathUtils = {
    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    /**
     * Calculate angle between two points in radians
     */
    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * Convert degrees to radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Convert radians to degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },

    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation between two values
     */
    lerp(start, end, amount) {
        return start + (end - start) * amount;
    },

    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Random float between min and max
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
};

/**
 * Grid utility functions
 */
const GridUtils = {
    /**
     * Convert screen coordinates to grid position
     */
    screenToGrid(x, y) {
        const col = Math.floor((x - GRID_CONFIG.OFFSET_X) / GRID_CONFIG.CELL_SIZE);
        const row = Math.floor((y - GRID_CONFIG.START_Y) / GRID_CONFIG.CELL_SIZE);
        return { col, row };
    },

    /**
     * Convert grid position to screen coordinates
     */
    gridToScreen(col, row) {
        const offsetX = (row % 2 === 1) ? GRID_CONFIG.OFFSET_X : 0;
        const x = col * GRID_CONFIG.CELL_SIZE + offsetX + GRID_CONFIG.CELL_SIZE / 2;
        const y = row * GRID_CONFIG.CELL_SIZE + GRID_CONFIG.START_Y + GRID_CONFIG.CELL_SIZE / 2;
        return { x, y };
    },

    /**
     * Check if grid position is valid
     */
    isValidPosition(col, row) {
        return col >= 0 && col < GRID_CONFIG.COLS && row >= 0 && row < GRID_CONFIG.ROWS;
    },

    /**
     * Get neighboring grid positions (hexagonal grid)
     */
    getNeighbors(col, row) {
        const neighbors = [];
        const isOddRow = row % 2 === 1;

        // Hexagonal grid neighbors depend on whether the row is odd or even
        const directions = isOddRow 
            ? [[-1, -1], [0, -1], [-1, 0], [1, 0], [0, 1], [1, 1]]  // Odd row
            : [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1], [0, 1]]; // Even row

        directions.forEach(([dx, dy]) => {
            const newCol = col + dx;
            const newRow = row + dy;
            if (this.isValidPosition(newCol, newRow)) {
                neighbors.push({ col: newCol, row: newRow });
            }
        });

        return neighbors;
    },

    /**
     * Find the best grid position for a grape at given coordinates
     */
    snapToGrid(x, y, excludePositions = []) {
        const gridPos = this.screenToGrid(x, y);
        
        // Check if the calculated position is valid and not excluded
        if (this.isValidPosition(gridPos.col, gridPos.row) && 
            !excludePositions.some(pos => pos.col === gridPos.col && pos.row === gridPos.row)) {
            return gridPos;
        }

        // If not valid, find the closest valid position
        let closestPos = null;
        let minDistance = Infinity;

        for (let row = 0; row < GRID_CONFIG.ROWS; row++) {
            for (let col = 0; col < GRID_CONFIG.COLS; col++) {
                if (!excludePositions.some(pos => pos.col === col && pos.row === row)) {
                    const screenPos = this.gridToScreen(col, row);
                    const distance = MathUtils.distance(x, y, screenPos.x, screenPos.y);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPos = { col, row };
                    }
                }
            }
        }

        return closestPos;
    }
};

/**
 * Color utility functions
 */
const ColorUtils = {
    /**
     * Get color for grape type and color
     */
    getGrapeColor(color, type = GRAPE_TYPES.NORMAL) {
        if (type === GRAPE_TYPES.MACCHIATO) {
            return COLORS.MACCHIATO;
        }
        return COLORS[color] || COLORS[GRAPE_COLORS.AGLIANICO];
    },

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return { r, g, b };
    },

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return (r << 16) | (g << 8) | b;
    },

    /**
     * Interpolate between two colors
     */
    interpolateColor(color1, color2, amount) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        const r = Math.round(MathUtils.lerp(rgb1.r, rgb2.r, amount));
        const g = Math.round(MathUtils.lerp(rgb1.g, rgb2.g, amount));
        const b = Math.round(MathUtils.lerp(rgb1.b, rgb2.b, amount));
        
        return this.rgbToHex(r, g, b);
    }
};

/**
 * Array utility functions
 */
const ArrayUtils = {
    /**
     * Remove element from array
     */
    remove(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    },

    /**
     * Shuffle array in place
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Get random element from array
     */
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Check if two arrays are equal
     */
    areEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    }
};

/**
 * Touch/Input utility functions
 */
const InputUtils = {
    /**
     * Get touch position relative to game canvas
     */
    getTouchPosition(pointer, game) {
        const rect = game.canvas.getBoundingClientRect();
        const scaleX = game.config.width / rect.width;
        const scaleY = game.config.height / rect.height;
        
        return {
            x: (pointer.x - rect.left) * scaleX,
            y: (pointer.y - rect.top) * scaleY
        };
    },

    /**
     * Check if touch is in upper half of screen (aiming area)
     */
    isInAimingArea(y) {
        return y < GAME_CONFIG.HEIGHT / 2;
    },

    /**
     * Normalize touch vector for shooting
     */
    normalizeTouchVector(startX, startY, endX, endY) {
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return { x: 0, y: 0 };
        
        return {
            x: dx / length,
            y: dy / length
        };
    }
};

/**
 * UI utility functions
 */
const UIUtils = {
    /**
     * Create styled text object
     */
    createText(scene, x, y, text, style = {}) {
        const defaultStyle = {
            fontFamily: UI_CONFIG.FONT_FAMILY,
            fontSize: UI_CONFIG.FONT_SIZE_MEDIUM,
            color: '#ffffff',
            align: 'center'
        };
        
        return scene.add.text(x, y, text, { ...defaultStyle, ...style });
    },

    /**
     * Create button with callback
     */
    createButton(scene, x, y, text, callback, style = {}) {
        const defaultStyle = {
            backgroundColor: '#8B4513',
            borderRadius: 8,
            padding: { x: 20, y: 10 }
        };
        
        const button = scene.add.rectangle(x, y, UI_CONFIG.BUTTON_WIDTH, UI_CONFIG.BUTTON_HEIGHT, COLORS.UI_PRIMARY);
        button.setInteractive();
        button.on('pointerdown', callback);
        
        const buttonText = this.createText(scene, x, y, text, {
            fontSize: UI_CONFIG.FONT_SIZE_SMALL,
            color: '#ffffff'
        });
        
        return { button, text: buttonText };
    },

    /**
     * Show loading progress
     */
    updateLoadingProgress(progressBar, percentage) {
        if (progressBar) {
            progressBar.clear();
            progressBar.fillStyle(COLORS.UI_PRIMARY);
            progressBar.fillRect(0, 0, percentage * 200, 20);
        }
    },

    /**
     * Format score with leading zeros
     */
    formatScore(score, digits = 6) {
        return score.toString().padStart(digits, '0');
    },

    /**
     * Format time as MM:SS
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};

/**
 * Local storage utility functions
 */
const StorageUtils = {
    /**
     * Save data to local storage
     */
    save(key, data) {
        try {
            localStorage.setItem(`vendemmia_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    },

    /**
     * Load data from local storage
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`vendemmia_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remove data from local storage
     */
    remove(key) {
        try {
            localStorage.removeItem(`vendemmia_${key}`);
            return true;
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
            return false;
        }
    },

    /**
     * Clear all game data from local storage
     */
    clearAll() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('vendemmia_'));
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
            return false;
        }
    }
};

/**
 * Debug utility functions
 */
const DebugUtils = {
    /**
     * Log with level checking
     */
    log(level, ...args) {
        const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        const currentLevel = levels.indexOf(DEBUG_CONFIG.LOG_LEVEL);
        const messageLevel = levels.indexOf(level);
        
        if (messageLevel >= currentLevel) {
            console[level.toLowerCase()](...args);
        }
    },

    /**
     * Draw debug grid
     */
    drawGrid(graphics, scene) {
        if (!DEBUG_CONFIG.SHOW_GRID) return;
        
        graphics.clear();
        graphics.lineStyle(1, 0xff0000, 0.3);
        
        // Draw grid lines
        for (let row = 0; row < GRID_CONFIG.ROWS; row++) {
            for (let col = 0; col < GRID_CONFIG.COLS; col++) {
                const pos = GridUtils.gridToScreen(col, row);
                graphics.strokeCircle(pos.x, pos.y, GRID_CONFIG.CELL_SIZE / 2);
            }
        }
    },

    /**
     * Show FPS counter
     */
    showFPS(scene) {
        if (!DEBUG_CONFIG.SHOW_FPS) return;
        
        if (!scene.fpsText) {
            scene.fpsText = UIUtils.createText(scene, 10, 10, 'FPS: 60', {
                fontSize: '16px',
                color: '#00ff00'
            });
            scene.fpsText.setDepth(1000);
        }
        
        scene.fpsText.setText(`FPS: ${Math.round(scene.game.loop.actualFps)}`);
    }
};

/**
 * Audio utility functions
 */
const AudioUtils = {
    /**
     * Play sound with volume control
     */
    playSound(scene, key, volume = 1) {
        if (scene.sound && scene.sound.get(key)) {
            scene.sound.play(key, { 
                volume: volume * AUDIO_CONFIG.SFX_VOLUME * AUDIO_CONFIG.MASTER_VOLUME 
            });
        }
    },

    /**
     * Play music with looping
     */
    playMusic(scene, key, volume = 1) {
        if (scene.sound && scene.sound.get(key)) {
            const music = scene.sound.play(key, { 
                volume: volume * AUDIO_CONFIG.MUSIC_VOLUME * AUDIO_CONFIG.MASTER_VOLUME,
                loop: true
            });
            return music;
        }
        return null;
    },

    /**
     * Stop all sounds
     */
    stopAllSounds(scene) {
        if (scene.sound) {
            scene.sound.stopAll();
        }
    },

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        AUDIO_CONFIG.MASTER_VOLUME = MathUtils.clamp(volume, 0, 1);
        StorageUtils.save('masterVolume', AUDIO_CONFIG.MASTER_VOLUME);
    }
};

// Export all utilities
window.MathUtils = MathUtils;
window.GridUtils = GridUtils;
window.ColorUtils = ColorUtils;
window.ArrayUtils = ArrayUtils;
window.InputUtils = InputUtils;
window.UIUtils = UIUtils;
window.StorageUtils = StorageUtils;
window.DebugUtils = DebugUtils;
window.AudioUtils = AudioUtils;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MathUtils,
        GridUtils,
        ColorUtils,
        ArrayUtils,
        InputUtils,
        UIUtils,
        StorageUtils,
        DebugUtils,
        AudioUtils
    };
}
