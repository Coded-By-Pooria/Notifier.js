import Notifier from '../src/index';

const notifier = new Notifier<'event'>(true);

let counter = 1;

const listener1 = notifier.addListener('event', (e) => {
  if (e.data === 'Meow') {
    notifier.trigger('event', '### New Event from listener1 ###');
    listener1.cancel();
  }
  console.log(`listener1 => ${e.data}`);
});

const listener2 = notifier.addListener('event', (e) => {
  console.log(`Listener 2 ** ${e.data}`);
});

global.setTimeout(() => {
  notifier.trigger('event', 'Meow');
  notifier.trigger('event', '22222');
}, 2000);
