import { OsmOperationHandler, OsmOperationParams } from '../OsmOperationHandler';
import { Objm } from '../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class GetBucketOperationHandler extends OsmOperationHandler {
	readonly operationName = 'status';

	async execute(osm: Objm, params: OsmOperationParams): Promise<IDataObject> {
		const { bucket } = params;
		const os = await osm.open(bucket);
		return await os.status();
	}
}
