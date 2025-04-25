const fs = require('fs');
const path = require('path');

// Load app.config.js content
try {
  const appConfigPath = path.join(__dirname, 'app.config.js');
  const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
  console.log('---- app.config.js content ----');
  console.log(appConfigContent);
} catch (error) {
  console.error('Error reading app.config.js:', error.message);
}

// Load app.json
try {
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  console.log('\n---- app.json ----');
  console.log('Android package:', appJson.expo.android?.package);
  console.log('iOS bundleIdentifier:', appJson.expo.ios?.bundleIdentifier);
  console.log('Scheme:', appJson.expo.scheme);
} catch (error) {
  console.error('Error loading app.json:', error.message);
} 