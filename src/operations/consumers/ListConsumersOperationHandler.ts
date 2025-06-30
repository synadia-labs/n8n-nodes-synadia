import { ConsumerOperationHandler, ConsumerOperationParams } from '../ConsumerOperationHandler';
import {JetStreamManager}  from '../../bundled/nats-bundled';
import {IDataObject} from "n8n-workflow";

export class ListConsumersOperationHandler extends ConsumerOperationHandler {
	readonly operationName = 'list';

	async execute(jsm: JetStreamManager, params: ConsumerOperationParams): Promise<IDataObject> {
		const { streamName } = params;
		
		const consumers = [];
		for await (const consumer of jsm.consumers.list(streamName)) {
			consumers.push(consumer);
		}
		
		return {
			consumers,
			count: consumers.length,
		}
	}
}