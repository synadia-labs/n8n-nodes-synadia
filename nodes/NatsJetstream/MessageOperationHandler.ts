import { JetStreamClient, JetStreamPublishOptions } from '../../bundled/nats-bundled';

export interface MessageOperationParams {
	subject: string;
	data: string;
	headers?: any;
	options?: {
		msgId?: string;
		lastMsgId?: string;
		lastSequence?: number;
		expectedStream?: string;
	};
}

export interface MessageOperationHandler {
	execute(js: JetStreamClient, params: MessageOperationParams): Promise<any>;
}

export class PublishMessageOperationHandler implements MessageOperationHandler {
	async execute(js: JetStreamClient, params: MessageOperationParams): Promise<any> {
		const { subject, data, headers, options = {} } = params;

		const publishOptions: Partial<JetStreamPublishOptions> = {};

		if (headers) {
			publishOptions.headers = headers;
		}

		if (options.msgId) {
			publishOptions.msgID = options.msgId;
		}

		if (options.lastMsgId) {
			publishOptions.expect = {
				lastMsgID: options.lastMsgId,
			};
		}

		if (options.lastSequence) {
			if (!publishOptions.expect) {
				publishOptions.expect = {};
			}
			publishOptions.expect.lastSequence = options.lastSequence;
		}

		if (options.expectedStream) {
			if (!publishOptions.expect) {
				publishOptions.expect = {};
			}
			publishOptions.expect.streamName = options.expectedStream;
		}

		const ack = await js.publish(subject, data, publishOptions);

		return {
			success: true,
			stream: ack.stream,
			seq: ack.seq,
			duplicate: ack.duplicate,
			domain: ack.domain,
			timestamp: new Date().toISOString(),
		};
	}
}
