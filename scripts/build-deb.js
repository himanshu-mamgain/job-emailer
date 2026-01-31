import fs from 'fs';
import path from 'path';

const BUILD_DIR = 'deb-build';
const PACKAGE_NAME = 'job-emailer';
const VERSION = '1.0.0';
const ARCH = 'all';

console.log('Building deb package structure...');

// Clean
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}

// Structure files
const LIB_DIR = path.join(BUILD_DIR, 'usr', 'lib', PACKAGE_NAME);
const BIN_DIR = path.join(BUILD_DIR, 'usr', 'bin');
const DEBIAN_DIR = path.join(BUILD_DIR, 'DEBIAN');

fs.mkdirSync(LIB_DIR, { recursive: true });
fs.mkdirSync(BIN_DIR, { recursive: true });
fs.mkdirSync(DEBIAN_DIR, { recursive: true });

// Copy source
console.log('Copying source files...');
fs.cpSync('src', path.join(LIB_DIR, 'src'), { recursive: true });
fs.copyFileSync('package.json', path.join(LIB_DIR, 'package.json'));

// Copy node_modules
console.log('Copying node_modules...');
// Check if node_modules exists
if (fs.existsSync('node_modules')) {
    fs.cpSync('node_modules', path.join(LIB_DIR, 'node_modules'), { recursive: true });
} else {
    console.warn('Warning: node_modules not found. Run npm install first.');
}

// Create Executable Script
console.log('Creating wrapper script...');
const wrapperScript = `#!/bin/sh
exec node /usr/lib/${PACKAGE_NAME}/src/cli.js "$@"
`;
const binPath = path.join(BIN_DIR, PACKAGE_NAME);
fs.writeFileSync(binPath, wrapperScript);

// Create Control File
console.log('Creating control file...');
const controlContent = `Package: ${PACKAGE_NAME}
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: ${ARCH}
Depends: nodejs
Maintainer: Himanshu Mamgain <himanshu@example.com>
Description: Automated Job Emailer CLI
  A CLI tool to apply for jobs by sending emails with attached resumes.
`;
fs.writeFileSync(path.join(DEBIAN_DIR, 'control'), controlContent);

// Post install script
console.log('Creating postinst script...');
const postInst = `#!/bin/sh
chmod +x /usr/bin/${PACKAGE_NAME}
chmod +x /usr/lib/${PACKAGE_NAME}/src/cli.js
exit 0
`;
const postInstPath = path.join(DEBIAN_DIR, 'postinst');
fs.writeFileSync(postInstPath, postInst);

// Try to chmod (might fail on Windows but worth a try)
try {
    fs.chmodSync(binPath, '755');
    fs.chmodSync(postInstPath, '755');
} catch (e) {
    // Ignore
}

console.log(`
==================================================
Build directory prepared at: ${path.resolve(BUILD_DIR)}

To finalize the .deb package:
1. Ensure you have 'dpkg-deb' installed (Ubuntu/Debian/WSL).
2. Run config to setup permissions correctly inside the archive:
   chmod -R 755 ${BUILD_DIR}/DEBIAN
3. Build the package:
   dpkg-deb --build ${BUILD_DIR} ${PACKAGE_NAME}_${VERSION}_${ARCH}.deb
==================================================
`);
