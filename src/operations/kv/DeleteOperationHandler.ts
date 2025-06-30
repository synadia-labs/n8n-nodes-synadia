import { KV } from '../../bundled/nats-bundled';
import { KvOperationHandler, KvOperationParams } from '../KvOperationHandler';
import { IDataObject } from 'n8n-workflow';

export class DeleteOperationHandler extends KvOperationHandler {
	readonly operationName = 'delete';

	async execute(kv: KV, params: KvOperationParams): Promise<IDataObject> {
		const { key } = params;

		await kv.delete(key);

		return {
			deleted: true,
		};
	}
}
