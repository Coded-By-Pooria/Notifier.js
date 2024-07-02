import BaseNofier from './baseNotifier';
import { ListenCallback, ListenerIml, ListenersHandler } from './listener';
import {
  EventDataTypeFromMap,
  EventGeneric,
  EventNameFromMap,
} from './typesHelper';

export interface NotifierMembers<T extends EventGeneric = string>
  extends BaseNofier<T> {
  clearify: <_E extends EventNameFromMap<T> & string>(eventName: _E) => void;
  trigger: <_E extends EventNameFromMap<T> & string>(
    eventName: _E,
    data?: any
  ) => void;
}

export default class Notifier<T extends EventGeneric = string>
  implements NotifierMembers<T>
{
  private listeners: Map<string, ListenersHandler> = new Map();

  /**
   *
   * @param async If notifier define as async, then the new events notification
   * are sent as asynchron. this can help to keep event ordering in right way.
   */
  constructor(private async: boolean = true) {}

  addListener<E extends EventNameFromMap<T> & string>(
    eventName: E,
    data: ListenCallback<E, EventDataTypeFromMap<T, E>>
  ) {
    const entery = this.listeners.get(eventName);
    const listener = new ListenerIml(data);
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

  isListening<_E extends EventNameFromMap<T> & string>(eventName: _E): boolean {
    return !!this.listeners.get(eventName)?.hasListeners();
  }

  clearify<_E extends EventNameFromMap<T> & string>(eventName: _E) {
    const entry = this.listeners.get(eventName);
    if (!entry) {
      return false;
    }
    return entry.clearList();
  }
  trigger<_E extends EventNameFromMap<T> & string>(
    eventName: _E,
    data?: EventDataTypeFromMap<T, _E>
  ): void {
    const x = this.listeners.get(eventName);
    if (!x) {
      return;
    }

    this.notifyListeners(x, eventName, data);
  }

  private notifyListeners<_E extends EventNameFromMap<T> & string>(
    handler: ListenersHandler,
    event: _E,
    data: any
  ) {
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

  abstract invoke(next?: ListenerIml): void;
}

class _AsyncListenersInvokeHandler<T extends string> extends _InvokeHandler<T> {
  invoke(next?: ListenerIml | undefined): void {
    const listener = next ?? (this.handler._first! as ListenerIml);
    listener.scheduleEvent(this.eventName, this.data);
    if (listener._next) this.invoke(listener._next as ListenerIml);
  }
}

class _SyncListenersInvokeHandler<T extends string> extends _InvokeHandler<T> {
  invoke(next?: ListenerIml) {
    const listener = next ?? (this.handler._first! as ListenerIml);
    listener.invoke(this.eventName, this.data);
    if (listener._next) this.invoke(listener._next as ListenerIml);
  }
}
