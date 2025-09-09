/**
 * Fallback Scene - Simple scene to test basic functionality
 */

window.FallbackScene = class FallbackScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FallbackScene' });
    }

    create() {
        // Use safe defaults if constants are not loaded
        const gameWidth = (typeof GAME_CONFIG !== 'undefined') ? GAME_CONFIG.WIDTH : 375;
        const gameHeight = (typeof GAME_CONFIG !== 'undefined') ? GAME_CONFIG.HEIGHT : 667;
        
        // Add background
        this.add.rectangle(
            gameWidth / 2, 
            gameHeight / 2, 
            gameWidth, 
            gameHeight, 
            0x2c1810
        );

        // Add title
        this.add.text(
            gameWidth / 2, 
            gameHeight / 3, 
            'La Vendemmia Contesa', 
            {
                fontSize: '32px',
                color: '#ffd700',
                fontFamily: 'Georgia, serif'
            }
        ).setOrigin(0.5);

        // Add subtitle
        this.add.text(
            gameWidth / 2, 
            gameHeight / 2, 
            'Caricamento completato!\nTocca per iniziare', 
            {
                fontSize: '18px',
                color: '#ffffff',
                fontFamily: 'Georgia, serif',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Add tap to start functionality
        this.input.on('pointerdown', () => {
            if (typeof window.MenuScene !== 'undefined') {
                this.scene.start('MenuScene');
            } else {
                console.log('MenuScene not available, staying on FallbackScene');
            }
        });

        console.log('FallbackScene created successfully');
    }
}
