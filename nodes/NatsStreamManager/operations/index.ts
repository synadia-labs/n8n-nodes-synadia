import { StreamOperationHandler } from '../StreamOperationHandler';
import { CreateStreamOperationHandler } from './CreateStreamOperationHandler';
import { UpdateStreamOperationHandler } from './UpdateStreamOperationHandler';
import { DeleteStreamOperationHandler } from './DeleteStreamOperationHandler';
import { GetInfoOperationHandler } from './GetInfoOperationHandler';
import { ListStreamsOperationHandler } from './ListStreamsOperationHandler';
import { PurgeStreamOperationHandler } from './PurgeStreamOperationHandler';

export const streamOperationHandlers: Record<string, StreamOperationHandler> = {
	create: new CreateStreamOperationHandler(),
	update: new UpdateStreamOperationHandler(),
	delete: new DeleteStreamOperationHandler(),
	get: new GetInfoOperationHandler(),
	list: new ListStreamsOperationHandler(),
	purge: new PurgeStreamOperationHandler(),
};

export { StreamOperationParams } from '../StreamOperationHandler';
