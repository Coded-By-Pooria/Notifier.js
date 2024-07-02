export type EventGeneric = EventMapToEventData | string;

export type EventMapToEventData<T = {}> = {
  [eventName: string]: T;
};

export type EventNameFromMap<T extends EventGeneric> =
  T extends EventMapToEventData ? keyof T : T;

export type EventDataType<
  T extends EventMapToEventData,
  E extends string,
> = E extends keyof T ? T[E] : any;

export type EventDataTypeFromMap<
  T extends EventMapToEventData | string,
  E extends string,
> = T extends EventMapToEventData ? EventDataType<T, E> : any;
