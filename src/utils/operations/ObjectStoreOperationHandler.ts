import { INodeExecutionData } from 'n8n-workflow';

export interface ObjectStoreOperationParams {
	bucket: string;
	options: any;
	itemIndex: number;
	name?: string;
	data?: string;
	sourceBucket?: string;
	sourceName?: string;
}

export interface ObjectStoreOperationResult {
	[key: string]: any;
}

export abstract class ObjectStoreOperationHandler {
	abstract readonly operationName: string;
	
	abstract execute(
		osOrNc: any, // ObjectStore or NatsConnection depending on operation
		params: ObjectStoreOperationParams
	): Promise<ObjectStoreOperationResult>;
	
	protected createResult(data: any, params: ObjectStoreOperationParams): ObjectStoreOperationResult {
		return {
			operation: this.operationName,
			bucket: params.bucket,
			...data,
		};
	}
}