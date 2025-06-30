// Test setup file
// Add any global test configuration here

// Mock console.error to avoid noise in tests
global.console.error = jest.fn();

// Set test timeout
jest.setTimeout(10000);
