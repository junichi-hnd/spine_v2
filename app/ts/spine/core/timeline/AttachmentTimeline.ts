import ITimeline from './ITimeline';
import Skeleton from '../Skeleton';
import Event from '../events/Event';
import Utils from '../../utils/Utils';
import Animation from '../Animation';

class AttachmentTimeline implements ITimeline {
    public slotIndex: number;
    // time, ...
    public frames: ArrayLike<number>;
    public attachmentNames: Array<string>;

    constructor (frameCount: number) {
        this.frames = Utils.newFloatArray(frameCount);
        this.attachmentNames = new Array<string>(frameCount);
    }

    public getFrameCount (): number {
        return this.frames.length;
    }

    /** Sets the time and value of the specified keyframe. */
    public setFrame (frameIndex: number, time: number, attachmentName: string): void {
        this.frames[frameIndex] = time;
        this.attachmentNames[frameIndex] = attachmentName;
    }

    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            return; // Time is before first frame.
        }

        let frameIndex: number = 0;
        if (time >= frames[frames.length - 1]) {
            // Time is after last frame.
            frameIndex = frames.length - 1;
        } else {
            frameIndex = Animation.binarySearch(frames, time, 1) - 1;
        }


        const attachmentName: string = this.attachmentNames[frameIndex];
        skeleton.slots[this.slotIndex].setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
    }
}
export default AttachmentTimeline;
