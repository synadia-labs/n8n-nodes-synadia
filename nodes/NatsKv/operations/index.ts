// Key operation handlers
import { KvOperationHandler } from '../KvOperationHandler';
import { DeleteOperationHandler } from './DeleteOperationHandler';
import { GetOperationHandler } from './GetOperationHandler';
import { ListOperationHandler } from './ListOperationHandler';
import { HistoryOperationHandler } from './HistoryOperationHandler';
import { PutOperationHandler } from './PutOperationHandler';

// Bucket operation handlers
import { KvmOperationHandler } from '../KvmOperationHandler';
import { CreateBucketOperationHandler } from './CreateBucketOperationHandler';
import { DeleteBucketOperationHandler } from './DeleteBucketOperationHandler';
import { GetBucketOperationHandler } from './GetBucketOperationHandler';

// Key operations (for resource: 'key')
export const keyOperationHandlers: Record<string, KvOperationHandler> = {
	delete: new DeleteOperationHandler(),
	get: new GetOperationHandler(),
	history: new HistoryOperationHandler(),
	list: new ListOperationHandler(),
	put: new PutOperationHandler(),
};

// Bucket operations (for resource: 'bucket')
export const bucketOperationHandlers: Record<string, KvmOperationHandler> = {
	create: new CreateBucketOperationHandler(),
	delete: new DeleteBucketOperationHandler(),
	get: new GetBucketOperationHandler(),
};

// Export parameter types
export { KvOperationParams } from '../KvOperationHandler';
export { KvmOperationParams } from '../KvmOperationHandler';
