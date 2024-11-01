import { Listener } from "./listener";

export interface Event<T extends string = string, P extends {} = {}> {
  eventName: T;
  data: P;
  stopPropogation(): void;
}

export class ListenCallbackEvent<T extends string = string, P extends {} = {}>
  implements Event
{
  currentListener?: Listener;
  constructor(
    public readonly eventName: T,
    public readonly data: P,
    private onStopPropagation: (event: ListenCallbackEvent) => void
  ) {}

  stopPropogation() {
    this.onStopPropagation(this);
  }

  withListener(listener: Listener) {
    const event = new ListenCallbackEvent(
      this.eventName,
      this.data,
      this.onStopPropagation
    );
    event.currentListener = listener;
    return event;
  }
}
