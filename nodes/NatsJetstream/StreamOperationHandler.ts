import { JetStreamManager, StreamConfig } from '../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export interface StreamOperationParams {
	streamName?: string;
	subject?: string;
	streamConfig?: StreamConfig;
}

export abstract class StreamOperationHandler {
	abstract readonly operationName: string;

	abstract execute(jsm: JetStreamManager, params: StreamOperationParams): Promise<IDataObject>;
}
