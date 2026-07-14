#!/bin/bash

echo "=== VERIFICATION: Component Files and Their Status ==="
echo ""

echo "1. animated-icon.module.css:"
echo "   Status: IS USED (by animated-icon.web.tsx)"
grep "animated-icon.module" src/components/animated-icon.web.tsx
echo ""

echo "2. Checking each file's actual usage:"
echo ""

# Function to check if a file is truly unused
check_file() {
  local filename=$1
  local filepath=$2
  
  if [ ! -f "$filepath" ]; then
    echo "❌ FILE NOT FOUND: $filepath"
    return
  fi
  
  # Get the base name for searching
  local basename=$(basename "$filepath" .tsx)
  basename=$(basename "$basename" .css)
  basename=$(basename "$basename" .web)
  
  # Count how many times it appears in imports across src
  local import_count=$(grep -r "from.*['\"].*$basename\|import.*$basename" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null | grep -v "^$filepath:" | wc -l)
  
  if [ $import_count -eq 0 ]; then
    echo "❌ UNUSED: $filename"
  else
    echo "✅ USED: $filename (imported $import_count time(s))"
  fi
}

check_file "app-tabs.web.tsx" "src/components/app-tabs.web.tsx"
check_file "animated-icon.web.tsx" "src/components/animated-icon.web.tsx"
check_file "hint-row.tsx" "src/components/hint-row.tsx"
check_file "swipeable-list-item.tsx" "src/components/swipeable-list-item.tsx"
check_file "web-badge.tsx" "src/components/web-badge.tsx"
check_file "ui/collapsible.tsx" "src/components/ui/collapsible.tsx"
check_file "external-link.tsx" "src/components/external-link.tsx"
check_file "themed-text.tsx" "src/components/themed-text.tsx"
check_file "themed-view.tsx" "src/components/themed-view.tsx"
check_file "animated-icon.module.css" "src/components/animated-icon.module.css"

