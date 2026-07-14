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
  
  # Get directory path if it exists
  dir=$(dirname "$file")
  
  echo "Checking: $file (base_name: $base_name)"
  
  # Search for various import patterns
  # 1. Direct relative imports: './filename' or '../components/filename'
  # 2. Aliased imports: '@/components/filename'
  # 3. Named imports in index files
  
  result=$(grep -r --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" \
    "$base_name" src/ 2>/dev/null | \
    grep -E "(from|import).*['\"].*$base_name" | \
    grep -v "src/components/$file:" | \
    grep -v ".map")
  
  if [ -z "$result" ]; then
    echo "  ❌ UNUSED"
  else
    echo "  ✅ USED - Found in:"
    echo "$result" | while read line; do
      echo "    $line"
    done
  fi
  echo ""
done
