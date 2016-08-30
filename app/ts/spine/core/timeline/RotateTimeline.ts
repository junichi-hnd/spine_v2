import CurveTimeline from './CurveTimeline';
import Utils from '../../utils/Utils';
import Skeleton from '../Skeleton';
import Bone from '../Bone';
import Animation from '../Animation';

class RotateTimeline extends CurveTimeline {
    public static ENTRIES: number = 2;
    public static PREV_TIME: number = -2;
    public static PREV_ROTATION: number = -1;
    public static ROTATION: number = 1;

    public boneIndex: number;
    // time, degrees, ...
    public frames: ArrayLike<number>;

    constructor (frameCount: number) {
        super(frameCount);
        this.frames = Utils.newFloatArray(frameCount << 1);
    }

    /**
     * Sets the time and angle of the specified keyframe.
     * @param frameIndex
     * @param time
     * @param degrees
     */
    public setFrame (frameIndex: number, time: number, degrees: number): void {
        frameIndex <<= 1;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + RotateTimeline.ROTATION] = degrees;
    }

    public apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if(time < frames[0]) {
            // Time is before first frame.
            return;
        }
        const bone: Bone = skeleton.bones[this.boneIndex];
        // Time is after last frame.
        if (time >= frames[frames.length - RotateTimeline.ENTRIES]) {
            let amount: number = bone.data.rotation + frames[frames.length + RotateTimeline.PREV_ROTATION] - bone.rotation;
            while (amount > 180) {
                amount -= 360;
            }
            while (amount < -180) {
                amount += 360;
            }
            bone.rotation += amount * alpha;
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time, RotateTimeline.ENTRIES);
        const prevRotation: number = frames[frame + RotateTimeline.PREV_ROTATION];
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent((frame >> 1) - 1,
            1 - (time - frameTime) / (frames[frame + RotateTimeline.PREV_TIME] - frameTime));

        let amount: number = frames[frame + RotateTimeline.ROTATION] - prevRotation;
        while (amount > 180) {
            amount -= 360;
        }

        while (amount < -180) {
            amount += 360;
        }
        amount = bone.data.rotation + (prevRotation + amount * percent) - bone.rotation;
        while (amount > 180) {
            amount -= 360;
        }

        while (amount < -180) {
            amount += 360;
        }
        bone.rotation += amount * alpha;
    }
}
export default RotateTimeline;
