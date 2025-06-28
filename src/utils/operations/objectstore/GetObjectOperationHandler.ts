import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';
import { ApplicationError } from 'n8n-workflow';

export class GetObjectOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'get';
	
	async execute(os: ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		if (!params.name) {
			throw new ApplicationError('Name is required for get operation', {
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
			});
		}
		
		
		const result = await os.get(params.name);
		if (result === null) {
			return this.createResult({
				name: params.name,
				found: false,
			}, params);
		}
		
		// Read the stream data
		const chunks: Uint8Array[] = [];
		const reader = result.data.getReader();
		
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				chunks.push(value);
			}
		} finally {
			reader.releaseLock();
		}
		
		// Combine chunks
		const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
		const combined = new Uint8Array(totalLength);
		let offset = 0;
		for (const chunk of chunks) {
			combined.set(chunk, offset);
			offset += chunk.length;
		}
		
		// Return raw data without automatic parsing - let users handle decoding
		return this.createResult({
			name: params.name,
			found: true,
			data: combined,
			info: {
				name: result.info.name,
				size: result.info.size,
				chunks: result.info.chunks,
				digest: result.info.digest,
				mtime: result.info.mtime,
			},
		}, params);
	}
}