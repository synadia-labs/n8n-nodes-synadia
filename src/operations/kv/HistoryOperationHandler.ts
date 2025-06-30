import {KV, KvWatchEntry} from '../../bundled/nats-bundled';
import {KvOperationHandler, KvOperationParams} from "../KvOperationHandler";
import {IDataObject} from "n8n-workflow";

export class HistoryOperationHandler extends KvOperationHandler {
	readonly operationName = 'history';

	async execute(kv: KV, params: KvOperationParams): Promise<IDataObject> {
		const { key } = params;

		// -- make sure key and value are set
		if (!key) throw new Error("key is not provided");

		const entries: KvWatchEntry[] = [];
		const iter = await kv.history({key});
		for await (const entry of iter) {
			entries.push(entry);
		}

		return {
			entries,
			count: entries.length,
		}
	}
}