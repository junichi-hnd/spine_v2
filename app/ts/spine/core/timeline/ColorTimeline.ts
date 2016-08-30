import CurveTimeline from './CurveTimeline';
import Utils from '../../utils/Utils';
import Skeleton from '../Skeleton';
import Animation from '../Animation';
import Color from '../../utils/Color';
class ColorTimeline extends CurveTimeline {
    public static ENTRIES: number = 5;
    public static PREV_TIME: number = -5;
    public static PREV_R: number = -4;
    public static PREV_G: number = -3;
    public static PREV_B: number = -2;
    public static PREV_A: number = -1;
    public static R: number = 1;
    public static G: number = 2;
    public static B: number = 3;
    public static A: number = 4;

    public slotIndex: number;
    // time, r, g, b, a, ...
    public frames: ArrayLike<number>;

    constructor (frameCount: number) {
        super(frameCount);
        this.frames = Utils.newFloatArray(frameCount * ColorTimeline.ENTRIES);
    }

    /**
     * Sets the time and value of the specified keyframe.
     * @param frameIndex
     * @param time
     * @param r
     * @param g
     * @param b
     * @param a
     */
    public setFrame (frameIndex: number, time: number, r: number, g: number, b: number, a: number): void {
        frameIndex *= ColorTimeline.ENTRIES;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + ColorTimeline.R] = r;
        this.frames[frameIndex + ColorTimeline.G] = g;
        this.frames[frameIndex + ColorTimeline.B] = b;
        this.frames[frameIndex + ColorTimeline.A] = a;
    }

    public apply (skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            // Time is before first frame.
            return;
        }
        let r: number = 0, g: number = 0, b: number = 0, a: number = 0;
        if (time >= frames[frames.length - ColorTimeline.ENTRIES]) { // Time is after last frame.
            const i: number = frames.length;
            r = frames[i + ColorTimeline.PREV_R];
            g = frames[i + ColorTimeline.PREV_G];
            b = frames[i + ColorTimeline.PREV_B];
            a = frames[i + ColorTimeline.PREV_A];
        } else {
            // Interpolate between the previous frame and the current frame.
            const frame: number = Animation.binarySearch(frames, time, ColorTimeline.ENTRIES);
            r = frames[frame + ColorTimeline.PREV_R];
            g = frames[frame + ColorTimeline.PREV_G];
            b = frames[frame + ColorTimeline.PREV_B];
            a = frames[frame + ColorTimeline.PREV_A];
            const frameTime: number = frames[frame];
            const percent: number = this.getCurvePercent(frame / ColorTimeline.ENTRIES - 1,
                1 - (time - frameTime) / (frames[frame + ColorTimeline.PREV_TIME] - frameTime));

            r += (frames[frame + ColorTimeline.R] - r) * percent;
            g += (frames[frame + ColorTimeline.G] - g) * percent;
            b += (frames[frame + ColorTimeline.B] - b) * percent;
            a += (frames[frame + ColorTimeline.A] - a) * percent;
        }
        const color: Color = skeleton.slots[this.slotIndex].color;
        if (alpha < 1) {
            color.add((r - color.r) * alpha, (g - color.g) * alpha, (b - color.b) * alpha, (a - color.a) * alpha);
        } else {
            color.set(r, g, b, a);
        }
    }
}
export default ColorTimeline;
