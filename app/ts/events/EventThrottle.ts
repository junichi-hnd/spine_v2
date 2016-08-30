import Event from './Event';
import EventDispatcher from './EventDispatcher';

class EventThrottle extends EventDispatcher {
    private _stock: number;
    private _timer: any;

    public throttleEvent: Event;

    public static get EVENT_THROTTLE(): string {
        return 'EventThrottles';
    }

    constructor(public duration?: number = 1000 / 60) {
        super();

        this._stock = 0;
        this._timer = null;

        this._exec = this._exec.bind(this);
    }

    public dispatchEvent(params?: Object): void {
        const current: any = new Date();
        if(this._timer) {
            window.clearTimeout(this._timer);
        }

        if(current - this._stock >= this.duration) {
            if(params) {
                this.throttleEvent.params = params;
            }
            super.dispatchEvent(this.throttleEvent);
            this._stock = current;
        } else {
            this._timer = window.setTimeout(() => {
                this._exec(params);
            }, this.duration);
        }
    }

    public addEventListener(eventHandler: Function): void {
        super.addEventListener(EventThrottle.EVENT_THROTTLE, eventHandler);
    }

    public on(eventHandler: Function): void {
        this.addEventListener(eventHandler);
    }

    public bind(eventHandler: Function): void {
        this.addEventListener(eventHandler);
    }

    public removeEventListener(eventHandler: Function): void {
        super.removeEventListener(EventThrottle.EVENT_THROTTLE, eventHandler);
    }

    public off(eventHandler: Function): void {
        this.removeEventListener(eventHandler);
    }

    public unbind(eventHandler: Function): void {
        this.removeEventListener(eventHandler);
    }

    public hasEventListener(): boolean {
        // super.hasEventListener(EventThrottle.EVENT_THROTTLE);
        return true;
    }

    private _exec(params: Object): void {
        this.dispatchEvent(params);
    }
}
export default EventThrottle;
