import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';

export class ListObjectsOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'list';
	
	async execute(os: ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		const objects: any[] = [];
		const list = await os.list();
		
		for await (const info of list) {
			objects.push({
				name: info.name,
				size: info.size,
				chunks: info.chunks,
				digest: info.digest,
				mtime: info.mtime,
				isLink: info.options?.link !== undefined,
			});
		}
		
		return this.createResult({
			objects,
			count: objects.length,
		}, params);
	}
}