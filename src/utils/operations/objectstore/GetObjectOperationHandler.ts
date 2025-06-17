import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';
import { NodeOperationError } from 'n8n-workflow';

export class GetObjectOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'get';
	
	async execute(os: ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		if (!params.name) {
			throw new Error('Name is required for get operation');
		}
		
		const returnType = params.options.returnType || 'string';
		const includeInfo = params.options.includeInfo !== false;
		
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
		
		const stringData = new TextDecoder().decode(combined);
		let data: any = stringData;
		
		// Try to parse as JSON if requested
		if (params.options.parseJson) {
			try {
				data = JSON.parse(stringData);
			} catch {
				// Keep as string if not valid JSON
			}
		}
		
		return this.createResult({
			name: params.name,
			found: true,
			data,
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