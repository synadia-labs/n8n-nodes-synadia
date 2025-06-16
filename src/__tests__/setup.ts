// Test setup file
// Add any global test configuration here

// Mock console.error to avoid noise in tests
global.console.error = jest.fn();

// Set test timeout
jest.setTimeout(10000);

// Mock WebSocket for NATS.ws
global.WebSocket = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
})) as any;