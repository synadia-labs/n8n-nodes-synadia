import { StreamOperationHandler, StreamOperationParams } from '../StreamOperationHandler';
import { JetStreamManager } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class CreateStreamOperationHandler extends StreamOperationHandler {
	readonly operationName = 'create';

	async execute(jsm: JetStreamManager, params: StreamOperationParams): Promise<IDataObject> {
		const { streamConfig } = params;

		if (!streamConfig) throw new Error('no config provided');

		// Transform flattened placement fields into nested placement object
		const config = streamConfig as any;
		const transformedConfig = { ...config };

		if (config.placement_cluster || config.placement_tags) {
			transformedConfig.placement = {} as any;

			if (config.placement_cluster) {
				transformedConfig.placement.cluster = config.placement_cluster;
				delete transformedConfig.placement_cluster;
			}

			if (config.placement_tags) {
				transformedConfig.placement.tags = Array.isArray(config.placement_tags)
					? config.placement_tags
					: [config.placement_tags];
				delete transformedConfig.placement_tags;
			}
		}

		return await jsm.streams.add(transformedConfig);
	}
}
