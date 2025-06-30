import {OsOperationHandler, OsOperationParams} from '../OsOperationHandler';
import {ObjectStore} from '../../bundled/nats-bundled';
import {IDataObject} from "n8n-workflow";

export class GetObjectOperationHandler extends OsOperationHandler {
	readonly operationName = 'get';
	
	async execute(os: ObjectStore, params: OsOperationParams): Promise<IDataObject> {
		const {name} = params
		
		try {
			// Use getBlob for simplified binary data retrieval
			const data = await os.getBlob(name!);

			return {
				found: true,
				data
			}
		} catch (error: any) {
			// Handle object not found
			if (error.message && error.message.includes('not found')) {
				return {found: false}
			}
			throw error;
		}
	}
}