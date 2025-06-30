import { Kvm, KvOptions } from '../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export interface KvmOperationParams {
	bucket: string;
	kvConfig?: KvOptions;
}

export abstract class KvmOperationHandler {
	abstract readonly operationName: string;

	abstract execute(kvManager: Kvm, params: KvmOperationParams): Promise<IDataObject>;
}
