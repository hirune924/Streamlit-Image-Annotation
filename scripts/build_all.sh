#!/bin/bash

# Script to build all Streamlit Image Annotation components and create distribution package
# Usage:
#   source .venv/bin/activate  # Activate venv first
#   ./scripts/build_all.sh

set -e  # Exit on error

echo "==================================="
echo "Building Streamlit Image Annotation"
echo "==================================="

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Clean previous builds
echo ""
echo "Cleaning previous builds..."
rm -rf dist build streamlit_image_annotation.egg-info
rm -rf streamlit_image_annotation/Classification/frontend/build
rm -rf streamlit_image_annotation/Detection/frontend/build
rm -rf streamlit_image_annotation/Point/frontend/build

# Build Classification component
echo ""
echo "Building Classification component..."
cd streamlit_image_annotation/Classification/frontend
yarn install
yarn build
cd "$PROJECT_ROOT"
echo "✓ Classification build complete ($(du -sh streamlit_image_annotation/Classification/frontend/build | cut -f1))"

# Build Detection component
echo ""
echo "Building Detection component..."
cd streamlit_image_annotation/Detection/frontend
yarn install
yarn build
cd "$PROJECT_ROOT"
echo "✓ Detection build complete ($(du -sh streamlit_image_annotation/Detection/frontend/build | cut -f1))"

# Build Point component
echo ""
echo "Building Point component..."
cd streamlit_image_annotation/Point/frontend
yarn install
yarn build
cd "$PROJECT_ROOT"
echo "✓ Point build complete ($(du -sh streamlit_image_annotation/Point/frontend/build | cut -f1))"

# Build Python package
echo ""
echo "Building Python package..."
python setup.py sdist bdist_wheel
echo "✓ Python package build complete"

# Show results
echo ""
echo "==================================="
echo "Build Complete!"
echo "==================================="
echo ""
echo "Built packages:"
ls -lh dist/
echo ""
echo "To install locally:"
echo "  pip install --force-reinstall dist/streamlit_image_annotation-*.whl"
echo ""
