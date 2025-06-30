import { ObjectStoreOperationHandler } from '../ObjectStoreOperationHandler';
import { CreateBucketOperationHandler } from './CreateBucketOperationHandler';
import { DeleteBucketOperationHandler } from './DeleteBucketOperationHandler';
import { PutObjectOperationHandler } from './PutObjectOperationHandler';
import { GetObjectOperationHandler } from './GetObjectOperationHandler';
import { DeleteObjectOperationHandler } from './DeleteObjectOperationHandler';
import { InfoObjectOperationHandler } from './InfoObjectOperationHandler';
import { ListObjectsOperationHandler } from './ListObjectsOperationHandler';
import { StatusOperationHandler } from './StatusOperationHandler';

export const objectStoreOperationHandlers: Record<string, ObjectStoreOperationHandler> = {
	createBucket: new CreateBucketOperationHandler(),
	deleteBucket: new DeleteBucketOperationHandler(),
	put: new PutObjectOperationHandler(),
	get: new GetObjectOperationHandler(),
	delete: new DeleteObjectOperationHandler(),
	info: new InfoObjectOperationHandler(),
	list: new ListObjectsOperationHandler(),
	status: new StatusOperationHandler(),
};

export { ObjectStoreOperationParams } from '../ObjectStoreOperationHandler';