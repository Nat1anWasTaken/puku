#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');

/**
 * Check if a command exists in the system PATH
 * @param {string} command - The command to check
 * @returns {boolean} - True if command exists, false otherwise
 */
function commandExists(command) {
    try {
        if (os.platform() === 'win32') {
            execSync(`where ${command}`, { stdio: 'ignore' });
        } else {
            execSync(`which ${command}`, { stdio: 'ignore' });
        }
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Check if ImageMagick is installed and get version
 * @returns {object} - Object with exists boolean and version string
 */
function checkImageMagick() {
    try {
        if (commandExists('magick')) {
            const version = execSync('magick -version', { encoding: 'utf8' }).split('\n')[0];
            return { exists: true, version: version.trim() };
        } else if (commandExists('convert')) {
            const version = execSync('convert -version', { encoding: 'utf8' }).split('\n')[0];
            return { exists: true, version: version.trim() };
        }

        // On Windows, check for Scoop installations
        if (os.platform() === 'win32') {
            const userProfile = process.env.USERPROFILE;
            if (userProfile) {
                const scoopMagickPath = `${userProfile}\\scoop\\apps\\imagemagick\\current\\magick.exe`;
                try {
                    const fs = require('fs');
                    if (fs.existsSync(scoopMagickPath)) {
                        const version = execSync(`"${scoopMagickPath}" -version`, { encoding: 'utf8' }).split('\n')[0];
                        return { exists: true, version: version.trim() };
                    }
                } catch (error) {
                    // Continue to other checks
                }
            }
        }

        return { exists: false, version: null };
    } catch (error) {
        return { exists: false, version: null };
    }
}

/**
 * Check if Ghostscript is installed and get version
 * @returns {object} - Object with exists boolean and version string
 */
function checkGhostscript() {
    try {
        let command = 'gs';
        if (os.platform() === 'win32') {
            // Try common Windows Ghostscript executable names
            const gsCommands = ['gs', 'gswin64c', 'gswin32c'];
            let found = false;
            for (const cmd of gsCommands) {
                if (commandExists(cmd)) {
                    command = cmd;
                    found = true;
                    break;
                }
            }
            if (!found) {
                return { exists: false, version: null };
            }
        } else if (!commandExists(command)) {
            return { exists: false, version: null };
        }

        const version = execSync(`${command} --version`, { encoding: 'utf8' }).trim();
        return { exists: true, version: `Ghostscript ${version}` };
    } catch (error) {
        return { exists: false, version: null };
    }
}

/**
 * Main function to check all system dependencies
 */
function main() {
    console.log('🔍 Checking system dependencies for PDF processing...\n');

    const imagemagick = checkImageMagick();
    const ghostscript = checkGhostscript();

    console.log('📋 System Dependencies Status:');
    console.log(`  ✅ ImageMagick: ${imagemagick.exists ? '✓' : '✗'} ${imagemagick.version || 'Not found'}`);
    console.log(`  📄 Ghostscript: ${ghostscript.exists ? '✓' : '✗'} ${ghostscript.version || 'Not found'}`);

    if (!imagemagick.exists || !ghostscript.exists) {
        console.log('\n⚠️  Missing dependencies detected!');
        console.log('   The pdf-thumbnail package requires both ImageMagick and Ghostscript.');
        console.log('   Run: bun run setup:deps:install');
        console.log('   Or install manually:');

        if (os.platform() === 'win32') {
            console.log('   • Windows (using Chocolatey):');
            console.log('     choco install imagemagick ghostscript');
            console.log('   • Windows (using Scoop):');
            console.log('     scoop install imagemagick ghostscript');
            console.log('   • Windows (Manual):');
            console.log('     - ImageMagick: https://imagemagick.org/script/download.php#windows');
            console.log('     - Ghostscript: https://www.ghostscript.com/download/gsdnld.html');
        } else if (os.platform() === 'darwin') {
            console.log('   • macOS (using Homebrew):');
            console.log('     brew install imagemagick ghostscript');
            console.log('   • macOS (using MacPorts):');
            console.log('     sudo port install ImageMagick ghostscript');
        } else {
            console.log('   • Ubuntu/Debian:');
            console.log('     sudo apt-get update && sudo apt-get install imagemagick ghostscript');
            console.log('   • RHEL/CentOS/Fedora:');
            console.log('     sudo yum install ImageMagick ghostscript');
            console.log('   • Arch Linux:');
            console.log('     sudo pacman -S imagemagick ghostscript');
        }

        process.exit(1);
    }

    console.log('\n✅ All system dependencies are installed and ready!');
    process.exit(0);
}

if (require.main === module) {
    main();
}

module.exports = {
    commandExists,
    checkImageMagick,
    checkGhostscript
}; 