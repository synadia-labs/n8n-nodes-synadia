import { KvOperationHandler } from '../KvOperationHandler';
import { DeleteOperationHandler } from './DeleteOperationHandler';
import { GetOperationHandler } from './GetOperationHandler';
import { ListOperationHandler } from './ListOperationHandler';
import { HistoryOperationHandler } from './HistoryOperationHandler';
import { PutOperationHandler } from './PutOperationHandler';

export const kvOperationHandlers: Record<string, KvOperationHandler> = {
	delete: new DeleteOperationHandler(),
	get: new GetOperationHandler(),
	history: new HistoryOperationHandler(),
	list: new ListOperationHandler(),
	put: new PutOperationHandler(),
};

export { KvOperationParams } from '../KvOperationHandler';
