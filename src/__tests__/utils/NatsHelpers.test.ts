import { 
  parseNatsMessage, 
  encodeMessage, 
  createNatsHeaders, 
  validateSubject,
  encodeKvValue
} from '../../utils/NatsHelpers';

describe('NatsHelpers', () => {
  describe('parseNatsMessage', () => {
    it('should preserve raw data without automatic parsing', () => {
      const mockData = new TextEncoder().encode('{"hello": "world"}');
      const mockMsg = {
        subject: 'test.subject',
        data: mockData,
        reply: 'test.reply',
        headers: undefined,
        sid: 1,
        seq: undefined,
      } as any;

      const result = parseNatsMessage(mockMsg);

      expect(result.json.subject).toBe('test.subject');
      expect(result.json.data).toBe(mockData); // Raw Uint8Array, not parsed JSON
      expect(result.json.replyTo).toBe('test.reply');
      expect(result.json.timestamp).toBeDefined();
    });

    it('should preserve raw data for plain text messages', () => {
      const mockData = new TextEncoder().encode('plain text message');
      const mockMsg = {
        subject: 'test.subject',
        data: mockData,
        reply: undefined,
        headers: undefined,
        sid: 1,
      } as any;

      const result = parseNatsMessage(mockMsg);

      expect(result.json.data).toBe(mockData); // Raw Uint8Array, not decoded string
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

      expect(result.json.data).toEqual(new Uint8Array(0)); // Raw empty Uint8Array
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
    it('should always encode as JSON', () => {
      const data = { test: 'value' };
      const encoded = encodeMessage(data);
      const decoded = JSON.parse(new TextDecoder().decode(encoded));

      expect(decoded).toEqual(data);
    });

    it('should encode strings as JSON', () => {
      const data = 'test string';
      const encoded = encodeMessage(data);
      const decoded = JSON.parse(new TextDecoder().decode(encoded));

      expect(decoded).toBe(data);
    });

    it('should encode arrays as JSON', () => {
      const data = [1, 2, 3, 4];
      const encoded = encodeMessage(data);
      const decoded = JSON.parse(new TextDecoder().decode(encoded));

      expect(decoded).toEqual(data);
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


  describe('encodeKvValue', () => {
    it('should encode string value as JSON', () => {
      const value = 'plain text';
      const encoded = encodeKvValue(value);
      const decoded = new TextDecoder().decode(encoded);
      
      expect(JSON.parse(decoded)).toBe('plain text');
    });

    it('should encode object value as JSON', () => {
      const value = { test: 'value' };
      const encoded = encodeKvValue(value);
      const decoded = new TextDecoder().decode(encoded);
      
      expect(JSON.parse(decoded)).toEqual({ test: 'value' });
    });

    it('should encode array value as JSON', () => {
      const value = [1, 2, 3];
      const encoded = encodeKvValue(value);
      const decoded = new TextDecoder().decode(encoded);
      
      expect(JSON.parse(decoded)).toEqual([1, 2, 3]);
    });

    it('should encode number value as JSON', () => {
      const value = 42;
      const encoded = encodeKvValue(value);
      const decoded = new TextDecoder().decode(encoded);
      
      expect(JSON.parse(decoded)).toBe(42);
    });
  });

});