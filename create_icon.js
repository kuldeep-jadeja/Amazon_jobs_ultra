const fs = require('fs');

// Create a minimal 1x1 PNG file (base64 encoded)
const minimalPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHIinnoMAAAAASUVORK5CYII=';
const buffer = Buffer.from(minimalPngBase64, 'base64');

// Write the PNG file
fs.writeFileSync('icon.png', buffer);
console.log('Minimal icon.png created successfully');
