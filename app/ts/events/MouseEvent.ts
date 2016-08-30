import Event from './Event';

class MouseEvent extends Event {

    public static get CLICK(): string {
        return 'click';
    }

    public static get DBLCLICK(): string {
        return 'dblclick';
    }

    public static get MOUSE_OUT(): string {
        return 'mouseout';
    }

    public static get MOUSE_OVER(): string {
        return 'mouseover';
    }

    public static get MOUSE_UP(): string {
        return 'mouseup';
    }

    public static get MOUSE_DOWN(): string {
        return 'mousedown';
    }

    public static get MOUSE_MOVE(): string {
        return 'mousemove';
    }

    public static get MOUSE_WHEEL(): string {
        return 'mousewheel';
    }

    public static get DOM_MOUSE_SCROLL(): string {
        return 'DOM_MOUSE_SCROLL';
    }

    constructor(public type:string, public params: any = {}) {
        super(type, params);
    }
}
export default MouseEvent;
