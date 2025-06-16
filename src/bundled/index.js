// This file loads the bundled NATS at runtime
// It's used by the compiled JavaScript files

// In production, load the bundled version
module.exports = require('./nats-bundled.js');