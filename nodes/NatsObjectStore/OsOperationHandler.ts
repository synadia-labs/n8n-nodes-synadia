import { ObjectStore } from '../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export interface OsOperationParams {
	name: string;
	data?: Uint8Array;
}

export abstract class OsOperationHandler {
	abstract readonly operationName: string;

	abstract execute(os: ObjectStore, params: OsOperationParams): Promise<IDataObject>;
}
