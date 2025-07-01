import { StreamOperationHandler, StreamOperationParams } from '../StreamOperationHandler';
import { JetStreamManager } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class GetInfoOperationHandler extends StreamOperationHandler {
	readonly operationName = 'get';

	async execute(jsm: JetStreamManager, params: StreamOperationParams): Promise<IDataObject> {
		const { streamName } = params;
		if (!streamName) throw new Error('no stream name provided');

		return await jsm.streams.info(streamName);
	}
}
