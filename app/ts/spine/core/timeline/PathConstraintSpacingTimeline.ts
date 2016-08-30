import PathConstraintPositionTimeline from './PathConstraintPositionTimeline';
import Skeleton from '../Skeleton';
import Event from '../events/Event';
import PathConstraint from '../PathConstraint';
import Animation from '../Animation';
class PathConstraintSpacingTimeline extends PathConstraintPositionTimeline {
    constructor (frameCount: number) {
        super(frameCount);
    }

    public apply (skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            return; // Time is before first frame.
        }

        const constraint: PathConstraint = skeleton.pathConstraints[this.pathConstraintIndex];

        if (time >= frames[frames.length - PathConstraintSpacingTimeline.ENTRIES]) { // Time is after last frame.
            const i: number = frames.length;
            constraint.spacing += (frames[i + PathConstraintSpacingTimeline.PREV_VALUE] - constraint.spacing) * alpha;
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time, PathConstraintSpacingTimeline.ENTRIES);
        const spacing: number = frames[frame + PathConstraintSpacingTimeline.PREV_VALUE];
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent(frame / PathConstraintSpacingTimeline.ENTRIES - 1,
            1 - (time - frameTime) / (frames[frame + PathConstraintSpacingTimeline.PREV_TIME] - frameTime));

        constraint.spacing += (spacing + (frames[frame + PathConstraintSpacingTimeline.VALUE] - spacing) * percent - constraint.spacing) * alpha;
    }
}
export default PathConstraintSpacingTimeline;
