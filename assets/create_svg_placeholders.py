#!/usr/bin/env python3
"""
Crea placeholder SVG per il gioco "La Vendemmia Contesa"
Versione senza dipendenze esterne - genera file SVG
"""

import os

def create_grape_svg(color, size=64, is_macchiato=False, filename="grape.svg"):
    """Crea uno sprite acino SVG con colore specificato"""
    
    # Template SVG base
    svg_template = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Acino principale -->
  <circle cx="{size//2}" cy="{size//2}" r="{size//2 - 4}" 
          fill="rgb{color}" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
  
  <!-- Highlight per effetto 3D -->
  <circle cx="{size//2 - 8}" cy="{size//2 - 8}" r="{size//6}" 
          fill="rgba(255,255,255,0.5)"/>
'''
    
    # Se è macchiato, aggiungi macchia
    if is_macchiato:
        dark_color = tuple(max(0, c-50) for c in color)
        svg_template += f'''  
  <!-- Macchia -->
  <circle cx="{size//2}" cy="{size//2}" r="{size//4}" 
          fill="rgb{dark_color}" opacity="0.8"/>
'''
    
    svg_template += '</svg>'
    
    return svg_template

def create_button_svg(text, width=120, height=60, filename="button.svg"):
    """Crea un pulsante SVG con testo"""
    
    svg_template = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background pulsante -->
  <rect x="2" y="2" width="{width-4}" height="{height-4}" 
        fill="rgb(139,69,19)" stroke="rgb(0,0,0)" stroke-width="2" 
        rx="8" ry="8"/>
  
  <!-- Effetto 3D -->
  <rect x="4" y="4" width="{width-8}" height="{height//3}" 
        fill="rgba(255,255,255,0.2)" rx="4" ry="4"/>
  
  <!-- Testo -->
  <text x="{width//2}" y="{height//2 + 6}" 
        font-family="Arial, sans-serif" font-size="16" font-weight="bold"
        text-anchor="middle" fill="white">{text}</text>
</svg>'''
    
    return svg_template

def create_background_svg(width=1080, height=1920, filename="background.svg"):
    """Crea uno sfondo vigna semplificato"""
    
    svg_template = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Gradiente sfondo -->
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(135,206,250);stop-opacity:1" />
      <stop offset="70%" style="stop-color:rgb(250,240,190);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(139,69,19);stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Sfondo -->
  <rect width="100%" height="100%" fill="url(#skyGradient)"/>
  
  <!-- Colline stilizzate -->
  <ellipse cx="{width//2}" cy="{height-200}" rx="{width//2}" ry="100" 
           fill="rgb(34,139,34)" opacity="0.7"/>
  <ellipse cx="{width//4}" cy="{height-150}" rx="{width//3}" ry="80" 
           fill="rgb(50,205,50)" opacity="0.6"/>
  <ellipse cx="{3*width//4}" cy="{height-120}" rx="{width//4}" ry="60" 
           fill="rgb(34,139,34)" opacity="0.5"/>
  
  <!-- Testo decorativo -->
  <text x="{width//2}" y="100" 
        font-family="serif" font-size="48" font-style="italic"
        text-anchor="middle" fill="rgba(139,69,19,0.8)">La Vendemmia</text>
</svg>'''
    
    return svg_template

# Directory assets
script_dir = os.path.dirname(os.path.abspath(__file__))
grapes_dir = os.path.join(script_dir, 'images', 'grapes')
ui_dir = os.path.join(script_dir, 'images', 'ui')
backgrounds_dir = os.path.join(script_dir, 'images', 'backgrounds')

# Crea directory se non esistono
os.makedirs(grapes_dir, exist_ok=True)
os.makedirs(ui_dir, exist_ok=True)
os.makedirs(backgrounds_dir, exist_ok=True)

# Colori per i tre tipi di acini
colors = {
    'aglianico': (75, 0, 130),    # Viola scuro
    'fiano': (255, 215, 0),       # Giallo dorato
    'greco': (50, 205, 50)        # Verde
}

print("🎨 Creando sprite acini SVG...")

# Crea sprite acini normali e macchiati
for grape_type, color in colors.items():
    # Acino normale
    normal_svg = create_grape_svg(color, is_macchiato=False)
    normal_path = os.path.join(grapes_dir, f'grape_{grape_type}_normal.svg')
    with open(normal_path, 'w') as f:
        f.write(normal_svg)
    print(f"✅ Creato: {normal_path}")
    
    # Acino macchiato
    macchiato_svg = create_grape_svg(color, is_macchiato=True)
    macchiato_path = os.path.join(grapes_dir, f'grape_{grape_type}_macchiato.svg')
    with open(macchiato_path, 'w') as f:
        f.write(macchiato_svg)
    print(f"✅ Creato: {macchiato_path}")

print("\n🔘 Creando pulsanti UI SVG...")

# Crea pulsanti base
buttons = [
    ('Play', 'btn_play_normal.svg'),
    ('Pause', 'btn_pause_normal.svg'),
    ('Menu', 'btn_menu_normal.svg'),
    ('Save', 'btn_save_score_normal.svg')
]

for text, filename in buttons:
    button_svg = create_button_svg(text)
    button_path = os.path.join(ui_dir, filename)
    with open(button_path, 'w') as f:
        f.write(button_svg)
    print(f"✅ Creato: {button_path}")

print("\n🌄 Creando sfondo placeholder...")

# Crea sfondo
bg_svg = create_background_svg()
bg_path = os.path.join(backgrounds_dir, 'bg_vineyard_main.svg')
with open(bg_path, 'w') as f:
    f.write(bg_svg)
print(f"✅ Creato: {bg_path}")

print("\n🎯 Placeholder SVG completati!")
print("📁 Controlla le directory assets/images/ per vedere i file creati")
print("💡 I file SVG possono essere convertiti in PNG con tool online o Inkscape")
print("🔗 Conversione online: https://convertio.co/svg-png/")
