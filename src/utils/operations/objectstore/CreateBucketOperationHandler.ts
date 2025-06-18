import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { jetstream, Objm } from '../../../bundled/nats-bundled';

export class CreateBucketOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'createBucket';
	
	async execute(nc: any, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		const js = jetstream(nc);
		const config: any = {
			storage: params.options.storage || 'file',
			replicas: params.options.replicas || 1,
		};
		
		if (params.options.description) config.description = params.options.description;
		if (params.options.ttl) config.ttl = params.options.ttl * 1000000000; // Convert to nanoseconds
		if (params.options.maxBucketSize > 0) config.max_bytes = params.options.maxBucketSize;
		
		const objManager = new Objm(js);
		const os = await objManager.create(params.bucket, config);
		const status = await os.status();
		
		return this.createResult({
			success: true,
			status: {
				bucket: status.bucket,
				size: status.size,
				metadata: (status as any).metadata,
				objects: (status as any).chunks || 0,
			},
		}, params);
	}
}