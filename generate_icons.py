"""
Script para generar íconos PNG válidos para la PWA
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Crear ícono cuadrado con diseño de comedores"""

    # Crear imagen con fondo gradiente
    img = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(img)

    # Fondo con gradiente (simulado con círculos concéntricos)
    center = size // 2

    # Color principal: azul a morado (gradiente de la app)
    colors = [
        '#667eea',  # Azul
        '#764ba2',  # Morado
    ]

    # Dibujar fondo sólido
    draw.rectangle([(0, 0), (size, size)], fill='#667eea')

    # Dibujar círculo de fondo
    circle_margin = size // 10
    draw.ellipse(
        [(circle_margin, circle_margin), (size - circle_margin, size - circle_margin)],
        fill='#764ba2'
    )

    # Dibujar "icono" de tenedor y cuchillo (simplificado con formas geométricas)
    # Centro del ícono
    icon_size = size // 2
    icon_x = center - icon_size // 4
    icon_y = center - icon_size // 2

    # Color blanco para el ícono
    icon_color = 'white'

    # Tenedor (rectángulo vertical con líneas)
    fork_width = size // 20
    fork_height = icon_size
    fork_x = icon_x
    fork_y = icon_y

    # Mango del tenedor
    draw.rectangle(
        [(fork_x, fork_y), (fork_x + fork_width, fork_y + fork_height)],
        fill=icon_color
    )

    # Dientes del tenedor (3 líneas en la parte superior)
    teeth_height = fork_height // 3
    teeth_spacing = fork_width // 3
    for i in range(3):
        teeth_x = fork_x - fork_width + (i * teeth_spacing)
        draw.rectangle(
            [(teeth_x, fork_y), (teeth_x + teeth_spacing // 2, fork_y + teeth_height)],
            fill=icon_color
        )

    # Cuchillo (rectángulo vertical más delgado)
    knife_width = fork_width
    knife_height = icon_size
    knife_x = icon_x + fork_width * 3
    knife_y = icon_y

    # Mango del cuchillo
    draw.rectangle(
        [(knife_x, knife_y), (knife_x + knife_width, knife_y + knife_height)],
        fill=icon_color
    )

    # Hoja del cuchillo (triángulo en la parte superior)
    blade_points = [
        (knife_x, knife_y),
        (knife_x + knife_width, knife_y),
        (knife_x + knife_width // 2, knife_y - knife_height // 4)
    ]
    draw.polygon(blade_points, fill=icon_color)

    # Agregar texto "CC" (Comedores Cali) en la parte inferior
    try:
        # Intentar usar una fuente del sistema
        font_size = size // 8
        # En Windows, usar una fuente disponible
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    text = "CC"
    # Calcular posición del texto (centrado en la parte inferior)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = center - text_width // 2
    text_y = size - text_height - size // 10

    # Dibujar texto con sombra
    shadow_offset = 2
    draw.text((text_x + shadow_offset, text_y + shadow_offset), text, fill='#00000044', font=font)
    draw.text((text_x, text_y), text, fill='white', font=font)

    # Guardar imagen
    img.save(output_path, 'PNG', optimize=True)
    print(f"[OK] Creado: {output_path} ({size}x{size})")

def main():
    # Directorio de salida
    output_dir = 'static/img'

    # Crear directorio si no existe
    os.makedirs(output_dir, exist_ok=True)

    # Generar íconos
    sizes = {
        'icon-192.png': 192,
        'icon-512.png': 512,
        'favicon.png': 64,
    }

    for filename, size in sizes.items():
        output_path = os.path.join(output_dir, filename)
        create_icon(size, output_path)

    print("\n[SUCCESS] Todos los iconos han sido generados exitosamente!")
    print("Los archivos estan listos para ser usados en produccion.")

if __name__ == '__main__':
    main()
