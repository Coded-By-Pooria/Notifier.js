import Notifier from '../src/index';

const notifier = new Notifier<'event'>(true);

let counter = 1;

const listener1 = notifier.addListener('event', (e) => {
  if (e.data === 'Meow') {
    notifier.trigger('event', '### New Event from listener1 ###');
    listener1.cancel();
    listener2.cancel();

    global.setTimeout(() => {
      const listenerAfterCancelling = notifier.addListener('event', (e) => {
        console.log(
          'recieving data after canceling on new listener => ',
          e.data
        );
      });

      global.setTimeout(() => {
        notifier.trigger('event', 'new msg for listenerAfterCancelling');
      }, 1000);
    }, 1000);
  }
  console.log(`listener1 => ${e.data}`);
});

const listener2 = notifier.addListener('event', (e) => {
  console.log(`Listener 2 ** ${e.data}`);
});

global.setTimeout(() => {
  notifier.trigger('event', 'Meow');
}, 2000);
