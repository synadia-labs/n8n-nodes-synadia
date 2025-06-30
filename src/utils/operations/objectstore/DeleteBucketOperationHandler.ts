import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { jetstream, Objm } from '../../../bundled/nats-bundled';

export class DeleteBucketOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'deleteBucket';
	
	async execute(nc: any, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		const js = jetstream(nc);
		const objManager = new Objm(js);
		const objectStore = await objManager.open(params.bucket);
		const success = await objectStore.destroy();
		
		return this.createResult({
			success: success,
		}, params);
	}
}