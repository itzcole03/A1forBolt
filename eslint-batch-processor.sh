#!/bin/bash
# Autonomous ESLint Batch Processor
# Process files in small batches to avoid timeout issues

echo "🔧 Starting autonomous ESLint batch processing..."

# Get list of source files
FILES=$(find src -name "*.ts" -o -name "*.tsx" | head -20)

FIXED_COUNT=0
ERROR_COUNT=0

for file in $FILES; do
    echo "Processing: $file"
    
    # Check if file has issues
    ISSUES=$(npx eslint "$file" 2>&1 | grep -c "error\|warning" || true)
    
    if [ "$ISSUES" -gt 0 ]; then
        echo "  📍 Found $ISSUES issues"
        
        # Try automated fixes first
        npx eslint "$file" --fix > /dev/null 2>&1
        
        # Count remaining issues
        REMAINING=$(npx eslint "$file" 2>&1 | grep -c "error\|warning" || true)
        
        if [ "$REMAINING" -lt "$ISSUES" ]; then
            FIXED_THIS_FILE=$((ISSUES - REMAINING))
            FIXED_COUNT=$((FIXED_COUNT + FIXED_THIS_FILE))
            echo "  ✅ Auto-fixed $FIXED_THIS_FILE issues, $REMAINING remaining"
        fi
        
        ERROR_COUNT=$((ERROR_COUNT + REMAINING))
    else
        echo "  ✅ Clean"
    fi
done

echo ""
echo "📊 Batch Processing Summary:"
echo "  🔧 Issues auto-fixed: $FIXED_COUNT"
echo "  ⚠️  Issues remaining: $ERROR_COUNT"
echo "  📁 Files processed: $(echo "$FILES" | wc -l)"
