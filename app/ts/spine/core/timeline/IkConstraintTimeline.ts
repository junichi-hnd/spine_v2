import CurveTimeline from './CurveTimeline';
import Utils from '../../utils/Utils';
import Skeleton from '../Skeleton';
import Event from '../events/Event';
import IkConstraint from '../IkConstraint';
import Animation from '../Animation';
class IkConstraintTimeline extends CurveTimeline {
    public static ENTRIES: number = 3;
    public static PREV_TIME: number = -3;
    public static PREV_MIX: number = -2;
    public static PREV_BEND_DIRECTION: number = -1;
    public static MIX: number = 1;
    public static BEND_DIRECTION: number = 2;

    public ikConstraintIndex: number;
    // time, mix, bendDirection, ...
    public frames: ArrayLike<number>;

    constructor (frameCount: number) {
        super(frameCount);
        this.frames = Utils.newFloatArray(frameCount * IkConstraintTimeline.ENTRIES);
    }

    /**
     * Sets the time, mix and bend direction of the specified keyframe.
     * @param frameIndex
     * @param time
     * @param mix
     * @param bendDirection
     */
    setFrame (frameIndex: number, time: number, mix: number, bendDirection: number): void {
        frameIndex *= IkConstraintTimeline.ENTRIES;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + IkConstraintTimeline.MIX] = mix;
        this.frames[frameIndex + IkConstraintTimeline.BEND_DIRECTION] = bendDirection;
    }


    apply (skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            // Time is before first frame.
            return;
        }

        const constraint: IkConstraint = skeleton.ikConstraints[this.ikConstraintIndex];

        if (time >= frames[frames.length - IkConstraintTimeline.ENTRIES]) { // Time is after last frame.
            constraint.mix += (frames[frames.length + IkConstraintTimeline.PREV_MIX] - constraint.mix) * alpha;
            constraint.bendDirection = Math.floor(frames[frames.length + IkConstraintTimeline.PREV_BEND_DIRECTION]);
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time, IkConstraintTimeline.ENTRIES);
        const mix: number = frames[frame + IkConstraintTimeline.PREV_MIX];
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent(frame / IkConstraintTimeline.ENTRIES - 1,
            1 - (time - frameTime) / (frames[frame + IkConstraintTimeline.PREV_TIME] - frameTime));

        constraint.mix += (mix + (frames[frame + IkConstraintTimeline.MIX] - mix) * percent - constraint.mix) * alpha;
        constraint.bendDirection = Math.floor(frames[frame + IkConstraintTimeline.PREV_BEND_DIRECTION]);
    }
}
export default IkConstraintTimeline;
