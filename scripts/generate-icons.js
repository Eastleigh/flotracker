const sharp = require('sharp');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Bloom brand colors
const PRIMARY = '#E8838F';    // Rose pink
const BG = '#FFF9F5';         // Warm white
const DARK = '#2D2D2D';       // Dark charcoal
const SECONDARY = '#B5A3E8';  // Lavender

// Generate the main app icon (1024x1024)
async function generateIcon() {
  const size = 1024;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFF9F5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFF0EB;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="petal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8838F;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#D4697A;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="petal2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F0A0AA;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E8838F;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background with rounded corners -->
      <rect width="${size}" height="${size}" rx="220" ry="220" fill="url(#bg)"/>
      
      <!-- Decorative ring -->
      <circle cx="512" cy="460" r="280" fill="none" stroke="#E8838F" stroke-width="28" stroke-opacity="0.15"/>
      <circle cx="512" cy="460" r="280" fill="none" stroke="#E8838F" stroke-width="28" stroke-dasharray="440 1320" stroke-linecap="round"/>
      
      <!-- Flower/bloom - 5 petals -->
      <!-- Petal 1 (top) -->
      <ellipse cx="512" cy="370" rx="65" ry="100" fill="url(#petal)" transform="rotate(0, 512, 460)"/>
      <!-- Petal 2 -->
      <ellipse cx="512" cy="370" rx="65" ry="100" fill="url(#petal2)" transform="rotate(72, 512, 460)"/>
      <!-- Petal 3 -->
      <ellipse cx="512" cy="370" rx="65" ry="100" fill="url(#petal)" transform="rotate(144, 512, 460)"/>
      <!-- Petal 4 -->
      <ellipse cx="512" cy="370" rx="65" ry="100" fill="url(#petal2)" transform="rotate(216, 512, 460)"/>
      <!-- Petal 5 -->
      <ellipse cx="512" cy="370" rx="65" ry="100" fill="url(#petal)" transform="rotate(288, 512, 460)"/>
      
      <!-- Center of flower -->
      <circle cx="512" cy="460" r="40" fill="#F5C842"/>
      <circle cx="512" cy="460" r="25" fill="#F0B830"/>
      
      <!-- Small decorative dots -->
      <circle cx="500" cy="450" r="5" fill="#FFF9F5" opacity="0.7"/>
      <circle cx="520" cy="445" r="4" fill="#FFF9F5" opacity="0.6"/>
      <circle cx="508" cy="470" r="3" fill="#FFF9F5" opacity="0.5"/>
      
      <!-- "Bloom" text -->
      <text x="512" y="760" text-anchor="middle" font-family="Georgia, serif" font-size="120" font-weight="bold" fill="${PRIMARY}" letter-spacing="6">Bloom</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon.png'));

  console.log('Created icon.png (1024x1024)');
}

// Generate adaptive icon foreground (1024x1024 with safe zone)
async function generateAdaptiveIcon() {
  const size = 1024;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="petal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8838F;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#D4697A;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="petal2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F0A0AA;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E8838F;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Transparent background - adaptive icon handles its own bg -->
      <rect width="${size}" height="${size}" fill="transparent"/>
      
      <!-- Ring (subtle) -->
      <circle cx="512" cy="512" r="260" fill="none" stroke="#E8838F" stroke-width="24" stroke-opacity="0.15"/>
      <circle cx="512" cy="512" r="260" fill="none" stroke="#E8838F" stroke-width="24" stroke-dasharray="410 1230" stroke-linecap="round"/>
      
      <!-- Flower centered -->
      <ellipse cx="512" cy="422" rx="60" ry="95" fill="url(#petal)" transform="rotate(0, 512, 512)"/>
      <ellipse cx="512" cy="422" rx="60" ry="95" fill="url(#petal2)" transform="rotate(72, 512, 512)"/>
      <ellipse cx="512" cy="422" rx="60" ry="95" fill="url(#petal)" transform="rotate(144, 512, 512)"/>
      <ellipse cx="512" cy="422" rx="60" ry="95" fill="url(#petal2)" transform="rotate(216, 512, 512)"/>
      <ellipse cx="512" cy="422" rx="60" ry="95" fill="url(#petal)" transform="rotate(288, 512, 512)"/>
      
      <circle cx="512" cy="512" r="38" fill="#F5C842"/>
      <circle cx="512" cy="512" r="24" fill="#F0B830"/>
      
      <circle cx="500" cy="502" r="5" fill="#FFF9F5" opacity="0.7"/>
      <circle cx="520" cy="497" r="4" fill="#FFF9F5" opacity="0.6"/>
      <circle cx="508" cy="522" r="3" fill="#FFF9F5" opacity="0.5"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'adaptive-icon.png'));

  console.log('Created adaptive-icon.png (1024x1024)');
}

// Generate splash icon (centered bloom, larger)
async function generateSplashIcon() {
  const size = 1024;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="petal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8838F;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#D4697A;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="petal2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F0A0AA;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E8838F;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="${size}" height="${size}" fill="transparent"/>
      
      <!-- Large centered bloom flower -->
      <ellipse cx="512" cy="340" rx="100" ry="180" fill="url(#petal)" transform="rotate(0, 512, 512)"/>
      <ellipse cx="512" cy="340" rx="100" ry="180" fill="url(#petal2)" transform="rotate(72, 512, 512)"/>
      <ellipse cx="512" cy="340" rx="100" ry="180" fill="url(#petal)" transform="rotate(144, 512, 512)"/>
      <ellipse cx="512" cy="340" rx="100" ry="180" fill="url(#petal2)" transform="rotate(216, 512, 512)"/>
      <ellipse cx="512" cy="340" rx="100" ry="180" fill="url(#petal)" transform="rotate(288, 512, 512)"/>
      
      <circle cx="512" cy="512" r="65" fill="#F5C842"/>
      <circle cx="512" cy="512" r="42" fill="#F0B830"/>
      
      <circle cx="495" cy="498" r="8" fill="#FFF9F5" opacity="0.7"/>
      <circle cx="528" cy="490" r="6" fill="#FFF9F5" opacity="0.6"/>
      <circle cx="505" cy="530" r="5" fill="#FFF9F5" opacity="0.5"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ASSETS_DIR, 'splash-icon.png'));

  console.log('Created splash-icon.png (1024x1024)');
}

// Generate favicon (48x48)
async function generateFavicon() {
  const size = 48;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="8" fill="#FFF9F5"/>
      <ellipse cx="24" cy="19" rx="7" ry="11" fill="#E8838F" transform="rotate(0, 24, 24)"/>
      <ellipse cx="24" cy="19" rx="7" ry="11" fill="#F0A0AA" transform="rotate(72, 24, 24)"/>
      <ellipse cx="24" cy="19" rx="7" ry="11" fill="#E8838F" transform="rotate(144, 24, 24)"/>
      <ellipse cx="24" cy="19" rx="7" ry="11" fill="#F0A0AA" transform="rotate(216, 24, 24)"/>
      <ellipse cx="24" cy="19" rx="7" ry="11" fill="#E8838F" transform="rotate(288, 24, 24)"/>
      <circle cx="24" cy="24" r="5" fill="#F5C842"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(48, 48)
    .png()
    .toFile(path.join(ASSETS_DIR, 'favicon.png'));

  console.log('Created favicon.png (48x48)');
}

async function main() {
  await generateIcon();
  await generateAdaptiveIcon();
  await generateSplashIcon();
  await generateFavicon();
  console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
