import Notifier from '../src/index';

const notifier = new Notifier<{
  event: {
    name: string;
    sound: 'bark' | 'meow';
  };
}>(true);

let counter = 1;

const listener1 = notifier.addListener('event', (e) => {
  if (e.data.name == 'pinko') {
    notifier.trigger('event', { name: 'jessy', sound: 'bark' });
  }
  console.log(`listener1 => ### ${e.data.name} is ${e.data.sound}ing ###`);
});

const listener2 = notifier.addListener('event', (e) => {
  if (e.data.sound == 'bark') {
    console.log(`Listener 2 ** `, e.data);
  }
});

global.setTimeout(() => {
  notifier.trigger('event', { name: 'pinko', sound: 'bark' });
  notifier.trigger('event', { name: 'fitto', sound: 'meow' });
}, 2000);
