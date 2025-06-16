// This script converts the ESM NATS.ws bundle to CommonJS
const fs = require('fs');
const path = require('path');

// Read the ESM bundle
const esmContent = fs.readFileSync(path.join(__dirname, 'nats-ws.js'), 'utf8');

// Wrap it in a CommonJS module
const cjsContent = `// Auto-generated CommonJS bundle from NATS.ws
// DO NOT EDIT - Generated from nats.ws ESM bundle

(function() {
  // Capture exports
  const exports = {};
  
  // Define module context
  const module = { exports };
  
  // Convert export syntax
  ${esmContent.replace(/export\s*{\s*(\w+)\s+as\s+(\w+)\s*}/g, 'module.exports.$2 = $1')}
  
  // Export everything
  ${esmContent.includes('export') ? 'module.exports = exports;' : ''}
  
  // Make available to Node.js
  if (typeof module !== 'undefined' && module.exports) {
    // Already handled above
  }
})();
`;

// Write the CommonJS version
fs.writeFileSync(path.join(__dirname, 'nats-ws-cjs.js'), cjsContent);
console.log('Converted NATS.ws bundle to CommonJS');