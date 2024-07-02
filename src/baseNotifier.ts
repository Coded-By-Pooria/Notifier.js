import { ListenCallback, Listener } from './listener';
import {
  type EventDataTypeFromMap,
  type EventGeneric,
  type EventNameFromMap,
} from './typesHelper';

export default interface BaseNotifier<T extends EventGeneric = string> {
  addListener: <_E extends EventNameFromMap<T> & string>(
    eventName: _E,
    data: ListenCallback<_E, EventDataTypeFromMap<T, _E>>
  ) => Listener;
}
