import { ListenCallback, Listener, ListenersHandler } from './listener';

export interface BaseNofier<T extends string = string> {
  addListener: (eventName: T, data: ListenCallback) => Listener<T>;
}

export interface NotifierMembers<T extends string = string>
  extends BaseNofier<T> {
  clearify: (eventName: T) => void;
  trigger: (event: T, data?: any) => void;
}

export default class Notifier<T extends string = string>
  implements NotifierMembers<T>
{
  private listeners: Map<string, ListenersHandler> = new Map();

  /**
   *
   * @param async If notifier define as async, then the new events notification
   * are sent as asynchron. this can help to keep event ordering in right way.
   */
  constructor(private async: boolean) {}

  addListener(eventName: T, listenerCb: ListenCallback): Listener<T> {
    eventName = eventName.trim() as T;
    const entery = this.listeners.get(eventName);
    const listener = new Listener(listenerCb);
    let handler: ListenersHandler;

    if (entery) {
      handler = this.listeners.get(eventName)!;
    } else {
      handler = new ListenersHandler();
      this.listeners.set(eventName, handler);
    }
    handler.append(listener);

    return listener;
  }
  isListening(eventName: T): boolean {
    return !!this.listeners.get(eventName)?.hasListeners();
  }

  clearify(eventName: string) {
    eventName = eventName.trim();
    const entry = this.listeners.get(eventName);
    if (!entry) {
      return false;
    }
    return entry.clearList();
  }
  trigger(eventName: T, data?: any): void {
    eventName = eventName.trim() as T;
    const x = this.listeners.get(eventName);
    if (!x) {
      return;
    }

    this.notifyListeners(x, eventName, data);
  }

  private notifyListeners(handler: ListenersHandler, event: T, data: any) {
    if (!handler.hasListeners()) {
      return;
    }

    const invoker = this.async
      ? new _AsyncListenersInvokeHandler(handler, event, data)
      : new _SyncListenersInvokeHandler(handler, event, data);
    invoker.invoke();
  }
}

abstract class _InvokeHandler<T extends string> {
  constructor(
    protected handler: ListenersHandler,
    protected eventName: T,
    protected data?: any
  ) {}

  abstract invoke(next?: Listener<T>): void;
}

class _AsyncListenersInvokeHandler<T extends string> extends _InvokeHandler<T> {
  invoke(next?: Listener<T> | undefined): void {
    const listener = next ?? (this.handler._first! as Listener<T>);
    listener.scheduleEvent(this.eventName, this.data);
    if (listener._next) this.invoke(listener._next as Listener<T>);
  }
}

class _SyncListenersInvokeHandler<T extends string> extends _InvokeHandler<T> {
  invoke(next?: Listener<T>) {
    const listener = next ?? (this.handler._first! as Listener<T>);
    listener.invoke(this.eventName, this.data);
    if (listener._next) this.invoke(listener._next as Listener<T>);
  }
}
