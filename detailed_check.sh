#!/bin/bash

echo "=== Detailed Analysis of Each File ==="
echo ""

# Check 1: List all files in components
echo "1. Files in src/components:"
find src/components -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) | sort

echo ""
echo "2. Import Analysis:"
echo ""

# Check app-tabs.web.tsx
echo "=== app-tabs.web.tsx ==="
echo "Imports:"
grep "^import\|^export" src/components/app-tabs.web.tsx 2>/dev/null | head -15
echo "References in src:"
grep -r "app-tabs.web" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "^src/components/app-tabs.web.tsx:" || echo "  (No references found)"
echo ""

# Check animated-icon.web.tsx
echo "=== animated-icon.web.tsx ==="
echo "Imports:"
grep "^import\|^export" src/components/animated-icon.web.tsx 2>/dev/null | head -15
echo "References in src:"
grep -r "animated-icon.web" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "^src/components/animated-icon.web.tsx:" || echo "  (No references found)"
echo ""

# Check hint-row.tsx
echo "=== hint-row.tsx ==="
echo "Imports:"
grep "^import\|^export" src/components/hint-row.tsx 2>/dev/null | head -15
echo "References in src:"
grep -r "hint-row" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "^src/components/hint-row.tsx:" || echo "  (No references found)"
echo ""

# Check swipeable-list-item.tsx
echo "=== swipeable-list-item.tsx ==="
echo "Imports:"
grep "^import\|^export" src/components/swipeable-list-item.tsx 2>/dev/null | head -15
echo "References in src:"
grep -r "swipeable-list-item" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "^src/components/swipeable-list-item.tsx:" || echo "  (No references found)"
echo ""

# Check web-badge.tsx
echo "=== web-badge.tsx ==="
echo "Imports:"
grep "^import\|^export" src/components/web-badge.tsx 2>/dev/null | head -15
echo "References in src:"
grep -r "web-badge" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "^src/components/web-badge.tsx:" || echo "  (No references found)"
echo ""

# Check ui/collapsible.tsx
echo "=== ui/collapsible.tsx ==="
echo "Imports:"
grep "^import\|^export" src/components/ui/collapsible.tsx 2>/dev/null | head -15
echo "References in src:"
grep -r "collapsible" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "^src/components/ui/collapsible.tsx:" || echo "  (No references found)"

