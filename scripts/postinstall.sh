#!/bin/bash
# Post-installation script
# Copies necessary files from node_modules to public directory

set -e  # Exit on error

echo "📦 Running post-install setup..."

# Create directories if they don't exist
mkdir -p public/fonts
mkdir -p public/js
mkdir -p public/css

# Copy Material Symbols font
echo "  → Copying Material Symbols font..."
if [ -f "node_modules/material-symbols/material-symbols-outlined.woff2" ]; then
  cp node_modules/material-symbols/material-symbols-outlined.woff2 public/fonts/
  echo "    ✓ Material Symbols font copied"
else
  echo "    ⚠ Material Symbols font not found, skipping"
fi

# Copy itineraire-technique chart-render.js
echo "  → Copying itineraire-technique scripts..."
if [ -f "node_modules/@osfarm/itineraire-technique/js/chart-render.js" ]; then
  cp node_modules/@osfarm/itineraire-technique/js/*.js public/js/
  cp node_modules/@osfarm/itineraire-technique/css/*.css public/css/
  cp node_modules/@osfarm/itineraire-technique/editor.html public/editor.html
  echo "    ✓ chart-render.js copied"
else
  echo "    ⚠ chart-render.js not found, skipping"
fi

echo "✅ Post-install setup complete"
