import { KV } from '../../bundled/nats-bundled';
import { KvOperationHandler, KvOperationParams } from '../KvOperationHandler';
import { IDataObject } from 'n8n-workflow';

export class GetOperationHandler extends KvOperationHandler {
	readonly operationName = 'get';

	async execute(kv: KV, params: KvOperationParams): Promise<IDataObject> {
		const { key } = params;

		const entry = await kv.get(key!);
		if (!entry) return { found: false };

		return {
			found: true,
			entry,
		};
	}
}
