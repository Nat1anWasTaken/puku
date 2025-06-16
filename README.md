This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

This project requires **ImageMagick** and **Ghostscript** for PDF processing and thumbnail generation. These must be installed on your system before running the application.

### System Dependencies

The application uses the `pdf-thumbnail` package which requires:

- **ImageMagick** - for image processing and conversion
- **Ghostscript** - for PDF rendering and manipulation

## Quick Setup

Run the setup script to automatically install dependencies and set up the project:

```bash
bun run setup
```

This will:

1. Check for required system dependencies (ImageMagick & Ghostscript)
2. Attempt to install missing dependencies automatically
3. Install Node.js dependencies

### Manual System Dependencies Installation

If automatic installation fails, install manually:

#### Windows

```bash
# Using Chocolatey (recommended)
choco install imagemagick ghostscript

# Using Scoop
scoop install imagemagick ghostscript

# Using winget
winget install ImageMagick.ImageMagick
winget install ArtifexSoftware.GhostScript
```

#### macOS

```bash
# Using Homebrew (recommended)
brew install imagemagick ghostscript

# Using MacPorts
sudo port install ImageMagick ghostscript
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install imagemagick ghostscript

# RHEL/CentOS/Fedora
sudo yum install ImageMagick ghostscript
# or
sudo dnf install ImageMagick ghostscript

# Arch Linux
sudo pacman -S imagemagick ghostscript
```

## Getting Started

After installing system dependencies, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Available Scripts

- `bun run setup` - Install system dependencies and Node.js packages
- `bun run setup:deps` - Check and install system dependencies only
- `bun run setup:deps:check` - Check if system dependencies are installed
- `bun run setup:deps:install` - Install missing system dependencies
- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun start` - Start production server
- `bun run lint` - Run ESLint

## Features

This project includes:

- PDF processing and thumbnail generation
- Music sheet metadata extraction
- Arrangement management
- Part editing and organization

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
