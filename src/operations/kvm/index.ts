import { KvmOperationHandler } from '../KvmOperationHandler';
import { CreateBucketOperationHandler } from './CreateBucketOperationHandler';
import { DeleteBucketOperationHandler } from './DeleteBucketOperationHandler';
import { GetBucketOperationHandler } from './GetBucketOperationHandler';

export const kvmOperationHandlers: Record<string, KvmOperationHandler> = {
	create: new CreateBucketOperationHandler(),
	delete: new DeleteBucketOperationHandler(),
	get: new GetBucketOperationHandler(),
};

export { KvOperationParams } from '../KvOperationHandler';