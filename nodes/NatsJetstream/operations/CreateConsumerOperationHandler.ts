import { ConsumerOperationHandler, ConsumerOperationParams } from '../ConsumerOperationHandler';
import { JetStreamManager } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class CreateConsumerOperationHandler extends ConsumerOperationHandler {
	readonly operationName = 'create';

	async execute(jsm: JetStreamManager, params: ConsumerOperationParams): Promise<IDataObject> {
		const { streamName, consumerConfig } = params;

		if (!consumerConfig) throw new Error('No consumerConfig provided');

		return await jsm.consumers.add(streamName, consumerConfig);
	}
}
