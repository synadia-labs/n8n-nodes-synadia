import { JetStreamManager, ConsumerConfig } from '../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export interface ConsumerOperationParams {
	streamName: string;
	consumerName?: string;
	consumerConfig?: ConsumerConfig;
}

export abstract class ConsumerOperationHandler {
	abstract readonly operationName: string;

	abstract execute(jsm: JetStreamManager, params: ConsumerOperationParams): Promise<IDataObject>;
}
