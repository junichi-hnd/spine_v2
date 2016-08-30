import IEventDispatcher from './IEventDispatcher';


class EventDispatcher implements IEventDispatcher {
  private _events: Array<any>;
  private _context: any;

  /**
   * @class EventDispatcher
   * @constructor
   */
  constructor(context?: any) {
    this._events = [];
    this._context = context;
  }

  /**
   * onceと同じ
   * @param type        {string}
   * @param callback    {Function}
   * @param context     {any}
   * @param priority    {boolean}
   */
  public one(type: string, callback: Function, context?: any, priority: number = 0): void {
    const handler: Function = () => {
      this.off(type, handler);
      callback.apply(this, arguments);
    };
    handler.bind(this);
    this.on(type, callback, context, priority);
  }

  /**
   *
   * @param type        {string}
   * @param callback    {Function}
   * @param context     {any}
   * @param priority    {boolean}
   */
  public addEventListener(type: string, callback: Function, context?: any, priority: number = 0): void {
    this._events[type] = this._events.hasOwnProperty(type) ?
      this._events[type] : {};

    const listenerToInsert: any = {
      context, callback, priority
    };

    if (this._events[type].listeners) {
      const listeners: Array<any> = this._events[type].listeners;
      let inserted: boolean = false;
      const length: number = listeners.length;
      for (let i: number = 0; i < length; i++) {
        const listener: any = listeners[i];
        const eventPriority: number = listener.priority;
        if (priority < eventPriority) {
          listeners.splice(i, 0, listenerToInsert);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        listeners.push(listenerToInsert);
      }
    } else {
      this._events[type].listeners = [listenerToInsert];
    }
  }

  /**
   * the same as addEventListener
   * @param type        {string}
   * @param callback    {Function}
   * @param context     {any}
   * @param priority    {boolean}
   */
  public on(type: string, callback: Function, context?: any, priority: number = 0): void {
    this.addEventListener(type, callback, context, priority);
  }

  /**
   * removeEventListener
   * @param type        {string}
   * @param callback    {Function}
   */
  public removeEventListener(type: string, callback: Function): void {
    const listeners: Array<any> = this._events[type] ? this._events[type].listeners : null;
    if (!listeners || listeners.length < 1) {
      return;
    }
    if (!callback) {
      this._events[type].listeners = [];
      return;
    }
    const length: number = listeners.length;
    for (let i: number = 0; i < length; i++) {
      const listener: any = listeners[i];
      if (listener.callback === callback) {
        listeners.splice(i, 1);
        return;
      }
    }
  }

  /**
   * the same as removeEventListener
   * @param type        {string}
   * @param callback    {Function}
   */
  public off(type: string, callback: Function): void {
    this.removeEventListener(type, callback);
  }

  /**
   * eventを持ってるかどうか
   * @param type        {string}
   * @param callback    {Function}
   * @return {boolean}
   */
  public hasEventListener(type: string, callback: Function): boolean {
    const listeners: any = this._events[type] ? this._events[type].listeners : null;
    if (!listeners) {
      return false;
    }
    if (!callback) {
      return listeners.length > 0;
    }
    for (let i: number = 0, length:number = listeners.length; i < length; i++) {
      const listener:any = listeners[i];
      if (listener.callback === callback) {
        return true;
      }
    }
    return false;
  }

  /**
   * the same as EventEmitter
   * @param event
   */
  public dispatchEvent(event: any): void {
    const type: string = event.type;
    const _eventType: any = this._events[type];
    const listeners: Array<any> = (_eventType !== null && typeof _eventType !== 'undefined') ? _eventType.listeners : null;
    if (!listeners || listeners.length < 1) {
      return;
    }
    for (let i:number = listeners.length - 1; i >= 0; i--) {
      const listener: any = listeners[i];
      const callback: Function = listener.callback;

      const callbackContext: any = listener.context ? listener.context : this._context;
      if (!('target' in event)) {
        event.target = this;
      }
      event.currentTarget = this;
      event.context = callbackContext;
      const result: any = callback.call(this, event);
      if (result !== undefined && !result) {
        break;
      }
    }
  }

  /**
   * the same as dispatchEvent
   * @param event
   */
  public trigger(event: any):void {
    this.dispatchEvent(event);
  }

  /**
   * the same as dispatchEvent
   * @param event
   */
  public fire(event:any):void {
    this.dispatchEvent(event);
  }

  /**
   * remove all event listeners
   */
  public removeAllEventListener(): void {
    for(let key in this._events) {
      if(this._events.hasOwnProperty(key)) {
        this._events[key].listeners.length = 0;
        delete this._events[key];
      }
    }
  }
}

export default EventDispatcher;
