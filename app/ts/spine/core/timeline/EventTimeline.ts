import ITimeline from './ITimeline';
import Utils from '../../utils/Utils';
import Event from '../events/Event';
import Skeleton from '../Skeleton';
import Animation from '../Animation';
class EventTimeline implements ITimeline {
    // time, ...
    public frames: ArrayLike<number>;
    public events: Array<Event>;

    constructor (frameCount: number) {
        this.frames = Utils.newFloatArray(frameCount);
        this.events = new Array<Event>(frameCount);
    }

    public getFrameCount(): number {
        return this.frames.length;
    }

    /**
     * Sets the time of the specified keyframe.
     * @param frameIndex
     * @param event
     */
    public setFrame(frameIndex: number, event: Event): void {
        this.frames[frameIndex] = event.time;
        this.events[frameIndex] = event;
    }

    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number): void {
        if (firedEvents === null) {
            return;
        }
        const frames: ArrayLike<number> = this.frames;
        const frameCount: number = this.frames.length;
        // Fire events after last time for looped animations.
        if (lastTime > time) {
            this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha);
            lastTime = -1;

        } else if (lastTime >= frames[frameCount - 1]) {
            // Last time is after last frame.
            return;
        }
        if (time < frames[0]) {
            // Time is before first frame.
            return;
        }

        let frame: number = 0;
        if (lastTime < frames[0]) {
            frame = 0;
        } else {
            frame = Animation.binarySearch(frames, lastTime);
            let frameTime: number = frames[frame];
            while (frame > 0) {
                // Fire multiple events with the same frame.
                if (frames[frame - 1] !== frameTime) {
                    break;
                }
                frame--;
            }
        }
        for (; frame < frameCount && time >= frames[frame]; frame++) {
            firedEvents.push(this.events[frame]);
        }
    }
}
export default EventTimeline;
