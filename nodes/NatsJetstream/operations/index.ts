// Stream operation handlers
import { StreamOperationHandler } from '../StreamOperationHandler';
import { CreateStreamOperationHandler } from './CreateStreamOperationHandler';
import { UpdateStreamOperationHandler } from './UpdateStreamOperationHandler';
import { DeleteStreamOperationHandler } from './DeleteStreamOperationHandler';
import { GetInfoOperationHandler as GetStreamInfoOperationHandler } from './GetStreamInfoOperationHandler';
import { ListStreamsOperationHandler } from './ListStreamsOperationHandler';
import { PurgeStreamOperationHandler } from './PurgeStreamOperationHandler';

// Consumer operation handlers
import { ConsumerOperationHandler } from '../ConsumerOperationHandler';
import { CreateConsumerOperationHandler } from './CreateConsumerOperationHandler';
import { DeleteConsumerOperationHandler } from './DeleteConsumerOperationHandler';
import { GetInfoOperationHandler as GetConsumerInfoOperationHandler } from './GetConsumerInfoOperationHandler';
import { ListConsumersOperationHandler } from './ListConsumersOperationHandler';

// Message operation handlers
import {
	MessageOperationHandler,
	PublishMessageOperationHandler,
} from '../MessageOperationHandler';

export const streamOperationHandlers: Record<string, StreamOperationHandler> = {
	create: new CreateStreamOperationHandler(),
	update: new UpdateStreamOperationHandler(),
	delete: new DeleteStreamOperationHandler(),
	get: new GetStreamInfoOperationHandler(),
	list: new ListStreamsOperationHandler(),
	purge: new PurgeStreamOperationHandler(),
};

export const consumerOperationHandlers: Record<string, ConsumerOperationHandler> = {
	create: new CreateConsumerOperationHandler(),
	delete: new DeleteConsumerOperationHandler(),
	get: new GetConsumerInfoOperationHandler(),
	list: new ListConsumersOperationHandler(),
};

export const messageOperationHandlers: Record<string, MessageOperationHandler> = {
	publish: new PublishMessageOperationHandler(),
};

export { StreamOperationParams } from '../StreamOperationHandler';
export { ConsumerOperationParams } from '../ConsumerOperationHandler';
export { MessageOperationParams } from '../MessageOperationHandler';
