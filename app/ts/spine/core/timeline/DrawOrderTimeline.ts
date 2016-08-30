import ITimeline from './ITimeline';
import Utils from '../../utils/Utils';
import Skeleton from '../Skeleton';
import Event from '../events/Event';
import Animation from '../Animation';
import Slot from '../Slot';
class DrawOrderTimeline implements ITimeline {
    // time, ...
    public frames: ArrayLike<number>;
    public drawOrders: Array<Array<number>>;

    constructor (frameCount: number) {
        this.frames = Utils.newFloatArray(frameCount);
        this.drawOrders = new Array<Array<number>>(frameCount);
    }

    public getFrameCount(): number {
        return this.frames.length;
    }

    /**
     * Sets the time of the specified keyframe.
     * @param frameIndex
     * @param time
     * @param drawOrder         May be null to use bind pose draw order.
     */
    public setFrame (frameIndex: number, time: number, drawOrder: Array<number>): void {
        this.frames[frameIndex] = time;
        this.drawOrders[frameIndex] = drawOrder;
    }

    public apply (skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            return; // Time is before first frame.
        }

        const frame: number = (time >= frames[frames.length - 1]) ? frames.length - 1 : Animation.binarySearch(frames, time) - 1;
        const drawOrder: Array<Slot> = skeleton.drawOrder;
        const slots: Array<Slot> = skeleton.slots;
        const drawOrderToSetupIndex: ArrayLike<number> = this.drawOrders[frame];
        if (drawOrderToSetupIndex === null) {
            Utils.arrayCopy(slots, 0, drawOrder, 0, slots.length);
        } else {
            for (let i: number = 0, n: number = drawOrderToSetupIndex.length; i < n; i++) {
                drawOrder[i] = slots[drawOrderToSetupIndex[i]];
            }
        }
    }
}
export default DrawOrderTimeline;
