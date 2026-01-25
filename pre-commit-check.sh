#!/bin/bash

# Pre-Commit Cleanup and Verification Script
# Run this before committing to ensure everything is clean

echo "🧹 Starting Pre-Commit Cleanup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check for node_modules
echo "📦 Checking for node_modules..."
if git status | grep -q "node_modules"; then
    echo -e "${RED}❌ ERROR: node_modules detected in staging area!${NC}"
    echo "Run: git reset HEAD node_modules/"
    exit 1
else
    echo -e "${GREEN}✅ No node_modules in staging area${NC}"
fi

# Step 2: Check for .env files
echo ""
echo "🔐 Checking for .env files..."
if git status --porcelain | grep -q "\.env"; then
    echo -e "${RED}❌ ERROR: .env files detected!${NC}"
    echo "Remove them from staging:"
    git status --porcelain | grep "\.env"
    exit 1
else
    echo -e "${GREEN}✅ No .env files in staging area${NC}"
fi

# Step 3: Check for temp files
echo ""
echo "🗑️  Checking for temporary files..."
if git status --porcelain | grep -q "temp_"; then
    echo -e "${YELLOW}⚠️  WARNING: Temporary files detected:${NC}"
    git status --porcelain | grep "temp_"
    echo "Consider adding to .gitignore"
else
    echo -e "${GREEN}✅ No temporary files in staging area${NC}"
fi

# Step 4: Check for sensitive data patterns
echo ""
echo "🔍 Scanning for sensitive data patterns..."
SENSITIVE_PATTERNS=("password.*=.*" "api[_-]?key.*=.*" "secret.*=.*" "token.*=.*")
FOUND_SENSITIVE=false

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if git diff --cached | grep -i "$pattern" > /dev/null; then
        echo -e "${RED}❌ WARNING: Potential sensitive data found matching: $pattern${NC}"
        FOUND_SENSITIVE=true
    fi
done

if [ "$FOUND_SENSITIVE" = false ]; then
    echo -e "${GREEN}✅ No obvious sensitive data patterns detected${NC}"
else
    echo -e "${YELLOW}⚠️  Please review the matches above carefully${NC}"
fi

# Step 5: List files to be committed
echo ""
echo "📝 Files staged for commit:"
git diff --cached --name-status

# Step 6: Show file count
echo ""
FILE_COUNT=$(git diff --cached --name-only | wc -l)
echo "📊 Total files: $FILE_COUNT"

# Step 7: Summary
echo ""
echo "================================================"
echo "✨ Pre-Commit Verification Complete!"
echo "================================================"
echo ""
echo "Expected files for teacher assignment feature:"
echo "  ✓ server/src/controllers/class.controller.ts"
echo "  ✓ server/src/routes/class.routes.ts"
echo "  ✓ server/test-teacher-assignment.http"
echo "  ✓ src/services/api.js"
echo "  ✓ src/components/CBCGrading/shared/AssignClassModal.jsx"
echo "  ✓ docs/TEACHER_ASSIGNMENT_GUIDE.md"
echo ""
echo "Next steps:"
echo "  1. Review staged files above"
echo "  2. Run: git commit -m 'your message'"
echo "  3. Run: git push origin main"
echo ""

# Optional: Run tests if npm test exists
if [ -f "package.json" ]; then
    echo "💡 TIP: Run 'npm test' before pushing (if tests exist)"
fi

echo -e "${GREEN}Ready to commit!${NC} 🚀"
