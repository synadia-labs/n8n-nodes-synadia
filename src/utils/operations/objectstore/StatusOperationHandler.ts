import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';

export class StatusOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'status';
	
	async execute(os: ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		const status = await os.status();
		
		return this.createResult({
			bucket: status.bucket,
			size: status.size,
			objects: (status as any).chunks || 0,
			bytes: (status as any).bytes || status.size || 0,
			storage: (status as any).storage,
			replicas: (status as any).replicas,
		}, params);
	}
}