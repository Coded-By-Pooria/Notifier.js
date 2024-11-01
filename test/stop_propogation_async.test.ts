import Notifier from "../src/index";

const notifier = new Notifier<"event">(true);

let counter = 1;

const listener1 = notifier.addListener("event", (e) => {
  console.log("Hello from listener 1");
  console.log("before stopping");
  e.stopPropogation();
  console.log("after stopping");
});

const listener2 = notifier.addListener("event", (e) => {
  console.log(`Listener 2 ** ${e.data}`);
});

global.setTimeout(() => {
  notifier.trigger("event", "Meow");
}, 2000);
