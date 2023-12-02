export type Listener = (event: { eventName: string; data: any }) => void;

export interface BaseNofier<T extends string = string> {
  addListener: (eventName: T, data: Listener) => number;
  removeListener: (id: number) => boolean;
}

export interface NotifierMembers<T extends string = string>
  extends BaseNofier<T> {
  clearify: (eventName: T) => void;
  trigger: (event: T) => void;
}
export default class Notifier<T extends string = string>
  implements NotifierMembers<T>
{
  private listenerIds: number = 0;
  private eventIds: number = 0;
  private events: Map<number, string> = new Map();
  private listeners: Map<number, [number, Listener][]> = new Map();

  // 32bit id -> first 16bit is listener id and last 16bit is event id
  private consumeListenerId() {
    return this.listenerIds++;
  }

  private consumeEventId() {
    return this.eventIds++;
  }

  addListener(eventName: T, listener: Listener): number {
    eventName = eventName.trim() as T;
    const entery = this.findEventEntry(eventName);
    let listenerId: number, eventId: number;

    if (entery) {
      eventId = entery[0];
      listenerId = this.consumeListenerId();
      const _listener = this.listeners.get(eventId)!;
      _listener.push([listenerId, listener]);
    } else {
      eventId = this.consumeEventId();
      listenerId = this.consumeListenerId();

      this.events.set(eventId, eventName);
      this.listeners.set(eventId, [[listenerId, listener]]);
    }
    const ei = eventId << 16;
    listenerId = ei | listenerId;
    return listenerId;
  }
  isListening(): boolean {
    return this.listeners.size > 0;
  }
  removeListener = (id: number) => {
    const eventId = id >> 16;
    const listenerId = (id << 16) >> 16;
    const listeners = this.listeners.get(eventId);
    if (!listeners) {
      return false;
    }

    const index = listeners.findIndex((l) => l[0] === listenerId);
    listeners.splice(index, 1);

    if (listeners.length === 0) {
      this.listeners.delete(eventId);
      this.events.delete(eventId);
    }

    return true;
  };

  protected findEventEntry(eventName: string) {
    return Array.from(this.events.entries()).find((e) => e[1] === eventName);
  }

  clearify(eventName: string) {
    eventName = eventName.trim();
    const entry = this.findEventEntry(eventName);
    if (!entry) {
      return false;
    }
    this.events.delete(entry[0]);
    this.listeners.delete(entry[0]);
    return true;
  }
  trigger(eventName: T, data?: any): void {
    eventName = eventName.trim() as T;
    const x = this.findEventEntry(eventName);
    if (!x) {
      return;
    }
    const listeners = this.listeners.get(x[0])!;
    listeners.forEach((listener) => {
      listener[1]({ eventName: eventName as string, data });
    });
  }
}
