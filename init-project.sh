#!/bin/bash

# init-project.sh
#
# This script removes template maintenance files that are not needed
# in child repositories. Run this script once after creating a new
# project from the Baukasten template.

echo "Initializing project by removing template maintenance files..."

# Read files to remove from .templateignore
if [ -f ".templateignore" ]; then
  echo "Reading template files to remove from .templateignore..."

  while IFS= read -r line; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
      continue
    fi

    # Remove leading/trailing whitespace
    file=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    if [ -f "$file" ]; then
      rm "$file"
      echo "✓ Removed $file"
    else
      echo "✗ $file not found"
    fi
  done < .templateignore

  # Remove the .templateignore file itself
  if [ -f ".templateignore" ]; then
    rm ".templateignore"
    echo "✓ Removed .templateignore"
  fi
else
  echo "Warning: .templateignore not found, falling back to hardcoded file list"

  # Fallback to hardcoded files for backwards compatibility
  if [ -f .github/workflows/semantic-version.yml ]; then
    rm .github/workflows/semantic-version.yml
    echo "✓ Removed semantic-version.yml"
  else
    echo "✗ semantic-version.yml not found"
  fi

  if [ -f .github/workflows/update-child-repos.yml ]; then
    rm .github/workflows/update-child-repos.yml
    echo "✓ Removed update-child-repos.yml"
  else
    echo "✗ update-child-repos.yml not found"
  fi

  if [ -f .github/child-repositories.json ]; then
    rm .github/child-repositories.json
    echo "✓ Removed child-repositories.json"
  else
    echo "✗ child-repositories.json not found"
  fi
fi

# Optional: Remove this script itself
read -p "Do you want to remove this script (init-project.sh) as well? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -- "$0"
  echo "✓ Removed init-project.sh"
fi

echo "Initialization complete! Your project is now ready for development."