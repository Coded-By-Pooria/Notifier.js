// import {
//   BaseNotifier,
//   ListenCallback,
//   Listener,
//   EventDataTypeFromMap,
// } from '../dist/notifier';

import {
  BaseNotifier,
  ListenCallback,
  Listener,
  EventDataType,
} from '../src/index';

type events = {
  e1: {
    data: string;
    status: { code: number; message: string };
  };
};

class MyClass implements BaseNotifier<events> {
  addListener: <_E extends 'e1'>(
    eventName: _E,
    data: ListenCallback<_E, EventDataType<events, _E>>
  ) => Listener;
}
