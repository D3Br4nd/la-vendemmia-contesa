#!/bin/bash

# Asset Download Script per "La Vendemmia Contesa"
# Scarica automaticamente asset gratuiti da fonti pubbliche

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$PROJECT_ROOT/assets"

echo "🍇 Asset Download Script - La Vendemmia Contesa"
echo "📁 Directory progetto: $PROJECT_ROOT"
echo "🎨 Directory assets: $ASSETS_DIR"
echo ""

# Funzione per scaricare file con curl
download_file() {
    local url="$1"
    local output_path="$2"
    local description="$3"
    
    echo "⬇️  Scaricando: $description"
    echo "   URL: $url"
    echo "   Output: $output_path"
    
    if curl -L -o "$output_path" "$url"; then
        echo "✅ Successo!"
    else
        echo "❌ Errore durante il download"
    fi
    echo ""
}

# Creare directory se non esistono
mkdir -p "$ASSETS_DIR/images/grapes"
mkdir -p "$ASSETS_DIR/images/ui"
mkdir -p "$ASSETS_DIR/images/backgrounds"
mkdir -p "$ASSETS_DIR/images/effects"
mkdir -p "$ASSETS_DIR/audio/sfx"
mkdir -p "$ASSETS_DIR/audio/bgm"
mkdir -p "$ASSETS_DIR/temp"

echo "📂 Directory create!"
echo ""

# Creare alcuni placeholder colorati per testing
echo "🎨 Creando placeholder per testing..."

# Script Python per creare placeholder colorati
cat > "$ASSETS_DIR/create_placeholders.py" << 'EOF'
#!/usr/bin/env python3
"""
Crea placeholder colorati per il gioco "La Vendemmia Contesa"
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_grape_sprite(color, size=(64, 64), is_macchiato=False):
    """Crea uno sprite acino con colore specificato"""
    # Crea un'immagine trasparente
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Coordinate per il cerchio (lascia un po' di margine)
    margin = 4
    circle_coords = [margin, margin, size[0]-margin, size[1]-margin]
    
    # Disegna il cerchio principale
    draw.ellipse(circle_coords, fill=color, outline=(0, 0, 0, 100))
    
    # Se è macchiato, aggiungi una macchia
    if is_macchiato:
        # Macchia più scura al centro
        dark_color = tuple(max(0, c-50) for c in color[:3]) + (255,)
        spot_margin = size[0] // 4
        spot_coords = [spot_margin, spot_margin, size[0]-spot_margin, size[1]-spot_margin]
        draw.ellipse(spot_coords, fill=dark_color)
    
    # Highlight per effetto 3D
    highlight_margin = margin + 8
    highlight_size = (size[0] - highlight_margin * 2) // 3
    highlight_coords = [
        highlight_margin, 
        highlight_margin, 
        highlight_margin + highlight_size, 
        highlight_margin + highlight_size
    ]
    light_color = tuple(min(255, c+80) for c in color[:3]) + (150,)
    draw.ellipse(highlight_coords, fill=light_color)
    
    return img

def create_button(text, size=(120, 60), bg_color=(139, 69, 19)):
    """Crea un pulsante con testo"""
    img = Image.new('RGBA', size, bg_color + (255,))
    draw = ImageDraw.Draw(img)
    
    # Bordo
    draw.rectangle([0, 0, size[0]-1, size[1]-1], outline=(0, 0, 0, 255), width=2)
    
    # Testo (font di sistema)
    try:
        # Prova font più grandi prima
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    # Centra il testo
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (size[0] - text_width) // 2
    text_y = (size[1] - text_height) // 2
    
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    return img

# Directory assets
assets_dir = os.path.dirname(os.path.abspath(__file__))
grapes_dir = os.path.join(assets_dir, 'images', 'grapes')
ui_dir = os.path.join(assets_dir, 'images', 'ui')

# Colori per i tre tipi di acini
colors = {
    'aglianico': (75, 0, 130),    # Viola scuro
    'fiano': (255, 215, 0),       # Giallo dorato
    'greco': (50, 205, 50)        # Verde
}

print("🎨 Creando sprite acini...")

# Crea sprite acini normali e macchiati
for grape_type, color in colors.items():
    # Acino normale
    normal_grape = create_grape_sprite(color, is_macchiato=False)
    normal_path = os.path.join(grapes_dir, f'grape_{grape_type}_normal.png')
    normal_grape.save(normal_path)
    print(f"✅ Creato: {normal_path}")
    
    # Acino macchiato
    macchiato_grape = create_grape_sprite(color, is_macchiato=True)
    macchiato_path = os.path.join(grapes_dir, f'grape_{grape_type}_macchiato.png')
    macchiato_grape.save(macchiato_path)
    print(f"✅ Creato: {macchiato_path}")

print("\n🔘 Creando pulsanti UI...")

# Crea pulsanti base
buttons = [
    ('Play', 'btn_play_normal.png'),
    ('Pause', 'btn_pause_normal.png'),
    ('Menu', 'btn_menu_normal.png'),
    ('Save', 'btn_save_score_normal.png')
]

for text, filename in buttons:
    button_img = create_button(text)
    button_path = os.path.join(ui_dir, filename)
    button_img.save(button_path)
    print(f"✅ Creato: {button_path}")

print("\n🎯 Placeholder completati!")
print("📁 Controlla le directory assets/images/ per vedere i file creati")
EOF

# Rendi executable lo script Python
chmod +x "$ASSETS_DIR/create_placeholders.py"

# Esegui lo script Python se disponibile
if command -v python3 &> /dev/null; then
    echo "🐍 Eseguendo script Python per placeholder..."
    cd "$ASSETS_DIR"
    python3 create_placeholders.py
else
    echo "⚠️  Python3 non trovato. Placeholder non creati."
fi

echo ""
echo "✅ Script completato!"
echo "📋 Prossimi passi:"
echo "   1. Controllare directory assets/ per i file creati"
echo "   2. Sostituire placeholder con asset reali quando disponibili"
echo "   3. Eseguire script specifici per download da fonti esterne"
echo ""
