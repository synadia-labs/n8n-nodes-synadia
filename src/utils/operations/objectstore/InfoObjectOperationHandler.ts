import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';

export class InfoObjectOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'info';
	
	async execute(os: ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		if (!params.name) {
			throw new Error('Name is required for info operation');
		}
		
		const info = await os.info(params.name);
		
		if (info === null) {
			return this.createResult({
				name: params.name,
				found: false,
			}, params);
		}
		
		return this.createResult({
			name: params.name,
			found: true,
			info: {
				name: info.name,
				size: info.size,
				chunks: info.chunks,
				digest: info.digest,
				mtime: info.mtime,
				headers: info.headers,
				options: info.options,
			},
		}, params);
	}
}