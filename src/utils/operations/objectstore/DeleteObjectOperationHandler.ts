import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';

export class DeleteObjectOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'delete';
	
	async execute(os: ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		if (!params.name) {
			throw new Error('Name is required for delete operation');
		}
		
		await os.delete(params.name);
		
		return this.createResult({
			name: params.name,
			success: true,
		}, params);
	}
}