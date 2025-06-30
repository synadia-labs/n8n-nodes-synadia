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
		
		// Use data as provided by the user without conversions
		let objectData: Uint8Array;
		
		if (typeof params.data === 'string') {
			// String data - encode as UTF-8
			objectData = new TextEncoder().encode(params.data);
		} else if (params.data instanceof Uint8Array) {
			// Binary data already in correct format
			objectData = params.data;
		} else if (params.data instanceof Buffer) {
			// Node.js Buffer - convert to Uint8Array
			objectData = new Uint8Array(params.data);
		} else {
			// Other data types - stringify and encode
			objectData = new TextEncoder().encode(JSON.stringify(params.data));
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