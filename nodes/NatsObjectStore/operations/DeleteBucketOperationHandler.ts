import { OsmOperationHandler, OsmOperationParams } from '../OsmOperationHandler';
import { Objm } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class DeleteBucketOperationHandler extends OsmOperationHandler {
	readonly operationName = 'deleteBucket';

	async execute(osm: Objm, params: OsmOperationParams): Promise<IDataObject> {
		const { bucket } = params;

		const objectStore = await osm.open(bucket);
		const success = await objectStore.destroy();

		return {
			success: success,
		};
	}
}
