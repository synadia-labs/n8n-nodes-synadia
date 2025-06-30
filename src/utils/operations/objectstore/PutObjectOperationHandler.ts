import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';
import { ApplicationError } from 'n8n-workflow';

export class PutObjectOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'put';
	
	async execute(os: ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		if (!params.name || params.data === undefined) {
			throw new ApplicationError('Name and data are required for put operation', {
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
			});
		}
		
		let objectData: Uint8Array;
		const dataType = params.options.dataType || 'string';
		
		if (dataType === 'binary') {
			// For binary data, decode base64 and convert to Uint8Array
			const buffer = Buffer.from(params.data, 'base64');
			objectData = new Uint8Array(buffer);
		} else if (dataType === 'json') {
			const jsonData = typeof params.data === 'string' ? JSON.parse(params.data) : params.data;
			objectData = new TextEncoder().encode(JSON.stringify(jsonData));
		} else {
			objectData = new TextEncoder().encode(params.data);
		}
		
		// Prepare metadata for putBlob
		const meta: any = {
			name: params.name,
			description: params.options.description,
		};
		
		// Parse headers if provided and add to metadata
		if (params.options.headers) {
			const headers = JSON.parse(params.options.headers);
			meta.headers = headers;
		}
		
		// Use putBlob for simplified object storage
		const info = await os.putBlob(meta, objectData);
		
		return this.createResult({
			name: params.name,
			success: true,
			info: {
				name: info.name,
				size: info.size,
				digest: info.digest,
				mtime: info.mtime,
			},
		}, params);
	}
}