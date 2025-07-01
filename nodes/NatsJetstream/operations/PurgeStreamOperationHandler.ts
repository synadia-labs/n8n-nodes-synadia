import { StreamOperationHandler, StreamOperationParams } from '../StreamOperationHandler';
import { JetStreamManager } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class PurgeStreamOperationHandler extends StreamOperationHandler {
	readonly operationName = 'purge';

	async execute(jsm: JetStreamManager, params: StreamOperationParams): Promise<IDataObject> {
		const { streamName } = params;
		if (!streamName) throw new Error('no stream name provided');

		return await jsm.streams.purge(streamName);
	}
}
