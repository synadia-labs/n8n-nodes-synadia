import { OsOperationHandler, OsOperationParams } from '../OsOperationHandler';
import { ObjectStore, ObjectStoreMeta } from '../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class PutObjectOperationHandler extends OsOperationHandler {
	readonly operationName = 'put';

	async execute(os: ObjectStore, params: OsOperationParams): Promise<IDataObject> {
		const { name, data } = params;

		if (!data) throw new Error('no data provided');

		// Prepare metadata for putBlob
		const meta: ObjectStoreMeta = {
			name: name!,
		};

		// Use putBlob for simplified object storage
		return await os.putBlob(meta, data!);
	}
}
