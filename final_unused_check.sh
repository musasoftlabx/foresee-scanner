#!/bin/bash

echo "=== FINAL ANALYSIS: Unused Component Files ===" 
echo ""

# Define the files to check
declare -a files=(
  "app-tabs.web"
  "animated-icon.web"
  "animated-icon.module"
  "hint-row"
  "swipeable-list-item"
  "web-badge"
  "collapsible"
)

unused_count=0

for file_base in "${files[@]}"; do
  # Count references across entire src directory (excluding the file itself)
  ref_count=$(grep -r "$file_base" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.css" 2>/dev/null | wc -l)
  
  # Get only external references (not from the file itself)
  external_refs=$(grep -r "$file_base" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.css" 2>/dev/null | grep -v "^src/components/$file_base" | grep -v "^src/components/.*/$file_base" | wc -l)
  
  if [ "$external_refs" -eq 0 ]; then
    echo "❌ UNUSED: $file_base"
    ((unused_count++))
    
    # Check what this file imports to understand its purpose
    echo "   Dependency chain:"
    if [ -f "src/components/$file_base.tsx" ]; then
      grep "^import" src/components/$file_base.tsx 2>/dev/null | head -5
    elif [ -f "src/components/ui/$file_base.tsx" ]; then
      grep "^import" src/components/ui/$file_base.tsx 2>/dev/null | head -5
    elif [ -f "src/components/$file_base.css" ]; then
      echo "   (CSS file - used by animated-icon.web.tsx)"
    fi
  else
    echo "✅ USED: $file_base (found in $external_refs location(s))"
    grep -r "$file_base" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --include="*.css" 2>/dev/null | grep -v "^src/components/$file_base" | grep -v "^src/components/.*/$file_base" | sed 's/^/   /'
  fi
  echo ""
done

echo "=== SUMMARY ==="
echo "Total files checked: ${#files[@]}"
echo "Unused files: $unused_count"

