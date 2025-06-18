import { ObjectStoreOperationHandler, ObjectStoreOperationParams, ObjectStoreOperationResult } from '../ObjectStoreOperationHandler';
import { ObjectStore, Objm, jetstream, NatsConnection } from '../../../bundled/nats-bundled';
import { ApplicationError } from 'n8n-workflow';

interface LinkOperationContext {
	os: ObjectStore;
	nc: NatsConnection;
}

export class LinkObjectOperationHandler extends ObjectStoreOperationHandler {
	readonly operationName = 'link';
	
	async execute(context: LinkOperationContext | ObjectStore, params: ObjectStoreOperationParams): Promise<ObjectStoreOperationResult> {
		if (!params.name || !params.sourceBucket || !params.sourceName) {
			throw new ApplicationError('Name, sourceBucket, and sourceName are required for link operation', {
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
			});
		}
		
		// Check if we have the full context with NatsConnection
		if (!('nc' in context)) {
			throw new ApplicationError('Link operation requires NatsConnection context', {
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
			});
		}
		
		const { os, nc } = context;
		const js = jetstream(nc);
		
		// Get source object info from source bucket
		const sourceObjManager = new Objm(js);
		const sourceOs = await sourceObjManager.open(params.sourceBucket);
		const sourceInfo = await sourceOs.info(params.sourceName);
		
		if (!sourceInfo) {
			throw new ApplicationError(`Source object "${params.sourceName}" not found in bucket "${params.sourceBucket}"`, {
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
			});
		}
		
		const info = await os.link(params.name, sourceInfo);
		
		return this.createResult({
			name: params.name,
			success: true,
			linkSource: `${params.sourceBucket}/${params.sourceName}`,
			info: {
				name: info.name,
				size: info.size,
				chunks: info.chunks,
				digest: info.digest,
				mtime: info.mtime,
			},
		}, params);
	}
}