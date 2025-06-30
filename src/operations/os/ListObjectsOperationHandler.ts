import {OsOperationHandler, OsOperationParams} from '../OsOperationHandler';
import {ObjectStore} from '../../bundled/nats-bundled';
import {IDataObject} from "n8n-workflow";

export class ListObjectsOperationHandler extends OsOperationHandler {
	readonly operationName = 'list';
	
	async execute(os: ObjectStore, _: OsOperationParams): Promise<IDataObject> {
		const objects: any[] = [];
		const list = await os.list();
		
		for await (const info of list) {
			objects.push(info);
		}
		
		return {
			objects,
			count: objects.length,
		}
	}
}