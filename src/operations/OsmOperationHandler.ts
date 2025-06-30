import { Objm, ObjectStoreOptions } from '../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export interface OsmOperationParams {
	bucket: string;
	objConfig: ObjectStoreOptions;
}

export abstract class OsmOperationHandler {
	abstract readonly operationName: string;

	abstract execute(osm: Objm, params: OsmOperationParams): Promise<IDataObject>;
}
