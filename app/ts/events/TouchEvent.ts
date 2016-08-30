import Event from './Event';

class TouchEvent extends Event {

    public static get TOUCH_START(): string {
        return 'touchstart';
    }

    public static get TOUCH_END(): string {
        return 'touchend';
    }

    public static get TOUCH_MOVE(): string {
        return 'touchmove';
    }

    public static get TOUCH_CANCEL(): string {
        return 'touchcancel';
    }

    public static get TOUCH_LEAVE(): string {
        return 'touchleave';
    }

    public static get GESTURE_START(): string {
        return 'gesturestart';
    }

    public static get GESTURE_END(): string {
        return 'gestureend';
    }

    constructor(public type:string, public params: any = {}) {
        super(type, params);
    }
}
export default TouchEvent;
