import { ListenCallbackEvent } from "./event";
import { LinkableItem, LinkedListHandler } from "./list";
import { PendingEvent, PendingEventsHandler } from "./pendingEvents";

export type ListenCallback<T extends string = string, P extends {} = {}> = (
  event: ListenCallbackEvent
) => void;

export interface Listener {
  cancel(): void;
}

export class ListenerImpl extends LinkableItem implements Listener {
  isInvoking = false;

  private pendings?: PendingEventsHandler;

  get hasPendings(): boolean {
    return !!this.pendings && this.pendings.hasItem();
  }

  constructor(private listen: ListenCallback<any, any>) {
    super();
  }

  invoke(event: ListenCallbackEvent) {
    if (this.isInvoking) {
      this.scheduleEvent(event);
    } else {
      this._invoke(event);
    }
  }

  _invoke(event: ListenCallbackEvent) {
    this.isInvoking = true;
    this.listen(event);
    this.isInvoking = false;
  }

  scheduleEvent(event: ListenCallbackEvent) {
    this.pendings ??= new PendingEventsHandler();

    const eventHandler = new PendingEvent(this, event);
    this.pendings.append(eventHandler);

    this.pendings.start();
  }

  private isCanceled = false;

  cancel() {
    (this._handler as ListenersHandler).cancelListening(this);
    this.pendings?.cancel();
    this.pendings = undefined;
    this.isCanceled = true;
  }
}

export class ListenersHandler extends LinkedListHandler<ListenerImpl> {
  hasListeners() {
    return !!this._first;
  }

  append(item: ListenerImpl): void {
    super.append(item);
  }

  cancelListening(listener: ListenerImpl) {
    super.unLink(listener);
  }
}
