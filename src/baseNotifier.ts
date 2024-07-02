import { ListenCallback, Listener } from './listener';
import {
  EventDataFromMap,
  EventGeneric,
  EventNameFromMap,
} from './typesHelper';

export default interface BaseNofier<T extends EventGeneric = string> {
  addListener: <_E extends EventNameFromMap<T> & string>(
    eventName: _E,
    data: ListenCallback<_E, EventDataFromMap<T, _E>>
  ) => Listener;
}
