#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const LOGO_PATH = path.join(__dirname, 'public', 'logo.png');
const ANDROID_RES_PATH = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const BRAND_COLOR = '#14b8a6';

// Mipmap icon sizes (used for app launcher icon)
const MIPMAP_SIZES = {
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192
};

// Drawable icon sizes (used in UI and other places)
const DRAWABLE_SIZES = {
  'mdpi': 24,
  'hdpi': 36,
  'xhdpi': 48,
  'xxhdpi': 72,
  'xxxhdpi': 96
};

async function generateIcon(inputPath, outputPath, size) {
  try {
    // Create output directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated icon: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating ${outputPath}:`, error.message);
  }
}

async function generateIconRound(inputPath, outputPath, size) {
  try {
    // Create output directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create a circular mask for rounded icons
    const circleSize = size;
    const svgCircle = Buffer.from(`
      <svg width="${circleSize}" height="${circleSize}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="circle">
            <rect width="${circleSize}" height="${circleSize}" fill="white"/>
            <circle cx="${circleSize / 2}" cy="${circleSize / 2}" r="${circleSize / 2}" fill="black"/>
          </mask>
        </defs>
        <circle cx="${circleSize / 2}" cy="${circleSize / 2}" r="${circleSize / 2}" fill="white"/>
      </svg>
    `);

    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .composite([
        {
          input: svgCircle,
          blend: 'dest-in'
        }
      ])
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated rounded icon: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating ${outputPath}:`, error.message);
  }
}

async function generateSplashScreen(inputPath, outputPath, width, height, isPortrait) {
  try {
    // Create output directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const logoSize = isPortrait ? Math.min(width, height) * 0.4 : Math.min(width, height) * 0.3;
    
    // First, resize the logo to the appropriate size
    const logoBuffer = await sharp(inputPath)
      .resize(Math.floor(logoSize), Math.floor(logoSize), { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();

    // Create a gradient background with EDucore brand colors
    const svg = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0d9488;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)"/>
      </svg>
    `);

    await sharp(svg)
      .resize(width, height, { fit: 'fill' })
      .composite([
        {
          input: logoBuffer,
          top: Math.floor((height - Math.floor(logoSize)) / 2),
          left: Math.floor((width - Math.floor(logoSize)) / 2)
        }
      ])
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated splash screen: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating splash screen ${outputPath}:`, error.message);
  }
}

async function main() {
  if (!fs.existsSync(LOGO_PATH)) {
    console.error(`❌ Logo not found at ${LOGO_PATH}`);
    process.exit(1);
  }

  console.log('🎨 Generating EDucore Mobile Assets...\n');
  console.log('📱 Generating Mipmap Icons (Launcher)...');

  // Generate mipmap icons
  for (const [density, size] of Object.entries(MIPMAP_SIZES)) {
    const folder = `mipmap-${density}`;
    const iconPath = path.join(ANDROID_RES_PATH, folder, 'ic_launcher.png');
    const roundIconPath = path.join(ANDROID_RES_PATH, folder, 'ic_launcher_round.png');
    
    await generateIcon(LOGO_PATH, iconPath, size);
    await generateIconRound(LOGO_PATH, roundIconPath, size);
  }

  console.log('\n🎨 Generating Drawable Icons (UI Elements)...');

  // Generate drawable icons
  for (const [density, size] of Object.entries(DRAWABLE_SIZES)) {
    const folder = `drawable-${density}`;
    const iconPath = path.join(ANDROID_RES_PATH, folder, 'icon.png');
    
    await generateIcon(LOGO_PATH, iconPath, size);
  }

  console.log('\n🌅 Generating Splash Screens...');

  // Splash screen sizes (Portrait)
  const splashScreensPortrait = [
    { folder: 'drawable-port-mdpi', width: 320, height: 470 },
    { folder: 'drawable-port-hdpi', width: 480, height: 640 },
    { folder: 'drawable-port-xhdpi', width: 720, height: 960 },
    { folder: 'drawable-port-xxhdpi', width: 1080, height: 1440 },
    { folder: 'drawable-port-xxxhdpi', width: 1440, height: 1920 }
  ];

  // Splash screen sizes (Landscape)
  const splashScreensLandscape = [
    { folder: 'drawable-land-mdpi', width: 470, height: 320 },
    { folder: 'drawable-land-hdpi', width: 640, height: 480 },
    { folder: 'drawable-land-xhdpi', width: 960, height: 720 },
    { folder: 'drawable-land-xxhdpi', width: 1440, height: 1080 },
    { folder: 'drawable-land-xxxhdpi', width: 1920, height: 1440 }
  ];

  for (const screen of splashScreensPortrait) {
    const splashPath = path.join(ANDROID_RES_PATH, screen.folder, 'splash.png');
    await generateSplashScreen(LOGO_PATH, splashPath, screen.width, screen.height, true);
  }

  for (const screen of splashScreensLandscape) {
    const splashPath = path.join(ANDROID_RES_PATH, screen.folder, 'splash.png');
    await generateSplashScreen(LOGO_PATH, splashPath, screen.width, screen.height, false);
  }

  console.log('\n✅ Mobile asset generation complete!');
  console.log('📦 Ready to build APK');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
