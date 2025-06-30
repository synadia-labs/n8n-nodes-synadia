import {
	OsOperationHandler,
	OsOperationParams,
} from '../OsOperationHandler';
import {ObjectStore} from '../../bundled/nats-bundled';
import {IDataObject} from "n8n-workflow";

export class DeleteObjectOperationHandler extends OsOperationHandler {
	readonly operationName = 'delete';
	
	async execute(os: ObjectStore, params: OsOperationParams): Promise<IDataObject> {
		const {name} = params;

		const deleted = await os.delete(name);
		
		return {
			 deleted,
		}
	}
}