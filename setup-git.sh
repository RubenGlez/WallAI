#!/bin/bash
# Setup script for pushing to GitHub

echo "🚀 Setting up Git repository for WallAI..."

# Initialize git (if not already done)
if [ ! -d .git ]; then
  echo "📦 Initializing git repository..."
  git init
fi

# Add all files
echo "📝 Staging files..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Phase 0 - Project foundation

- Expo app setup with TypeScript
- React Navigation with 5 bottom tabs (Home, Colors, Scan, Wall, Projects)
- Zustand state management setup
- Design tokens for outdoor use (high contrast, spacing, typography)
- Basic folder structure (stores, types)
- Placeholder screens for all tabs"

echo ""
echo "✅ Git repository initialized and first commit created!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new repository on GitHub (https://github.com/new)"
echo "2. Copy the repository URL (e.g., https://github.com/username/WallAI.git)"
echo "3. Run these commands:"
echo ""
echo "   git remote add origin <YOUR_REPO_URL>"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
