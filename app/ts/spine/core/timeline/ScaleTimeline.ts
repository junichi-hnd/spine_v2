import TranslateTimeline from './TranslateTimeline';
import Skeleton from '../Skeleton';
import Event from '../events/Event';
import Bone from '../Bone';
import Animation from '../Animation';
class ScaleTimeline extends TranslateTimeline {
    constructor (frameCount: number) {
        super(frameCount);
    }

    apply (skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number): void {
        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            // Time is before first frame.
            return;
        }

        const bone: Bone = skeleton.bones[this.boneIndex];
        if (time >= frames[frames.length - ScaleTimeline.ENTRIES]) { // Time is after last frame.
            bone.scaleX += (bone.data.scaleX * frames[frames.length + ScaleTimeline.PREV_X] - bone.scaleX) * alpha;
            bone.scaleY += (bone.data.scaleY * frames[frames.length + ScaleTimeline.PREV_Y] - bone.scaleY) * alpha;
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time, ScaleTimeline.ENTRIES);
        const prevX: number = frames[frame + ScaleTimeline.PREV_X];
        const prevY: number = frames[frame + ScaleTimeline.PREV_Y];
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent(frame / ScaleTimeline.ENTRIES - 1,
            1 - (time - frameTime) / (frames[frame + ScaleTimeline.PREV_TIME] - frameTime));

        bone.scaleX += (bone.data.scaleX * (prevX + (frames[frame + ScaleTimeline.X] - prevX) * percent) - bone.scaleX) * alpha;
        bone.scaleY += (bone.data.scaleY * (prevY + (frames[frame + ScaleTimeline.Y] - prevY) * percent) - bone.scaleY) * alpha;
    }
}
export default ScaleTimeline;
