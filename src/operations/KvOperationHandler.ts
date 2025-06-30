import {KV} from "../bundled/nats-bundled";
import {IDataObject} from "n8n-workflow";

export interface KvOperationParams {
	key: string;
	value?: string;
}

export abstract class KvOperationHandler {
	abstract readonly operationName: string;
	
	abstract execute(
		kv: KV,
		params: KvOperationParams
	): Promise<IDataObject>;
}