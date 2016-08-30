import CurveTimeline from './CurveTimeline';
import Utils from '../../utils/Utils';
import Skeleton from '../Skeleton';
import Event from '../events/Event';
import Bone from '../Bone';
import Animation from '../Animation';

class TranslateTimeline extends CurveTimeline {
    public static ENTRIES: number = 3;
    public static PREV_TIME: number = -3;
    public static PREV_X: number = -2;
    public static PREV_Y: number = -1;
    public static X: number = 1;
    public static Y: number = 2;

    public boneIndex: number;
    public frames: ArrayLike<number>;

    constructor (frameCount: number) {
        super(frameCount);
        this.frames = Utils.newFloatArray(frameCount * TranslateTimeline.ENTRIES);
    }

    /**
     * Sets the time and value of the specified keyframe.
     * @param frameIndex
     * @param time
     * @param x
     * @param y
     */
    public setFrame (frameIndex: number, time: number, x: number, y: number): void {
        frameIndex *= TranslateTimeline.ENTRIES;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + TranslateTimeline.X] = x;
        this.frames[frameIndex + TranslateTimeline.Y] = y;
    }

    /**
     *
     * @param skeleton
     * @param lastTime
     * @param time
     * @param events
     * @param alpha
     */
    public apply (skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            // Time is before first frame.
            return;
        }
        const bone: Bone = skeleton.bones[this.boneIndex];
        if (time >= frames[frames.length - TranslateTimeline.ENTRIES]) { // Time is after last frame.
            bone.x += (bone.data.x + frames[frames.length + TranslateTimeline.PREV_X] - bone.x) * alpha;
            bone.y += (bone.data.y + frames[frames.length + TranslateTimeline.PREV_Y] - bone.y) * alpha;
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time, TranslateTimeline.ENTRIES);
        const prevX: number = frames[frame + TranslateTimeline.PREV_X];
        const prevY: number = frames[frame + TranslateTimeline.PREV_Y];
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent(frame / TranslateTimeline.ENTRIES - 1,
            1 - (time - frameTime) / (frames[frame + TranslateTimeline.PREV_TIME] - frameTime));

        bone.x += (bone.data.x + prevX + (frames[frame + TranslateTimeline.X] - prevX) * percent - bone.x) * alpha;
        bone.y += (bone.data.y + prevY + (frames[frame + TranslateTimeline.Y] - prevY) * percent - bone.y) * alpha;
    }
}
export default TranslateTimeline;
