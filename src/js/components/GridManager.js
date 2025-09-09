/**
 * La Vendemmia Contesa - Grid Manager
 * Gestisce la griglia di acini e la logica di matching
 * Versione: 1.1 - Natale 2025 Rosso Macchiato
 */

class GridManager {
    /**
     * Constructor for GridManager
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.grid = [];
        this.grapes = [];
        this.macchiatoGrapes = [];
        
        // Initialize empty grid
        this.initializeGrid();
        
        DebugUtils.log('INFO', 'GridManager initialized');
    }

    /**
     * Initialize empty grid structure
     */
    initializeGrid() {
        this.grid = [];
        for (let row = 0; row < GRID_CONFIG.ROWS; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GRID_CONFIG.COLS; col++) {
                this.grid[row][col] = null;
            }
        }
    }

    /**
     * Populate grid with level data
     * @param {Object} levelData - Level configuration data
     */
    populateGrid(levelData) {
        this.clearGrid();
        this.initializeGrid();
        
        if (!levelData || !levelData.grapes) {
            DebugUtils.log('WARN', 'No level data provided to populateGrid');
            return;
        }

        // Create grapes from level data
        levelData.grapes.forEach(grapeData => {
            if (GridUtils.isValidPosition(grapeData.col, grapeData.row)) {
                const grape = this.createGrape(
                    grapeData.col, 
                    grapeData.row, 
                    grapeData.color, 
                    grapeData.type || GRAPE_TYPES.NORMAL
                );
                
                if (grape) {
                    this.placeGrapeAt(grape, grapeData.col, grapeData.row);
                    
                    // Track macchiato grapes for win condition
                    if (grape.isMacchiato()) {
                        this.macchiatoGrapes.push(grape);
                    }
                }
            }
        });

        DebugUtils.log('INFO', `Grid populated with ${this.grapes.length} grapes, ${this.macchiatoGrapes.length} macchiato`);
    }

    /**
     * Create a new grape at specified grid position
     * @param {number} col - Grid column
     * @param {number} row - Grid row
     * @param {string} color - Grape color
     * @param {string} type - Grape type
     * @returns {Grape} Created grape instance
     */
    createGrape(col, row, color, type = GRAPE_TYPES.NORMAL) {
        const screenPos = GridUtils.gridToScreen(col, row);
        const grape = new Grape(this.scene, screenPos.x, screenPos.y, color, type);
        
        this.grapes.push(grape);
        return grape;
    }

    /**
     * Place a grape at specific grid position
     * @param {Grape} grape - The grape to place
     * @param {number} col - Grid column
     * @param {number} row - Grid row
     */
    placeGrapeAt(grape, col, row) {
        if (!GridUtils.isValidPosition(col, row)) {
            DebugUtils.log('WARN', `Invalid grid position: (${col}, ${row})`);
            return false;
        }

        if (this.grid[row][col] !== null) {
            DebugUtils.log('WARN', `Grid position (${col}, ${row}) already occupied`);
            return false;
        }

        this.grid[row][col] = grape;
        grape.setGridPosition(col, row);
        grape.isAttached = true;
        
        return true;
    }

    /**
     * Find the best position to snap a grape to the grid
     * @param {Grape} grape - The grape to snap
     * @returns {Object|null} Best grid position {col, row} or null if no valid position
     */
    snapToGrid(grape) {
        const gridPos = GridUtils.screenToGrid(grape.x, grape.y);
        
        // Find nearest available position
        const nearestPos = this.findNearestAvailablePosition(grape.x, grape.y);
        
        if (nearestPos) {
            this.placeGrapeAt(grape, nearestPos.col, nearestPos.row);
            return nearestPos;
        }
        
        return null;
    }

    /**
     * Find nearest available grid position to given coordinates
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {Object|null} Nearest position {col, row} or null
     */
    findNearestAvailablePosition(x, y) {
        let nearestPos = null;
        let minDistance = Infinity;

        for (let row = 0; row < GRID_CONFIG.ROWS; row++) {
            for (let col = 0; col < GRID_CONFIG.COLS; col++) {
                if (this.grid[row][col] === null) {
                    const screenPos = GridUtils.gridToScreen(col, row);
                    const distance = MathUtils.distance(x, y, screenPos.x, screenPos.y);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestPos = { col, row };
                    }
                }
            }
        }

        return nearestPos;
    }

    /**
     * Find matches starting from a specific grape
     * @param {Grape} startGrape - The grape to start matching from
     * @returns {Array} Array of matching grapes
     */
    findMatches(startGrape) {
        if (!startGrape || startGrape.isMacchiato()) {
            return [];
        }

        const matches = [];
        const visited = new Set();
        const queue = [startGrape];
        
        while (queue.length > 0) {
            const currentGrape = queue.shift();
            const grapeKey = `${currentGrape.gridPosition.col},${currentGrape.gridPosition.row}`;
            
            if (visited.has(grapeKey)) continue;
            visited.add(grapeKey);
            matches.push(currentGrape);
            
            // Check neighbors
            const neighbors = this.getNeighbors(currentGrape.gridPosition.col, currentGrape.gridPosition.row);
            
            neighbors.forEach(neighbor => {
                const neighborKey = `${neighbor.col},${neighbor.row}`;
                if (!visited.has(neighborKey) && neighbor.matchesColor(currentGrape)) {
                    queue.push(neighbor);
                }
            });
        }

        DebugUtils.log('DEBUG', `Found ${matches.length} matching grapes`);
        return matches;
    }

    /**
     * Get neighboring grapes for a grid position
     * @param {number} col - Grid column
     * @param {number} row - Grid row
     * @returns {Array} Array of neighboring grapes
     */
    getNeighbors(col, row) {
        const neighbors = [];
        const neighborPositions = GridUtils.getNeighbors(col, row);
        
        neighborPositions.forEach(pos => {
            const grape = this.getGrapeAt(pos.col, pos.row);
            if (grape) {
                neighbors.push(grape);
            }
        });
        
        return neighbors;
    }

    /**
     * Get grape at specific grid position
     * @param {number} col - Grid column
     * @param {number} row - Grid row
     * @returns {Grape|null} Grape at position or null
     */
    getGrapeAt(col, row) {
        if (!GridUtils.isValidPosition(col, row)) {
            return null;
        }
        return this.grid[row][col];
    }

    /**
     * Remove grape from grid
     * @param {Grape} grape - Grape to remove
     */
    removeGrape(grape) {
        if (!grape) return;
        
        const { col, row } = grape.gridPosition;
        
        if (GridUtils.isValidPosition(col, row) && this.grid[row][col] === grape) {
            this.grid[row][col] = null;
        }
        
        // Remove from grapes array
        ArrayUtils.remove(this.grapes, grape);
        
        // Remove from macchiato grapes if it was one
        if (grape.isMacchiato()) {
            ArrayUtils.remove(this.macchiatoGrapes, grape);
        }
    }

    /**
     * Find and remove floating (unattached) grapes
     * @returns {Array} Array of floating grapes that were removed
     */
    findFloatingGrapes() {
        const attachedGrapes = new Set();
        const queue = [];
        
        // Start from top row (attached to ceiling)
        for (let col = 0; col < GRID_CONFIG.COLS; col++) {
            const grape = this.getGrapeAt(col, 0);
            if (grape) {
                queue.push(grape);
                attachedGrapes.add(grape);
            }
        }
        
        // Flood fill to find all attached grapes
        while (queue.length > 0) {
            const currentGrape = queue.shift();
            const neighbors = this.getNeighbors(currentGrape.gridPosition.col, currentGrape.gridPosition.row);
            
            neighbors.forEach(neighbor => {
                if (!attachedGrapes.has(neighbor)) {
                    attachedGrapes.add(neighbor);
                    queue.push(neighbor);
                }
            });
        }
        
        // Find floating grapes (not attached)
        const floatingGrapes = this.grapes.filter(grape => !attachedGrapes.has(grape));
        
        // Remove floating grapes and make them fall
        floatingGrapes.forEach(grape => {
            this.removeGrape(grape);
            grape.detach();
        });
        
        DebugUtils.log('DEBUG', `Found ${floatingGrapes.length} floating grapes`);
        return floatingGrapes;
    }

    /**
     * Process matches and remove them
     * @param {Array} matches - Array of matching grapes
     * @returns {number} Score gained from matches
     */
    processMatches(matches) {
        if (matches.length < GAME_CONFIG.MIN_MATCH_SIZE) {
            return 0;
        }

        let score = 0;
        
        // Remove matches and calculate score
        matches.forEach(grape => {
            this.removeGrape(grape);
            grape.pop();
            score += GAME_CONFIG.POINTS_PER_GRAPE;
        });
        
        // Bonus for large matches
        if (matches.length >= 5) {
            score += GAME_CONFIG.BONUS_LARGE_MATCH;
        }
        
        // Find and drop floating grapes
        const floatingGrapes = this.findFloatingGrapes();
        
        // Bonus score for dropped grapes
        floatingGrapes.forEach(grape => {
            score += GAME_CONFIG.POINTS_PER_DROPPED;
            
            // Extra points for dropped macchiato grapes
            if (grape.isMacchiato()) {
                score += GAME_CONFIG.BONUS_MACCHIATO_DROP;
            }
        });
        
        DebugUtils.log('INFO', `Processed ${matches.length} matches, ${floatingGrapes.length} drops. Score: ${score}`);
        return score;
    }

    /**
     * Check if all macchiato grapes have been eliminated
     * @returns {boolean} True if no macchiato grapes remain
     */
    checkWinCondition() {
        const remainingMacchiato = this.macchiatoGrapes.filter(grape => 
            grape && !grape.isMarkedForRemoval && grape.scene
        );
        
        DebugUtils.log('DEBUG', `Remaining macchiato grapes: ${remainingMacchiato.length}`);
        return remainingMacchiato.length === 0;
    }

    /**
     * Check if grapes have reached the danger line
     * @returns {boolean} True if game should end
     */
    checkLoseCondition() {
        const dangerRow = GRID_CONFIG.DANGER_LINE_ROW;
        
        for (let col = 0; col < GRID_CONFIG.COLS; col++) {
            if (this.getGrapeAt(col, dangerRow)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get all grapes that collide with a moving grape
     * @param {Grape} movingGrape - The moving grape to check collisions for
     * @returns {Array} Array of colliding grapes
     */
    getCollisions(movingGrape) {
        const collisions = [];
        
        this.grapes.forEach(grape => {
            if (grape !== movingGrape && grape.isCollidingWith(movingGrape)) {
                collisions.push(grape);
            }
        });
        
        return collisions;
    }

    /**
     * Clear all grapes from the grid
     */
    clearGrid() {
        this.grapes.forEach(grape => {
            if (grape && grape.destroy) {
                grape.destroy();
            }
        });
        
        this.grapes = [];
        this.macchiatoGrapes = [];
        this.initializeGrid();
        
        DebugUtils.log('INFO', 'Grid cleared');
    }

    /**
     * Update grid state
     * @param {number} delta - Time delta
     */
    update(delta) {
        // Update all grapes
        this.grapes.forEach(grape => {
            if (grape && grape.update) {
                grape.update(delta);
            }
        });
        
        // Remove destroyed grapes from arrays
        this.grapes = this.grapes.filter(grape => grape && grape.scene);
        this.macchiatoGrapes = this.macchiatoGrapes.filter(grape => grape && grape.scene);
    }

    /**
     * Get grid state for debugging
     * @returns {Object} Grid state information
     */
    getDebugInfo() {
        return {
            totalGrapes: this.grapes.length,
            macchiatoGrapes: this.macchiatoGrapes.length,
            attachedGrapes: this.grapes.filter(g => g.isAttached).length,
            movingGrapes: this.grapes.filter(g => g.isMoving).length
        };
    }

    /**
     * Serialize grid data for saving
     * @returns {Object} Serialized grid data
     */
    serialize() {
        const gridData = [];
        
        for (let row = 0; row < GRID_CONFIG.ROWS; row++) {
            for (let col = 0; col < GRID_CONFIG.COLS; col++) {
                const grape = this.getGrapeAt(col, row);
                if (grape) {
                    gridData.push({
                        col,
                        row,
                        ...grape.serialize()
                    });
                }
            }
        }
        
        return { grapes: gridData };
    }

    /**
     * Load grid from serialized data
     * @param {Object} data - Serialized grid data
     */
    deserialize(data) {
        this.clearGrid();
        
        if (data && data.grapes) {
            this.populateGrid(data);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridManager;
}
