import { ListenCallbackEvent } from "./event";
import { LinkableItem, LinkedListHandler } from "./list";
import { ListenerImpl } from "./listener";

export class PendingEvent extends LinkableItem {
  constructor(
    private listener: ListenerImpl,
    private event: ListenCallbackEvent
  ) {
    super();
  }

  dispatch() {
    this.listener._invoke(this.event);
  }
}

export class PendingEventsHandler extends LinkedListHandler<PendingEvent> {
  private isPaused = false;
  private isScheduled = false;

  start() {
    if (this.isPaused) {
      this.isPaused = false;
    }
    this.schedule();
  }

  private unShift() {
    if (this._first) this.unLink(this._first!);
  }

  private schedule() {
    if (this.isPaused || this.isScheduled) {
      return;
    }
    const event = this._first;
    if (event) {
      queueMicrotask(() => {
        if (this.isPaused) {
          // keep event in list and don't remove it
          return;
        }

        event.dispatch();
        this.unShift();
        this.isScheduled = false;
        this.schedule();
      });
      this.isScheduled = true;
    }
  }

  cancel() {
    this.pause();
    this.clearList();
  }

  pause() {
    this.isPaused = true;
  }
}
