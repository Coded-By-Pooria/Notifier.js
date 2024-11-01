import BaseNofier from "./baseNotifier";
import { ListenCallbackEvent } from "./event";
import {
  ListenCallback,
  Listener,
  ListenerImpl,
  ListenersHandler,
} from "./listener";
import {
  EventDataTypeFromMap,
  EventGeneric,
  EventNameFromMap,
} from "./typesHelper";

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
  ): Listener {
    const entries = this.listeners.get(eventName);
    const listener = new ListenerImpl(data);
    let handler: ListenersHandler;

    if (entries) {
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

  protected notifyListeners<_E extends EventNameFromMap<T> & string>(
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
  event: ListenCallbackEvent;
  protected stopped = false;
  constructor(
    protected handler: ListenersHandler,
    protected eventName: T,
    protected data?: any
  ) {
    this.event = new ListenCallbackEvent(
      eventName,
      data,
      this.stopPropagation.bind(this)
    );
  }

  protected stopPropagation(event: ListenCallbackEvent) {
    this.stopped = true;
  }

  abstract invoke(next?: ListenerImpl): void;
}

class _AsyncListenersInvokeHandler<T extends string> extends _InvokeHandler<T> {
  protected stopPropaogation(e: ListenCallbackEvent) {
    super.stopPropagation(e);
    let listener: ListenerImpl | undefined = (e.currentListener as ListenerImpl)
      ._next as ListenerImpl;
    while (listener) {
      listener.cancel();
      listener = listener._next as ListenerImpl;
    }
  }
  invoke(next?: ListenerImpl | undefined): void {
    const listener = next ?? (this.handler._first! as ListenerImpl);
    listener.scheduleEvent(this.event.withListener(listener));
    if (listener._next && !this.stopped)
      this.invoke(listener._next as ListenerImpl);
  }
}

class _SyncListenersInvokeHandler<T extends string> extends _InvokeHandler<T> {
  invoke(next?: ListenerImpl) {
    const listener = next ?? (this.handler._first! as ListenerImpl);
    listener.invoke(this.event);
    if (listener._next && !this.stopped)
      this.invoke(listener._next as ListenerImpl);
  }
}
