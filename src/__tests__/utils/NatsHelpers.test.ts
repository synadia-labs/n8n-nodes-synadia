import { 
  parseNatsMessage, 
  encodeMessage, 
  parseMessage,
  createNatsHeaders, 
  validateSubject,
  encodeKvValue,
  decodeKvValue
} from '../../utils/NatsHelpers';

describe('NatsHelpers', () => {
  describe('parseNatsMessage', () => {
    it('should parse JSON message correctly', () => {
      const mockMsg = {
        subject: 'test.subject',
        data: new TextEncoder().encode('{"hello": "world"}'),
        reply: 'test.reply',
        headers: undefined,
        sid: 1,
        seq: undefined,
      } as any;

      const result = parseNatsMessage(mockMsg);

      expect(result.json.subject).toBe('test.subject');
      expect(result.json.data).toEqual({ hello: 'world' });
      expect(result.json.replyTo).toBe('test.reply');
      expect(result.json.timestamp).toBeDefined();
    });

    it('should parse string message when not JSON', () => {
      const mockMsg = {
        subject: 'test.subject',
        data: new TextEncoder().encode('plain text message'),
        reply: undefined,
        headers: undefined,
        sid: 1,
      } as any;

      const result = parseNatsMessage(mockMsg);

      expect(result.json.data).toBe('plain text message');
    });

    it('should handle empty message', () => {
      const mockMsg = {
        subject: 'test.subject',
        data: new Uint8Array(0),
        reply: undefined,
        headers: undefined,
        sid: 1,
      } as any;

      const result = parseNatsMessage(mockMsg);

      expect(result.json.data).toBe('');
    });

    it('should include headers when present', () => {
      const mockHeaders = new Map<string, string | string[]>([
        ['X-Custom-Header', 'value1'],
        ['X-Another-Header', ['value2', 'value3']],
      ]);

      const mockMsg = {
        subject: 'test.subject',
        data: new TextEncoder().encode('{}'),
        reply: undefined,
        headers: mockHeaders,
        sid: 1,
      } as any;

      const result = parseNatsMessage(mockMsg);

      expect(result.json.headers).toEqual({
        'X-Custom-Header': 'value1',
        'X-Another-Header': 'value2,value3',
      });
    });

    it('should include sequence number for JetStream messages', () => {
      const mockMsg = {
        subject: 'test.subject',
        data: new TextEncoder().encode('{}'),
        reply: undefined,
        headers: undefined,
        sid: 1,
        seq: 123,
      } as any;

      const result = parseNatsMessage(mockMsg);

      expect(result.json.seq).toBe(123);
    });
  });

  describe('encodeMessage', () => {
    it('should encode JSON correctly', () => {
      const data = { test: 'value' };
      const encoded = encodeMessage(data, 'json');
      const decoded = JSON.parse(new TextDecoder().decode(encoded));

      expect(decoded).toEqual(data);
    });

    it('should encode string correctly', () => {
      const data = 'test string';
      const encoded = encodeMessage(data, 'string');
      const decoded = new TextDecoder().decode(encoded);

      expect(decoded).toBe(data);
    });

    it('should encode binary from Uint8Array', () => {
      const data = new Uint8Array([1, 2, 3, 4]);
      const encoded = encodeMessage(data, 'binary');

      expect(encoded).toEqual(data);
    });

    it('should encode binary from base64 string', () => {
      const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World" in base64
      const encoded = encodeMessage(base64, 'binary');
      const decoded = new TextDecoder().decode(encoded);

      expect(decoded).toBe('Hello World');
    });

    it('should throw error for invalid binary data', () => {
      expect(() => encodeMessage({ invalid: 'object' }, 'binary')).toThrow(
        'Binary encoding requires Uint8Array or base64 string'
      );
    });

    it('should throw error for unsupported encoding', () => {
      expect(() => encodeMessage('test', 'invalid' as any)).toThrow(
        'Unsupported encoding: invalid'
      );
    });
  });

  describe('createNatsHeaders', () => {
    it('should return undefined for empty headers', () => {
      expect(createNatsHeaders({})).toBeUndefined();
      expect(createNatsHeaders(undefined)).toBeUndefined();
    });

    it('should create headers object', () => {
      const headers = createNatsHeaders({
        'X-Test': 'value',
        'X-Another': 'value2',
      });

      expect(headers).toBeDefined();
      expect(headers.headers).toBeDefined();
    });
  });

  describe('validateSubject', () => {
    it('should accept valid subjects', () => {
      expect(() => validateSubject('test')).not.toThrow();
      expect(() => validateSubject('test.subject')).not.toThrow();
      expect(() => validateSubject('test.*')).not.toThrow();
      expect(() => validateSubject('test.>')).not.toThrow();
      expect(() => validateSubject('test_subject')).not.toThrow();
      expect(() => validateSubject('test-subject')).not.toThrow();
      expect(() => validateSubject('TEST123')).not.toThrow();
    });

    it('should reject empty subjects', () => {
      expect(() => validateSubject('')).toThrow('Subject cannot be empty');
      expect(() => validateSubject('   ')).toThrow('Subject cannot be empty');
    });

    it('should reject subjects with spaces', () => {
      expect(() => validateSubject('test subject')).toThrow('Subject cannot contain spaces');
    });

    it('should reject subjects with invalid characters', () => {
      expect(() => validateSubject('test@subject')).toThrow(
        'Subject contains invalid characters'
      );
      expect(() => validateSubject('test#subject')).toThrow(
        'Subject contains invalid characters'
      );
      expect(() => validateSubject('test$subject')).toThrow(
        'Subject contains invalid characters'
      );
    });
  });

  describe('parseMessage', () => {
    it('should parse binary data', () => {
      const originalData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const parsed = parseMessage(originalData, 'binary');
      
      expect(parsed).toBe('SGVsbG8='); // Base64 encoded "Hello"
    });

    it('should parse string data', () => {
      const data = new TextEncoder().encode('Hello World');
      const parsed = parseMessage(data, 'string');
      
      expect(parsed).toBe('Hello World');
    });

    it('should parse JSON data', () => {
      const data = new TextEncoder().encode('{"test": "value"}');
      const parsed = parseMessage(data, 'json');
      
      expect(parsed).toEqual({ test: 'value' });
    });

    it('should throw error for invalid JSON with json encoding', () => {
      const data = new TextEncoder().encode('invalid json');
      
      expect(() => parseMessage(data, 'json')).toThrow('Failed to parse JSON');
    });

    it('should handle auto mode - valid JSON', () => {
      const data = new TextEncoder().encode('{"test": "value"}');
      const parsed = parseMessage(data, 'auto');
      
      expect(parsed).toEqual({ test: 'value' });
    });

    it('should handle auto mode - fallback to string', () => {
      const data = new TextEncoder().encode('plain text');
      const parsed = parseMessage(data, 'auto');
      
      expect(parsed).toBe('plain text');
    });

    it('should handle empty data', () => {
      const data = new Uint8Array(0);
      const parsed = parseMessage(data, 'string');
      
      expect(parsed).toBe('');
    });

    it('should handle unknown encoding as string', () => {
      const data = new TextEncoder().encode('test');
      const parsed = parseMessage(data, 'unknown' as any);
      
      expect(parsed).toBe('test');
    });
  });

  describe('encodeKvValue', () => {
    it('should encode binary value from base64', () => {
      const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
      const encoded = encodeKvValue(base64, 'binary');
      const decoded = new TextDecoder().decode(encoded);
      
      expect(decoded).toBe('Hello World');
    });

    it('should encode JSON value from string', () => {
      const value = '{"test": "value"}';
      const encoded = encodeKvValue(value, 'json');
      const decoded = new TextDecoder().decode(encoded);
      
      expect(JSON.parse(decoded)).toEqual({ test: 'value' });
    });

    it('should encode JSON value from object', () => {
      const value = { test: 'value' };
      const encoded = encodeKvValue(value, 'json');
      const decoded = new TextDecoder().decode(encoded);
      
      expect(JSON.parse(decoded)).toEqual({ test: 'value' });
    });

    it('should encode string value', () => {
      const value = 'plain text';
      const encoded = encodeKvValue(value, 'string');
      const decoded = new TextDecoder().decode(encoded);
      
      expect(decoded).toBe('plain text');
    });

    it('should handle unknown type as string', () => {
      const value = 'test';
      const encoded = encodeKvValue(value, 'unknown');
      const decoded = new TextDecoder().decode(encoded);
      
      expect(decoded).toBe('test');
    });
  });

  describe('decodeKvValue', () => {
    it('should decode JSON value', () => {
      const data = new TextEncoder().encode('{"test": "value"}');
      const decoded = decodeKvValue(data);
      
      expect(decoded).toEqual({ test: 'value' });
    });

    it('should fallback to string for non-JSON', () => {
      const data = new TextEncoder().encode('plain text');
      const decoded = decodeKvValue(data);
      
      expect(decoded).toBe('plain text');
    });

    it('should handle empty data', () => {
      const data = new Uint8Array(0);
      const decoded = decodeKvValue(data);
      
      expect(decoded).toBe('');
    });
  });
});