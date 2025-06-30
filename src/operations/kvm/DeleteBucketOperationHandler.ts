import { Kvm } from '../../bundled/nats-bundled';
import { KvmOperationHandler, KvmOperationParams } from '../KvmOperationHandler';
import { IDataObject } from 'n8n-workflow';

export class DeleteBucketOperationHandler extends KvmOperationHandler {
	readonly operationName = 'delete';

	async execute(kvManager: Kvm, params: KvmOperationParams): Promise<IDataObject> {
		const { bucket } = params;

		const kvToDelete = await kvManager.open(bucket);
		const deleted = await kvToDelete.destroy();

		return { deleted };
	}
}
