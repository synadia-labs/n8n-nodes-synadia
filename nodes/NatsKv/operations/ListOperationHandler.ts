import { KV } from '../../../bundled/nats-bundled';
import { KvOperationHandler, KvOperationParams } from '../KvOperationHandler';
import { IDataObject } from 'n8n-workflow';

export class ListOperationHandler extends KvOperationHandler {
	readonly operationName = 'list';

	async execute(kv: KV, params: KvOperationParams): Promise<IDataObject> {
		const { key } = params;

		if (!key) throw new Error('key pattern is not provided');

		const keys: string[] = [];
		const iter = await kv.keys(key);
		for await (const k of iter) {
			keys.push(k);
		}

		return {
			keys,
			count: keys.length,
		};
	}
}
