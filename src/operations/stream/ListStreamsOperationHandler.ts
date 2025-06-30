import { StreamOperationHandler, StreamOperationParams } from '../StreamOperationHandler';
import { JetStreamManager } from '../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class ListStreamsOperationHandler extends StreamOperationHandler {
	readonly operationName = 'list';

	async execute(jsm: JetStreamManager, params: StreamOperationParams): Promise<IDataObject> {
		const { subject } = params;

		const streams = [];
		for await (const stream of jsm.streams.list(subject)) {
			streams.push(stream);
		}

		return {
			streams,
			count: streams.length,
		};
	}
}
