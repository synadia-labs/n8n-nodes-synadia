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
		
		try {
			// Use getBlob for simplified binary data retrieval
			const binaryData = await os.getBlob(params.name);
			const stringData = new TextDecoder().decode(binaryData);
			let data: any = stringData;
			
			// Try to parse as JSON if requested
			if (params.options.parseJson) {
				try {
					data = JSON.parse(stringData);
				} catch {
					// Keep as string if not valid JSON
				}
			}
			
			// Get object info for metadata
			const info = await os.info(params.name);
			
			return this.createResult({
				name: params.name,
				found: true,
				data,
				info: {
					name: info?.name || params.name,
					size: info?.size || (binaryData ? binaryData.length : 0),
					digest: info?.digest,
					mtime: info?.mtime,
				},
			}, params);
		} catch (error: any) {
			// Handle object not found
			if (error.message && error.message.includes('not found')) {
				return this.createResult({
					name: params.name,
					found: false,
				}, params);
			}
			throw error;
		}
	}
}