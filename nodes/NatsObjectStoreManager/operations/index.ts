import { OsmOperationHandler } from '../OsmOperationHandler';
import { CreateBucketOperationHandler } from './CreateBucketOperationHandler';
import { DeleteBucketOperationHandler } from './DeleteBucketOperationHandler';
import { GetBucketOperationHandler } from './GetBucketOperationHandler';

export const osmOperationHandlers: Record<string, OsmOperationHandler> = {
	create: new CreateBucketOperationHandler(),
	delete: new DeleteBucketOperationHandler(),
	get: new GetBucketOperationHandler(),
};

export { OsmOperationParams } from '../OsmOperationHandler';
