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
  private consumeListenerId(eventId: number) {
    const ei = eventId << 16;
    let id = ei | this.listenerIds++;
    return id;
  }

  private consumeEventId() {
    return this.eventIds++;
  }

  addListener(eventName: T, listener: Listener): number {
    eventName = eventName.trim() as T;
    const entery = this.findEventEntry(eventName);
    let listenerId: number;

    if (entery) {
      listenerId = this.consumeListenerId(entery[0]);
      const _listener = this.listeners.get(entery[0])!;
      _listener.push([listenerId, listener]);
    } else {
      const eventId = this.consumeEventId();
      listenerId = this.consumeListenerId(eventId);

      this.events.set(eventId, eventName);
      this.listeners.set(eventId, [[listenerId, listener]]);
    }
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
      this.listeners.delete(listenerId);
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
