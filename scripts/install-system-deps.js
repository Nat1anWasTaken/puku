#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const os = require('os');
const { checkImageMagick, checkGhostscript, commandExists } = require('./check-system-deps.js');

/**
 * Execute a command with proper error handling and output
 * @param {string} command - The command to execute
 * @param {object} options - Options for execSync
 * @returns {boolean} - True if successful, false otherwise
 */
function safeExec(command, options = {}) {
    try {
        console.log(`   Running: ${command}`);
        execSync(command, { stdio: 'inherit', ...options });
        return true;
    } catch (error) {
        console.error(`   ❌ Failed to execute: ${command}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
}

/**
 * Check if a package manager is available
 * @param {string} manager - Package manager command
 * @returns {boolean} - True if available, false otherwise
 */
function hasPackageManager(manager) {
    return commandExists(manager);
}

/**
 * Install dependencies on Windows
 * @returns {boolean} - True if successful, false otherwise
 */
function installWindows() {
    console.log('🪟 Installing on Windows...');

    // Try Chocolatey first
    if (hasPackageManager('choco')) {
        console.log('   Using Chocolatey package manager...');
        const chocoSuccess = safeExec('choco install imagemagick ghostscript -y');
        if (chocoSuccess) {
            console.log('   ✅ Successfully installed via Chocolatey');
            return true;
        }
    }

    // Try Scoop as fallback
    if (hasPackageManager('scoop')) {
        console.log('   Using Scoop package manager...');
        const scoopSuccess = safeExec('scoop install imagemagick ghostscript');
        if (scoopSuccess) {
            console.log('   ✅ Successfully installed via Scoop');
            return true;
        }
    }

    // Try winget as another fallback
    if (hasPackageManager('winget')) {
        console.log('   Using winget package manager...');
        let wingetSuccess = true;

        // Install ImageMagick via winget
        if (!safeExec('winget install --id ImageMagick.ImageMagick --silent --accept-source-agreements --accept-package-agreements')) {
            wingetSuccess = false;
        }

        // Install Ghostscript via winget
        if (!safeExec('winget install --id ArtifexSoftware.GhostScript --silent --accept-source-agreements --accept-package-agreements')) {
            wingetSuccess = false;
        }

        if (wingetSuccess) {
            console.log('   ✅ Successfully installed via winget');
            return true;
        }
    }

    // Manual installation instructions
    console.log('   ⚠️  No supported package manager found.');
    console.log('   Please install manually:');
    console.log('   • ImageMagick: https://imagemagick.org/script/download.php#windows');
    console.log('   • Ghostscript: https://www.ghostscript.com/download/gsdnld.html');
    console.log('   \n   Or install a package manager:');
    console.log('   • Chocolatey: https://chocolatey.org/install');
    console.log('   • Scoop: https://scoop.sh/');

    return false;
}

/**
 * Install dependencies on macOS
 * @returns {boolean} - True if successful, false otherwise
 */
function installMacOS() {
    console.log('🍎 Installing on macOS...');

    // Try Homebrew first
    if (hasPackageManager('brew')) {
        console.log('   Using Homebrew package manager...');
        const brewSuccess = safeExec('brew install imagemagick ghostscript');
        if (brewSuccess) {
            console.log('   ✅ Successfully installed via Homebrew');
            return true;
        }
    }

    // Try MacPorts as fallback
    if (hasPackageManager('port')) {
        console.log('   Using MacPorts package manager...');
        const portSuccess = safeExec('sudo port install ImageMagick ghostscript');
        if (portSuccess) {
            console.log('   ✅ Successfully installed via MacPorts');
            return true;
        }
    }

    // Manual installation instructions
    console.log('   ⚠️  No supported package manager found.');
    console.log('   Please install Homebrew and try again:');
    console.log('   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');

    return false;
}

/**
 * Install dependencies on Linux
 * @returns {boolean} - True if successful, false otherwise
 */
function installLinux() {
    console.log('🐧 Installing on Linux...');

    // Try apt (Ubuntu/Debian)
    if (hasPackageManager('apt-get')) {
        console.log('   Using apt package manager (Ubuntu/Debian)...');
        const aptSuccess = safeExec('sudo apt-get update && sudo apt-get install -y imagemagick ghostscript');
        if (aptSuccess) {
            console.log('   ✅ Successfully installed via apt');
            return true;
        }
    }

    // Try yum (RHEL/CentOS)
    if (hasPackageManager('yum')) {
        console.log('   Using yum package manager (RHEL/CentOS)...');
        const yumSuccess = safeExec('sudo yum install -y ImageMagick ghostscript');
        if (yumSuccess) {
            console.log('   ✅ Successfully installed via yum');
            return true;
        }
    }

    // Try dnf (Fedora)
    if (hasPackageManager('dnf')) {
        console.log('   Using dnf package manager (Fedora)...');
        const dnfSuccess = safeExec('sudo dnf install -y ImageMagick ghostscript');
        if (dnfSuccess) {
            console.log('   ✅ Successfully installed via dnf');
            return true;
        }
    }

    // Try pacman (Arch Linux)
    if (hasPackageManager('pacman')) {
        console.log('   Using pacman package manager (Arch Linux)...');
        const pacmanSuccess = safeExec('sudo pacman -S --noconfirm imagemagick ghostscript');
        if (pacmanSuccess) {
            console.log('   ✅ Successfully installed via pacman');
            return true;
        }
    }

    // Try zypper (openSUSE)
    if (hasPackageManager('zypper')) {
        console.log('   Using zypper package manager (openSUSE)...');
        const zypperSuccess = safeExec('sudo zypper install -y ImageMagick ghostscript');
        if (zypperSuccess) {
            console.log('   ✅ Successfully installed via zypper');
            return true;
        }
    }

    console.log('   ⚠️  No supported package manager found.');
    console.log('   Please install manually using your distribution\'s package manager.');

    return false;
}

/**
 * Main installation function
 */
function main() {
    console.log('🚀 Installing system dependencies for PDF processing...\n');

    // Check current status
    const imagemagick = checkImageMagick();
    const ghostscript = checkGhostscript();

    if (imagemagick.exists && ghostscript.exists) {
        console.log('✅ All dependencies are already installed!');
        console.log(`   ImageMagick: ${imagemagick.version}`);
        console.log(`   Ghostscript: ${ghostscript.version}`);
        return;
    }

    console.log('📦 Missing dependencies detected, attempting to install...\n');

    let success = false;
    const platform = os.platform();

    switch (platform) {
        case 'win32':
            success = installWindows();
            break;
        case 'darwin':
            success = installMacOS();
            break;
        case 'linux':
            success = installLinux();
            break;
        default:
            console.log(`❌ Unsupported platform: ${platform}`);
            console.log('   Please install ImageMagick and Ghostscript manually.');
            process.exit(1);
    }

    if (success) {
        console.log('\n🎉 Installation completed! Verifying...');

        // Re-check dependencies
        const newImageMagick = checkImageMagick();
        const newGhostscript = checkGhostscript();

        if (newImageMagick.exists && newGhostscript.exists) {
            console.log('✅ All dependencies verified successfully!');
            console.log(`   ImageMagick: ${newImageMagick.version}`);
            console.log(`   Ghostscript: ${newGhostscript.version}`);
            console.log('\n💡 You may need to restart your terminal or IDE for changes to take effect.');
        } else {
            console.log('⚠️  Installation completed but dependencies not detected.');
            console.log('   You may need to restart your terminal or add them to your PATH.');
        }
    } else {
        console.log('\n❌ Automatic installation failed.');
        console.log('   Please install ImageMagick and Ghostscript manually and try again.');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
} 