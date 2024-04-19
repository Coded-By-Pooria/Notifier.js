export class LinkedListHandler<T extends LinkableItem = LinkableItem> {
  _first?: T;
  _last?: T;

  append(item: T): void {
    if (this._last) {
      const last = this._last;
      last._next = item;
    } else {
      // no listeners
      this._first = item;
    }
    item._previous = this._last;
    item._next = undefined;
    this._last = item;
    item._handler = this;
  }

  clearList() {
    let listener = this._first?._next;
    if (!listener) {
      this._first = this._last = undefined;
      return true;
    }

    while (listener) {
      const next: LinkableItem | undefined = listener._next?._next;

      listener._previous = listener._next = undefined;

      listener = next;
    }

    this._first = this._last = undefined;

    return true;
  }
  hasItem() {
    return !!this._first;
  }

  protected unLink(item: LinkableItem) {
    console.assert(!!item, 'Item is not valid');
    console.assert(
      item._handler === this,
      'Item not belong to this list handler'
    );

    if (item._previous) {
      item._previous._next = item._next;
    } else {
      this._first = item._next as T;
    }

    if (item._next) {
      item._next._previous = item._previous;
    } else {
      this._last = item._previous as T;
    }

    item._next = item._previous = item._handler = undefined;
  }
}

export class LinkableItem {
  _handler?: LinkedListHandler;

  _previous?: LinkableItem;
  _next?: LinkableItem;
}
