import {ConsumerOperationHandler, ConsumerOperationParams} from '../ConsumerOperationHandler';
import {JetStreamManager} from '../../bundled/nats-bundled';
import {IDataObject} from "n8n-workflow";

export class DeleteConsumerOperationHandler extends ConsumerOperationHandler {
	readonly operationName = 'delete';

	async execute(jsm: JetStreamManager, params: ConsumerOperationParams): Promise<IDataObject> {
		const { streamName, consumerName } = params;

		if (!consumerName) throw new Error('No consumer name provided');
		
		const deleted = await jsm.consumers.delete(streamName, consumerName);
		
		return {
			deleted,
		}
	}
}