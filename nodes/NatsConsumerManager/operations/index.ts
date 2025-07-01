import { ConsumerOperationHandler } from '../ConsumerOperationHandler';
import { CreateConsumerOperationHandler } from './CreateConsumerOperationHandler';
import { DeleteConsumerOperationHandler } from './DeleteConsumerOperationHandler';
import { GetInfoOperationHandler } from './GetInfoOperationHandler';
import { ListConsumersOperationHandler } from './ListConsumersOperationHandler';

export const consumerOperationHandlers: Record<string, ConsumerOperationHandler> = {
	create: new CreateConsumerOperationHandler(),
	delete: new DeleteConsumerOperationHandler(),
	get: new GetInfoOperationHandler(),
	list: new ListConsumersOperationHandler(),
};

export { ConsumerOperationParams } from '../ConsumerOperationHandler';
