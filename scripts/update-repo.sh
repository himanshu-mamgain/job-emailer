#!/bin/bash

# This script must be run in a Linux environment (e.g., WSL, Ubuntu)
# It generates the necessary metadata files to turn this directory into a valid APT repository.

# Ensure we have the .deb file
if [ ! -f job-emailer_1.0.0_all.deb ]; then
    echo "Package file 'job-emailer_1.0.0_all.deb' not found in root."
    echo "Please build it first: dpkg-deb --build deb-build job-emailer_1.0.0_all.deb"
    exit 1
fi

# Check for required tools
if ! command -v dpkg-scanpackages &> /dev/null; then
    echo "Error: 'dpkg-scanpackages' not found. Please install 'dpkg-dev'."
    echo "Run: sudo apt-get install dpkg-dev"
    exit 1
fi

echo "Generating Packages file..."
# Scan current directory for .deb files
dpkg-scanpackages . /dev/null > Packages
gzip -k -f Packages # Generate Packages.gz

echo "Generating Release file..."
# Generate Release file (basic)
echo "Origin: Job Emailer Repo" > Release
echo "Label: Job Emailer" >> Release
echo "Suite: stable" >> Release
echo "Codename: stable" >> Release
echo "Architectures: all" >> Release
echo "Components: main" >> Release
echo "Description: Repository for Job Emailer CLI" >> Release

# If you have GPG set up, you should sign the Release file:
# gpg --default-key YOUR_KEY_ID -abs -o - Release > Release.gpg
# gpg --default-key YOUR_KEY_ID --clearsign -o - Release > InRelease

echo "Repository metadata updated."
echo "You can now push 'Packages', 'Packages.gz', and 'Release' to GitHub."
