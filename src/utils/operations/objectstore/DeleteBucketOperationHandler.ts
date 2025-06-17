import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { jetstreamManager } from '../../../bundled/nats-bundled';

export class DeleteBucketOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'deleteBucket';
	
	async execute(nc: any, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		const jsm = await jetstreamManager(nc);
		const success = await jsm.streams.delete(`OBJ_${params.bucket}`);
		
		return this.createResult({
			success: success,
		}, params);
	}
}