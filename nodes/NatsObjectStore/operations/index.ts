// Object operation handlers
import { OsOperationHandler } from '../OsOperationHandler';
import { PutObjectOperationHandler } from './PutObjectOperationHandler';
import { GetObjectOperationHandler } from './GetObjectOperationHandler';
import { DeleteObjectOperationHandler } from './DeleteObjectOperationHandler';
import { InfoObjectOperationHandler } from './InfoObjectOperationHandler';
import { ListObjectsOperationHandler } from './ListObjectsOperationHandler';

// Bucket operation handlers
import { OsmOperationHandler } from '../OsmOperationHandler';
import { CreateBucketOperationHandler } from './CreateBucketOperationHandler';
import { DeleteBucketOperationHandler } from './DeleteBucketOperationHandler';
import { GetBucketOperationHandler } from './GetBucketOperationHandler';

// Object operations (for resource: 'object')
export const objectOperationHandlers: Record<string, OsOperationHandler> = {
	put: new PutObjectOperationHandler(),
	get: new GetObjectOperationHandler(),
	delete: new DeleteObjectOperationHandler(),
	info: new InfoObjectOperationHandler(),
	list: new ListObjectsOperationHandler(),
};

// Bucket operations (for resource: 'bucket')
export const bucketOperationHandlers: Record<string, OsmOperationHandler> = {
	create: new CreateBucketOperationHandler(),
	delete: new DeleteBucketOperationHandler(),
	get: new GetBucketOperationHandler(),
};

// Export parameter types
export { OsOperationParams } from '../OsOperationHandler';
export { OsmOperationParams } from '../OsmOperationHandler';
