import { LinkableItem, LinkedListHandler } from './list';
import { PendingEvent, PendingEventsHandler } from './pendingEvents';

export type ListenCallback = (event: { eventName: string; data: any }) => void;

export class Listener<T extends string> extends LinkableItem {
  isInvoking = false;

  private pendings?: PendingEventsHandler;

  get hasPendings(): boolean {
    return !!this.pendings && this.pendings.hasItem();
  }

  constructor(private listen: ListenCallback) {
    super();
  }

  invoke(eventName: T, data?: any) {
    if (this.isInvoking) {
      this.scheduleEvent(eventName, data);
    } else {
      this._invoke(eventName, data);
    }
  }

  _invoke(eventName: T, data?: any) {
    this.isInvoking = true;
    this.listen({ data, eventName });
    this.isInvoking = false;
  }

  scheduleEvent(eventName: T, data?: any) {
    this.pendings ??= new PendingEventsHandler();

    const event = new PendingEvent(this, eventName, data);
    this.pendings.append(event);

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

export class ListenersHandler extends LinkedListHandler<Listener<any>> {
  hasListeners() {
    return !!this._first;
  }

  append(item: Listener<any>): void {
    super.append(item);
  }

  cancelListening(listener: Listener<any>) {
    super.unLink(listener);
  }
}
