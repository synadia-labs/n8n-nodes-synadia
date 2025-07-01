import { StreamOperationHandler, StreamOperationParams } from '../StreamOperationHandler';
import { JetStreamManager } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class CreateStreamOperationHandler extends StreamOperationHandler {
	readonly operationName = 'create';

	async execute(jsm: JetStreamManager, params: StreamOperationParams): Promise<IDataObject> {
		const { streamConfig } = params;

		if (!streamConfig) throw new Error('no config provided');

		return await jsm.streams.add(streamConfig);
	}
}
