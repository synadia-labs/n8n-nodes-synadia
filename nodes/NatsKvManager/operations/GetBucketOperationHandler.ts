import { Kvm } from '../../../bundled/nats-bundled';
import { KvmOperationHandler, KvmOperationParams } from '../KvmOperationHandler';
import { IDataObject } from 'n8n-workflow';

export class GetBucketOperationHandler extends KvmOperationHandler {
	readonly operationName = 'get';

	async execute(kvManager: Kvm, params: KvmOperationParams): Promise<IDataObject> {
		const { bucket } = params;

		const kvStore = await kvManager.open(bucket);
		return await kvStore.status();
	}
}
