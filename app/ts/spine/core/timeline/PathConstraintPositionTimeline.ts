import CurveTimeline from './CurveTimeline';
import Utils from '../../utils/Utils';
import Skeleton from '../Skeleton';
import Event from '../events/Event';
import PathConstraint from '../PathConstraint';
import Animation from '../Animation';
class PathConstraintPositionTimeline extends CurveTimeline {
    public static ENTRIES: number = 2;
    public static PREV_TIME: number = -2;
    public static PREV_VALUE: number = -1;
    public static VALUE: number = 1;

    public pathConstraintIndex: number;
    // time, position, ...
    public frames: ArrayLike<number>;

    constructor (frameCount: number) {
        super(frameCount);
        this.frames = Utils.newFloatArray(frameCount * PathConstraintPositionTimeline.ENTRIES);
    }

    /**
     * Sets the time and value of the specified keyframe.
     * @param frameIndex
     * @param time
     * @param value
     */
    public setFrame (frameIndex: number, time: number, value: number): void {
        frameIndex *= PathConstraintPositionTimeline.ENTRIES;
        this.frames[frameIndex] = time;
        this.frames[frameIndex + PathConstraintPositionTimeline.VALUE] = value;
    }

    public apply (skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            // Time is before first frame.
            return;
        }

        const constraint: PathConstraint = skeleton.pathConstraints[this.pathConstraintIndex];

        if (time >= frames[frames.length - PathConstraintPositionTimeline.ENTRIES]) {
            // Time is after last frame.
            const i: number = frames.length;
            constraint.position += (frames[i + PathConstraintPositionTimeline.PREV_VALUE] - constraint.position) * alpha;
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time, PathConstraintPositionTimeline.ENTRIES);
        const position: number = frames[frame + PathConstraintPositionTimeline.PREV_VALUE];
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent(frame / PathConstraintPositionTimeline.ENTRIES - 1,
            1 - (time - frameTime) / (frames[frame + PathConstraintPositionTimeline.PREV_TIME] - frameTime));

        constraint.position += (position + (frames[frame + PathConstraintPositionTimeline.VALUE] - position) * percent - constraint.position) * alpha;
    }
}
export default PathConstraintPositionTimeline;
