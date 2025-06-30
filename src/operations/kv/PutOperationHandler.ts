import { KV } from '../../bundled/nats-bundled';
import { KvOperationHandler, KvOperationParams } from '../KvOperationHandler';
import { IDataObject } from 'n8n-workflow';

export class PutOperationHandler extends KvOperationHandler {
	readonly operationName = 'put';

	async execute(kv: KV, params: KvOperationParams): Promise<IDataObject> {
		const { key, value } = params;

		// -- make sure value is set
		if (!value) throw new Error('value is not provided');

		const revision = await kv.put(key, value!);

		return {
			revision,
		};
	}
}
