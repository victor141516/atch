export type EventType = string | symbol;

// An event handler can take an optional event argument
// and should not return a value
export type Handler<T = unknown> = (event: T) => void;
export type WildcardHandler<T = Record<string, unknown>> = (
	type: keyof T,
	event: T[keyof T]
) => void;

// An array of all currently registered event handlers for a type
export type EventHandlerList<T = unknown> = Array<Handler<T>>;
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<
	WildcardHandler<T>
>;

// A map of event types and their corresponding event handlers.
export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
	keyof Events | '*',
	EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>;

export interface Emitter<Events extends Record<EventType, unknown>> {
	all: EventHandlerMap<Events>;

	on<Key extends keyof Events>(
		type: Key,
		handler: Handler<Events[Key]>
	): () => void;
	on(type: '*', handler: WildcardHandler<Events>): () => void;

	once<Key extends keyof Events>(
		type: Key,
		handler: Handler<Events[Key]>
	): () => void;
	once(type: '*', handler: WildcardHandler<Events>): () => void;

	waitFor<Key extends keyof Events>(type: Key): Promise<Events[Key]>;
	waitFor(type: '*'): Promise<Events[any]>;

	off<Key extends keyof Events>(
		type: Key,
		handler?: Handler<Events[Key]>
	): void;
	off(type: '*', handler: WildcardHandler<Events>): void;

	emit<Key extends keyof Events>(type: Key, event: Events[Key]): void;
	emit<Key extends keyof Events>(
		type: undefined extends Events[Key] ? Key : never
	): void;
}

/**
 * Atch: Tiny (~200b) functional event emitter / pubsub.
 * @name atch
 * @returns {Atch}
 */
export default function atch<Events extends Record<EventType, unknown>>(
	all?: EventHandlerMap<Events>
): Emitter<Events> {
	type GenericEventHandler =
		| Handler<Events[keyof Events]>
		| WildcardHandler<Events>;
	all = all || new Map();

	const instance = {
		/**
		 * A Map of event names to registered handler functions.
		 */
		all,

		/**
		 * Register an event handler for the given type.
		 * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
		 * @param {Function} handler Function to call in response to given event
		 * @returns {Function} De-register function which will undo the event registration
		 * @memberOf atch
		 */
		on<Key extends keyof Events>(type: Key, handler: GenericEventHandler) {
			const handlers: Array<GenericEventHandler> | undefined = all.get(type);
			if (handlers) {
				handlers.push(handler);
			} else {
				all.set(type, [handler] as EventHandlerList<Events[keyof Events]>);
			}
			return () => instance.off(type, handler);
		},

		/**
		 * Register an event handler for the given type that will only be called once.
		 * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
		 * @param {Function} handler Function to call in response to given event
		 * @returns {Function} De-register function which will undo the event registration
		 * @memberOf atch
		 */
		once<Key extends keyof Events>(type: Key, handler: GenericEventHandler) {
			const onceHandler: GenericEventHandler = (arg0, arg1) => {
				instance.off(type, onceHandler);
				return handler(arg0 as keyof Events & Events[keyof Events], arg1);
			};
			return instance.on(type, onceHandler);
		},

		/**
		 * Wait for the next event of type to be emitted.
		 * @param {string|symbol} type Type of event to wait for
		 * @returns {Promise<Any>} Promise that will resolve when the event is emitted
		 * @memberOf atch
		 */
		waitFor<Key extends keyof Events>(type: Key) {
			return new Promise<Events[Key]>((resolve) => {
				instance.once(type, (e: any) => resolve(e));
			});
		},

		/**
		 * Remove an event handler for the given type.
		 * If `handler` is omitted, all handlers of the given type are removed.
		 * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
		 * @param {Function} [handler] Handler function to remove
		 * @memberOf atch
		 */
		off<Key extends keyof Events>(type: Key, handler?: GenericEventHandler) {
			const handlers: Array<GenericEventHandler> | undefined = all.get(type);
			if (handlers) {
				if (handler) {
					handlers.splice(handlers.indexOf(handler) >>> 0, 1);
				} else {
					all.set(type, []);
				}
			}
		},

		/**
		 * Invoke all handlers for the given type.
		 * If present, `'*'` handlers are invoked after type-matched handlers.
		 *
		 * Note: Manually firing '*' handlers is not supported.
		 *
		 * @param {string|symbol} type The event type to invoke
		 * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
		 * @memberOf atch
		 */
		emit<Key extends keyof Events>(type: Key, evt?: Events[Key]) {
			let handlers = all.get(type);
			if (handlers) {
				(handlers as EventHandlerList<Events[keyof Events]>)
					.slice()
					.map((handler) => {
						handler(evt!);
					});
			}

			handlers = all.get('*');
			if (handlers) {
				(handlers as WildCardEventHandlerList<Events>)
					.slice()
					.map((handler) => {
						handler(type, evt!);
					});
			}
		}
	};

	return instance;
}
