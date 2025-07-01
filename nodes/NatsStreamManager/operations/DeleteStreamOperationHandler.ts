import { StreamOperationHandler, StreamOperationParams } from '../StreamOperationHandler';
import { JetStreamManager } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class DeleteStreamOperationHandler extends StreamOperationHandler {
	readonly operationName = 'delete';

	async execute(jsm: JetStreamManager, params: StreamOperationParams): Promise<IDataObject> {
		const { streamName } = params;
		if (!streamName) throw new Error('no stream name provided');

		const deleted = await jsm.streams.delete(streamName);

		return { deleted };
	}
}
