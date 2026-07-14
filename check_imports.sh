#!/bin/bash

# Array of files to check
files=(
  "app-tabs.web.tsx"
  "animated-icon.web.tsx"
  "animated-icon.module.css"
  "external-link.tsx"
  "hint-row.tsx"
  "swipeable-list-item.tsx"
  "web-badge.tsx"
  "themed-text.tsx"
  "themed-view.tsx"
  "ui/collapsible.tsx"
)

echo "=== Checking for Unused Files in src/components ==="
echo ""

for file in "${files[@]}"; do
  # Extract the base name without extension
  base_name=$(basename "$file" .tsx)
  base_name=$(basename "$base_name" .css)
  
  # Search for imports in the entire src directory
  # Search patterns: various import styles
  result=$(grep -r "\(import\|from\).*['\"].*\($base_name\|components/$base_name\|./$(dirname $file)/$base_name\)['\"]" src/ 2>/dev/null | grep -v "src/components/$file" | grep -v ".map")
  
  if [ -z "$result" ]; then
    echo "❌ UNUSED: $file"
  else
    echo "✅ USED: $file"
    echo "   Found in:"
    grep -r "\(import\|from\).*['\"].*\($base_name\|components/$base_name\|./$(dirname $file)/$base_name\)['\"]" src/ 2>/dev/null | grep -v "src/components/$file" | grep -v ".map" | sed 's/^/   /'
  fi
  echo ""
done
