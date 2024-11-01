# Intro

A simple library to utilize event-base programming in our app.

# Installation

```
npm i @pourianof/nitifier
```

# Changes

`V1.1` Make event typing richer (may cause typescript code break if you extending classes)

`V1.2.0` Add stopPropagation method to event object, visibility of `notifyListener` method of `Notifier` class got change from `private` to `protected` to make it possible to change or customize how notify listeners.

# Usage

You can use a notifier like:

```ts
import Notifier from "notifier";

const notifier = new Notifier();

// Add listener to the notifier
notifier.addListener("meow", function () {
  console.log("someone meowing...");
});

// You can have multiple listeners
const listener = notifier.addListener("meow", function () {
  feedTheCat();
  // Cancel listening to event (No event will sent to this listener)
  listener.cancel();
});

// Trigger an event which cause notify the listeners
notifier.trigger("meow");
```

Or you can use it as a base class for your own classes to make them notifier.

## Passing data

You can also pass data when you triggering events.

```ts
// Passing a data along with event
notifier.trigger("meow", { catName: "pinky" });

notifier.addListener("meow", function (data) {
  if (data.catName != "leo") {
    ignoreThatCat(); // its not mine
  }
});
```

## Stop event propogation

You can stop propogation of event to other(later registered) listener via event object.

```js
notifier.addListener("event-name", (eventObject) => {
  eventObject.stopPropogation();
});

// Not receiving event, because the first listener stopped the propagation
notifier.addListener("event-name", (eventObject) => {
  console.log(eventObject); // not running
});
```

## Typescript

If you are using typescript, you can define your events as generic.
For example our notifier only works with "meow" and "bark" events:

```ts
const notifier = new Notifier<"meow" | "bark">();

notifier.trigger("hi"); // Typescript error which refer to wrong event with what you defined when you construct
```

You can also define a type as map of key-values which keys are the event names and values are type of the data which that event carrying.

```ts
const notifier = new Notifier<{
  meow: {
    catName: string;
    age: number;
  };
  bark: {
    dogName: string;
    owner: string;
  };
}>();
```

In this example typescript force you to work with only two defined events("bark", "meow") and also whenever you trigger those events you must pass a data with the specified structure.

## Sync-Async

This package support two type of event dispatching:
1- Sync: in this mode the event will dispatch at the moment it triggered using trigger method, synchronously.
2- Async: in this mode each event which triggered, scheduled to be dispatch asynchronously at later. After synchronous code has executed. (Default mode)

The default mode is async, if you wanna use synchronous mode, then you need pass boolean "false" value to constructor.

```ts
const asyncNotifier = new Notifier();
const syncNotifier = new Notifier(false);
```

### Use sync mode carefully, because it may cause some code execution interference. Like when you trigger new event in your listener callback.
