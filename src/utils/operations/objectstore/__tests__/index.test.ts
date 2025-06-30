import { objectStoreOperationHandlers } from '../index';

describe('objectStoreOperationHandlers', () => {
	it('should export all operation handlers', () => {
		expect(objectStoreOperationHandlers).toBeDefined();
		expect(objectStoreOperationHandlers.createBucket).toBeDefined();
		expect(objectStoreOperationHandlers.deleteBucket).toBeDefined();
		expect(objectStoreOperationHandlers.put).toBeDefined();
		expect(objectStoreOperationHandlers.get).toBeDefined();
		expect(objectStoreOperationHandlers.delete).toBeDefined();
		expect(objectStoreOperationHandlers.info).toBeDefined();
		expect(objectStoreOperationHandlers.list).toBeDefined();
		expect(objectStoreOperationHandlers.status).toBeDefined();
	});

	it('should have handlers with execute methods', () => {
		Object.values(objectStoreOperationHandlers).forEach(handler => {
			expect(handler).toHaveProperty('execute');
			expect(typeof handler.execute).toBe('function');
		});
	});

	it('should have correct number of handlers', () => {
		const handlers = Object.keys(objectStoreOperationHandlers);
		expect(handlers).toHaveLength(8);
	});
});