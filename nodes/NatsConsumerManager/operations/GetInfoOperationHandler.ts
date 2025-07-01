import { ConsumerOperationHandler, ConsumerOperationParams } from '../ConsumerOperationHandler';
import { JetStreamManager } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class GetInfoOperationHandler extends ConsumerOperationHandler {
	readonly operationName = 'get';

	async execute(jsm: JetStreamManager, params: ConsumerOperationParams): Promise<IDataObject> {
		const { streamName, consumerName } = params;

		if (!consumerName) throw new Error('No consumer name provided');

		return await jsm.consumers.info(streamName, consumerName);
	}
}
