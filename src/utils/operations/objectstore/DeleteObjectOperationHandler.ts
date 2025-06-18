import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';
import { ApplicationError } from 'n8n-workflow';

export class DeleteObjectOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'delete';
	
	async execute(os: ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		if (!params.name) {
			throw new ApplicationError('Name is required for delete operation', {
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
			});
		}
		
		await os.delete(params.name);
		
		return this.createResult({
			name: params.name,
			success: true,
		}, params);
	}
}