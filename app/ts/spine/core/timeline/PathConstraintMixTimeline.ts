import CurveTimeline from './CurveTimeline';
import Utils from '../../utils/Utils';
import Skeleton from '../Skeleton';
import Event from '../events/Event';
import PathConstraint from '../PathConstraint';
import Animation from '../Animation';
class PathConstraintMixTimeline extends CurveTimeline {
    public static ENTRIES: number = 3;
    public static PREV_TIME: number = -3;
    public static PREV_ROTATE: number = -2;
    public static PREV_TRANSLATE: number = -1;
    public static ROTATE: number = 1;
    public static TRANSLATE: number = 2;

    public pathConstraintIndex: number;
    // time, rotate mix, translate mix, ...
    public frames: ArrayLike<number>;

    constructor (frameCount: number) {
        super(frameCount);
        this.frames = Utils.newFloatArray(frameCount * PathConstraintMixTimeline.ENTRIES);
    }

    /**
     * Sets the time and mixes of the specified keyframe.
     * @param frameIndex
     * @param time
     * @param rotateMix
     * @param translateMix
     */
    public setFrame (frameIndex: number, time: number, rotateMix: number, translateMix: number): void {
        frameIndex *= PathConstraintMixTimeline.ENTRIES;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + PathConstraintMixTimeline.ROTATE] = rotateMix;
        this.frames[frameIndex + PathConstraintMixTimeline.TRANSLATE] = translateMix;
    }

    public apply (skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            return; // Time is before first frame.
        }

        const constraint: PathConstraint = skeleton.pathConstraints[this.pathConstraintIndex];

        if (time >= frames[frames.length - PathConstraintMixTimeline.ENTRIES]) { // Time is after last frame.
            const i: number = frames.length;
            constraint.rotateMix += (frames[i + PathConstraintMixTimeline.PREV_ROTATE] - constraint.rotateMix) * alpha;
            constraint.translateMix += (frames[i + PathConstraintMixTimeline.PREV_TRANSLATE] - constraint.translateMix) * alpha;
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time, PathConstraintMixTimeline.ENTRIES);
        const rotate: number = frames[frame + PathConstraintMixTimeline.PREV_ROTATE];
        const translate: number = frames[frame + PathConstraintMixTimeline.PREV_TRANSLATE];
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent(frame / PathConstraintMixTimeline.ENTRIES - 1,
            1 - (time - frameTime) / (frames[frame + PathConstraintMixTimeline.PREV_TIME] - frameTime));

        constraint.rotateMix += (rotate + (frames[frame + PathConstraintMixTimeline.ROTATE] - rotate) * percent - constraint.rotateMix) * alpha;
        constraint.translateMix += (translate + (frames[frame + PathConstraintMixTimeline.TRANSLATE] - translate) * percent - constraint.translateMix)
            * alpha;
    }
}
export default PathConstraintMixTimeline;
