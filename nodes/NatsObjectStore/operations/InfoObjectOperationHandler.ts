import { OsOperationHandler, OsOperationParams } from '../OsOperationHandler';
import { ObjectStore } from '../../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export class InfoObjectOperationHandler extends OsOperationHandler {
	readonly operationName = 'info';

	async execute(os: ObjectStore, params: OsOperationParams): Promise<IDataObject> {
		const { name } = params;

		const info = await os.info(name);
		if (!info) return { found: false };

		return {
			found: true,
			info,
		};
	}
}
