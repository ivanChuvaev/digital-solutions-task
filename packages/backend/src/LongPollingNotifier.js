export class LongPollingNotifier {
    _subscribers

    constructor() {
        this._subscribers = new Map()
        this.subscribe = this.subscribe.bind(this)
        this.unsubscribe = this.unsubscribe.bind(this)
        this.notify = this.notify.bind(this)
    }

    subscribe(id, handler) {
        const subscriber = this._subscribers.get(id)

        if (subscriber) {
            clearTimeout(subscriber.timeoutId)
            if (subscriber.actions.length > 0) {
                handler(subscriber.actions)
            }
        }

        this._subscribers.set(id, {
            id,
            handler,
            timeoutId: null,
            actions: [],
        })
    }

    unsubscribe(id) {
        const subscriber = this._subscribers.get(id)

        if (!subscriber || !subscriber.handler) return

        this._subscribers.set(id, {
            ...subscriber,
            handler: null,
            timeoutId: setTimeout(() => {
                this._subscribers.delete(id)
            }, 5000),
        })
    }

    notify(id, actions) {
        for (const subscriber of this._subscribers.values()) {
            if (subscriber.id === id) continue

            if (subscriber.handler) {
                subscriber.handler(actions)
            } else {
                subscriber.actions.push(...actions)
            }
        }
    }
}
