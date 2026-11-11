// Bus d'événements : permet aux systèmes de communiquer sans se connaître.
// ex : events.on('room:enter', ({room}) => ...) ; events.emit('room:enter', {room})

export class EventBus {
  constructor() {
    this._handlers = new Map();
  }

  /** Abonne `fn` à `event`. Renvoie une fonction de désabonnement. */
  on(event, fn) {
    if (!this._handlers.has(event)) this._handlers.set(event, new Set());
    this._handlers.get(event).add(fn);
    return () => this.off(event, fn);
  }

  once(event, fn) {
    const off = this.on(event, (payload) => {
      off();
      fn(payload);
    });
    return off;
  }

  off(event, fn) {
    this._handlers.get(event)?.delete(fn);
  }

  emit(event, payload) {
    const set = this._handlers.get(event);
    if (!set) return;
    for (const fn of [...set]) fn(payload);
  }

  clear() {
    this._handlers.clear();
  }
}
