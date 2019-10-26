
export class EventEmitter {
  private _listeners: any;
  constructor() {
    // イベント名、リスナー関数が入る
    this._listeners = new Map();
  }
  addEventListener(type:string, listener:any) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    const listenerSet = this._listeners.get(type);
    listenerSet.add(listener);
  }
  emit(type:string) {
    const listenerSet = this._listeners.get(type)
    if (!listenerSet) {
      return;
    }
    listenerSet.forEach(listener => {
      listener.call(this);
    })
  }
  removeEventListener(type:string, listener:any) {
    const listenerSet = this._listeners.get(type);
    if (!listenerSet) {
      return;
    }
    listenerSet.forEach(ownListener => {
      if (ownListener === listener) {
        listenerSet.delete(listener);
      }
    })
  }
}
