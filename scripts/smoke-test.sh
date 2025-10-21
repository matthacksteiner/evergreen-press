#!/usr/bin/env bash

# Smoke Test Script for Baukasten Build
# This script performs basic checks after a build to ensure critical files exist

set -e  # Exit on error

echo "🧪 Running Baukasten build smoke tests..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        echo -e "${YELLOW}  Expected: $1${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to check if directory exists and is not empty
check_dir_not_empty() {
    if [ -d "$1" ] && [ "$(ls -A $1 2>/dev/null)" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        echo -e "${YELLOW}  Expected: $1 (non-empty)${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "📦 Checking content sync outputs..."
check_file "public/content/global.json" "Global content file exists"
check_file "public/content/index.json" "Index content file exists"

echo ""
echo "🔤 Checking font downloader outputs..."
check_file "public/fonts/fonts.json" "Fonts metadata file exists"

echo ""
echo "🖼️  Checking build outputs..."
check_file "dist/index.html" "Main index.html exists"
check_dir_not_empty "dist/_astro" "Astro assets directory exists and not empty"

echo ""
echo "📋 Checking cache state files..."
check_file ".astro/kirby-sync-state.json" "Kirby sync state file exists"
if [ -f ".astro/font-cache-state.json" ]; then
    echo -e "${GREEN}✓${NC} Font cache state file exists"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠${NC}  Font cache state file not found (may be normal on first run)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ All smoke tests passed! ($TESTS_PASSED/$TESTS_PASSED)${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some smoke tests failed: $TESTS_FAILED failed, $TESTS_PASSED passed${NC}"
    echo ""
    exit 1
fi

