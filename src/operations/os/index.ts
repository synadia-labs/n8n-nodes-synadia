import { OsOperationHandler } from '../OsOperationHandler';
import { PutObjectOperationHandler } from './PutObjectOperationHandler';
import { GetObjectOperationHandler } from './GetObjectOperationHandler';
import { DeleteObjectOperationHandler } from './DeleteObjectOperationHandler';
import { InfoObjectOperationHandler } from './InfoObjectOperationHandler';
import { ListObjectsOperationHandler } from './ListObjectsOperationHandler';

export const osOperationHandlers: Record<string, OsOperationHandler> = {
	put: new PutObjectOperationHandler(),
	get: new GetObjectOperationHandler(),
	delete: new DeleteObjectOperationHandler(),
	info: new InfoObjectOperationHandler(),
	list: new ListObjectsOperationHandler(),
};

export { OsOperationParams } from '../OsOperationHandler';
