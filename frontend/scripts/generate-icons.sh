#!/bin/bash
# Generate placeholder PWA icons using SVG → PNG conversion
# Requires: rsvg-convert (librsvg2-bin) or convert (imagemagick)
# If neither is available, creates SVG placeholders that browsers can use

ICONS_DIR="$(dirname "$0")/../public/icons"
mkdir -p "$ICONS_DIR"

generate_svg() {
  local size=$1
  local padding=$2
  local output=$3
  local text_size=$((size / 4))
  local cx=$((size / 2))
  local cy=$((size / 2))
  local text_y=$((cy + text_size / 3))
  local rect_margin=$((size * padding / 100))

  cat > "$output" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0a0a0a" rx="$((size / 8))"/>
  <rect x="${rect_margin}" y="${rect_margin}" width="$((size - rect_margin * 2))" height="$((size - rect_margin * 2))" fill="none" stroke="#d4af37" stroke-width="2" rx="$((size / 10))"/>
  <text x="${cx}" y="${text_y}" font-family="Arial, sans-serif" font-size="${text_size}" font-weight="bold" fill="#d4af37" text-anchor="middle">TC</text>
</svg>
SVG
}

# Regular icons (no extra padding)
generate_svg 192 5 "$ICONS_DIR/icon-192.svg"
generate_svg 512 5 "$ICONS_DIR/icon-512.svg"

# Maskable icons (20% safe zone padding = content in 80% center)
generate_svg 192 10 "$ICONS_DIR/icon-maskable-192.svg"
generate_svg 512 10 "$ICONS_DIR/icon-maskable-512.svg"

# Try to convert SVG to PNG
if command -v rsvg-convert &> /dev/null; then
  for svg in "$ICONS_DIR"/*.svg; do
    png="${svg%.svg}.png"
    rsvg-convert "$svg" -o "$png"
    echo "Created $png"
  done
  rm "$ICONS_DIR"/*.svg
elif command -v convert &> /dev/null; then
  for svg in "$ICONS_DIR"/*.svg; do
    png="${svg%.svg}.png"
    convert "$svg" "$png"
    echo "Created $png"
  done
  rm "$ICONS_DIR"/*.svg
else
  echo "WARNING: No SVG-to-PNG converter found (install librsvg2-bin or imagemagick)"
  echo "SVG files created as placeholders — replace with real PNGs before production"
  # Rename SVGs to PNG extension as fallback (browsers handle SVG in icon fields)
  for svg in "$ICONS_DIR"/*.svg; do
    cp "$svg" "${svg%.svg}.png"
  done
fi

echo "Icons generated in $ICONS_DIR"
