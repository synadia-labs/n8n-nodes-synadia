import { Objm } from '../../bundled/nats-bundled';
import { OsmOperationHandler, OsmOperationParams } from '../OsmOperationHandler';
import { IDataObject } from 'n8n-workflow';

export class CreateBucketOperationHandler extends OsmOperationHandler {
	readonly operationName = 'createBucket';

	async execute(osm: Objm, params: OsmOperationParams): Promise<IDataObject> {
		const { bucket, objConfig } = params;
		const os = await osm.create(bucket, objConfig);
		return await os.status();
	}
}
