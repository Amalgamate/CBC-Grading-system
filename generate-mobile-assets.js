#!/usr/bin/env node

/**
 * EDucore Mobile App - Asset Generator
 * Generates all required Android launcher icons and splash screens from logo.png
 * 
 * Usage: node generate-mobile-assets.js
 * 
 * Requires: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'public', 'logo.png');
const androidResPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Icon sizes for different Android densities
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// Splash screen sizes for different densities and orientations
const splashSizes = {
  'drawable': { width: 720, height: 960 },
  'drawable-hdpi': { width: 480, height: 640 },
  'drawable-xhdpi': { width: 720, height: 960 },
  'drawable-xxhdpi': { width: 1080, height: 1440 },
  'drawable-xxxhdpi': { width: 1440, height: 1920 },
  'drawable-land-hdpi': { width: 640, height: 480 },
  'drawable-land-xhdpi': { width: 960, height: 720 },
  'drawable-land-xxhdpi': { width: 1440, height: 1080 },
  'drawable-land-xxxhdpi': { width: 1920, height: 1440 }
};

const brandColor = '#14b8a6'; // EDucore teal

async function generateAssets() {
  console.log('🎨 Generating EDucore Mobile Assets...\n');

  if (!fs.existsSync(logoPath)) {
    console.error('❌ Error: logo.png not found at', logoPath);
    process.exit(1);
  }

  try {
    // Generate app icons
    console.log('📱 Generating app icons...');
    for (const [dir, size] of Object.entries(iconSizes)) {
      const dirPath = path.join(androidResPath, dir);
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'cover',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(dirPath, 'ic_launcher.png'));
      console.log(`   ✅ ${dir}: ${size}x${size}`);
    }

    // Generate splash screens with branding
    console.log('\n🖼️  Generating splash screens...');
    for (const [dir, { width, height }] of Object.entries(splashSizes)) {
      const dirPath = path.join(androidResPath, dir);
      
      // Calculate logo size (max 30% of splash dimensions)
      const maxLogoSize = Math.min(width, height) * 0.3;
      const logoSize = Math.floor(maxLogoSize);
      
      // Resize logo and center it
      const resizedLogo = await sharp(logoPath)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 20, g: 184, b: 166, alpha: 1 } })
        .png()
        .toBuffer();
      
      // Create splash with background color and resized logo
      await sharp({
        create: {
          width: width,
          height: height,
          channels: 4,
          background: { r: 20, g: 184, b: 166, alpha: 1 } // Brand teal
        }
      })
        .composite([
          {
            input: resizedLogo,
            top: Math.floor((height - logoSize) / 2),
            left: Math.floor((width - logoSize) / 2)
          }
        ])
        .png()
        .toFile(path.join(dirPath, 'splash.png'));

      console.log(`   ✅ ${dir.replace('drawable-', '')}: ${width}x${height}`);
    }

    console.log('\n✅ All assets generated successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. npm run build');
    console.log('   2. npx cap copy');
    console.log('   3. Build APK in Android Studio');

  } catch (error) {
    console.error('❌ Error generating assets:', error);
    process.exit(1);
  }
}

generateAssets();
