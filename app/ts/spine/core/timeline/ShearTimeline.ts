import TranslateTimeline from './TranslateTimeline';
import Skeleton from '../Skeleton';
import Event from '../events/Event';
import Animation from '../Animation';
import Bone from '../Bone';
class ShearTimeline extends TranslateTimeline {
    constructor (frameCount: number) {
        super(frameCount);
    }

    public apply (skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            // Time is before first frame.
            return;
        }

        const bone: Bone = skeleton.bones[this.boneIndex];
        if (time >= frames[frames.length - ShearTimeline.ENTRIES]) { // Time is after last frame.
            bone.shearX += (bone.data.shearX + frames[frames.length + ShearTimeline.PREV_X] - bone.shearX) * alpha;
            bone.shearY += (bone.data.shearY + frames[frames.length + ShearTimeline.PREV_Y] - bone.shearY) * alpha;
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time, ShearTimeline.ENTRIES);
        const prevX: number = frames[frame + ShearTimeline.PREV_X];
        const prevY: number = frames[frame + ShearTimeline.PREV_Y];
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent(frame / ShearTimeline.ENTRIES - 1,
            1 - (time - frameTime) / (frames[frame + ShearTimeline.PREV_TIME] - frameTime));

        bone.shearX += (bone.data.shearX + (prevX + (frames[frame + ShearTimeline.X] - prevX) * percent) - bone.shearX) * alpha;
        bone.shearY += (bone.data.shearY + (prevY + (frames[frame + ShearTimeline.Y] - prevY) * percent) - bone.shearY) * alpha;
    }
}
export default ShearTimeline;
