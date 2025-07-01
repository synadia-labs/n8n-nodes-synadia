import { StreamOperationHandler, StreamOperationParams } from '../StreamOperationHandler';
import { JetStreamManager } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class UpdateStreamOperationHandler extends StreamOperationHandler {
	readonly operationName = 'update';

	async execute(jsm: JetStreamManager, params: StreamOperationParams): Promise<IDataObject> {
		const { streamName, streamConfig } = params;
		if (!streamName) throw new Error('no stream name provided');
		if (!streamConfig) throw new Error('no config provided');

		return await jsm.streams.update(streamName!, streamConfig!);
	}
}
