import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';
import { ApplicationError } from 'n8n-workflow';

export class PutObjectOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'put';
	
	async execute(os: ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		if (!params.name || !params.data) {
			throw new ApplicationError('Name and data are required for put operation', {
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
			});
		}
		
		// Use simplified encoding - always JSON encode object data directly
		const objectData = new TextEncoder().encode(JSON.stringify(params.data));
		
		const putOptions: any = {
			headers: params.options.headers ? JSON.parse(params.options.headers) : undefined,
			description: params.options.description,
			chunkSize: params.options.chunkSize || 128 * 1024,
		};
		
		// Create a readable stream from the data
		const readable = new ReadableStream({
			start(controller) {
				controller.enqueue(objectData);
				controller.close();
			}
		});
		
		const info = await os.put({ name: params.name, ...putOptions }, readable);
		
		return this.createResult({
			name: params.name,
			success: true,
			info: {
				name: info.name,
				size: info.size,
				chunks: info.chunks,
				digest: info.digest,
				mtime: info.mtime,
			},
		}, params);
	}
}