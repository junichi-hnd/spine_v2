import CurveTimeline from './CurveTimeline';
import Utils from '../../utils/Utils';
import Skeleton from '../Skeleton';
import TransformConstraint from '../TransformConstraint';
import Animation from '../Animation';
class TransformConstraintTimeline extends CurveTimeline {
    public static ENTRIES: number = 5;
    public static PREV_TIME: number = -5;
    public static PREV_ROTATE: number = -4;
    public static PREV_TRANSLATE: number = -3;
    public static PREV_SCALE: number = -2;
    public static PREV_SHEAR: number = -1;
    public static ROTATE: number = 1;
    public static TRANSLATE: number = 2;
    public static SCALE: number = 3;
    public static SHEAR: number = 4;

    public transformConstraintIndex: number;
    // time, rotate mix, translate mix, scale mix, shear mix, ...
    public frames: ArrayLike<number>;

    constructor (frameCount: number) {
        super(frameCount);
        this.frames = Utils.newFloatArray(frameCount * TransformConstraintTimeline.ENTRIES);
    }

    /**
     * Sets the time and mixes of the specified keyframe.
     * @param frameIndex
     * @param time
     * @param rotateMix
     * @param translateMix
     * @param scaleMix
     * @param shearMix
     */
    public setFrame (frameIndex: number, time: number, rotateMix: number, translateMix: number, scaleMix: number, shearMix: number): void {
        frameIndex *= TransformConstraintTimeline.ENTRIES;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + TransformConstraintTimeline.ROTATE] = rotateMix;
        this.frames[frameIndex + TransformConstraintTimeline.TRANSLATE] = translateMix;
        this.frames[frameIndex + TransformConstraintTimeline.SCALE] = scaleMix;
        this.frames[frameIndex + TransformConstraintTimeline.SHEAR] = shearMix;
    }

    public apply (skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            return; // Time is before first frame.
        }

        const constraint: TransformConstraint = skeleton.transformConstraints[this.transformConstraintIndex];

        if (time >= frames[frames.length - TransformConstraintTimeline.ENTRIES]) {
            // Time is after last frame.
            const i: number = frames.length;
            constraint.rotateMix += (frames[i + TransformConstraintTimeline.PREV_ROTATE] - constraint.rotateMix) * alpha;
            constraint.translateMix += (frames[i + TransformConstraintTimeline.PREV_TRANSLATE] - constraint.translateMix) * alpha;
            constraint.scaleMix += (frames[i + TransformConstraintTimeline.PREV_SCALE] - constraint.scaleMix) * alpha;
            constraint.shearMix += (frames[i + TransformConstraintTimeline.PREV_SHEAR] - constraint.shearMix) * alpha;
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time, TransformConstraintTimeline.ENTRIES);
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent(frame / TransformConstraintTimeline.ENTRIES - 1,
            1 - (time - frameTime) / (frames[frame + TransformConstraintTimeline.PREV_TIME] - frameTime));

        const rotate: number = frames[frame + TransformConstraintTimeline.PREV_ROTATE];
        const translate: number = frames[frame + TransformConstraintTimeline.PREV_TRANSLATE];
        const scale: number = frames[frame + TransformConstraintTimeline.PREV_SCALE];
        const shear: number = frames[frame + TransformConstraintTimeline.PREV_SHEAR];
        constraint.rotateMix += (rotate + (frames[frame + TransformConstraintTimeline.ROTATE] - rotate) * percent - constraint.rotateMix) * alpha;
        constraint.translateMix += (translate + (frames[frame + TransformConstraintTimeline.TRANSLATE] - translate) * percent - constraint.translateMix)
            * alpha;
        constraint.scaleMix += (scale + (frames[frame + TransformConstraintTimeline.SCALE] - scale) * percent - constraint.scaleMix) * alpha;
        constraint.shearMix += (shear + (frames[frame + TransformConstraintTimeline.SHEAR] - shear) * percent - constraint.shearMix) * alpha;
    }
}
export default TransformConstraintTimeline;
