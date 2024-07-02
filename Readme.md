# Intro

A simple library to utilize event-base programming in our app.

# Installation

```
npm i @pourianof/nitifier
```

# Usage

You can use a notifier like:

```
  import Notifier from 'notifier';

  const notifier = new Notifier();

  // Add listener to the notifier
  notifier.addListener('meow', function () {
    console.log('someone meowing...');
  });

  // You can have multiple listeners
  const listener = notifier.addListener('meow', function () {
      feedTheCat();
      // Cancel listening to event (No event will sent to this listener)
      listener.cancel();
  });



  // Trigger an event which cause notify the listeners
  notifier.trigger('meow');
```

Or you can use it as a base class for your own classes to make them notifier.

## Passing data

You can also pass data when you triggering events.

```
  // Passing a data along with event
  notifier.trigger(
    'meow', {catName: 'pinky'}
  );

  notifier.addListener('meow', function(data){
    if(data.catName != "leo"){
      ignoreThatCat(); // its not mine
    }
  });
```

## Typescript

If you are using typescript, you can define your events as generic.
For example our notifier only works with "meow" and "bark" events:

```
  const notifier = new Notifier<'meow' | 'bark'>();

  notifier.trigger('hi'); // Typescript error which refer to wrong event with what you defined when you construct
```

## Sync-Async

This package support two type of event dispatching:
1- Sync: in this mode the event will dispatch at the moment it triggered using trigger method, synchronously.
2- Async: in this mode each event which triggered, scheduled to be dispatch asynchronously at later. After synchronous code has executed. (Default mode)

The default mode is async, if you wanna use synchronous mode, then you need pass boolean "false" value to constructor.

```
const asyncNotifier = new Notifier();
const syncNotifier = new Notifier(false);
```

### Use sync mode carefully, because it may cause some code execution interference. Like when you trigger new event in your listener callback.
