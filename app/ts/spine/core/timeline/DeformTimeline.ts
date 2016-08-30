import CurveTimeline from './CurveTimeline';
import VertexAttachment from '../attachments/VertexAttachment';
import Utils from '../../utils/Utils';
import Skeleton from '../Skeleton';
import Slot from '../Slot';
import Attachment from '../attachments/Attachment';
import Animation from '../Animation';
class DeformTimeline extends CurveTimeline {
    public frames: ArrayLike<number>; // time, ...
    public frameVertices: Array<ArrayLike<number>>;
    public slotIndex: number;
    public attachment: VertexAttachment;

    constructor (frameCount: number) {
        super(frameCount);
        this.frames = Utils.newFloatArray(frameCount);
        this.frameVertices = new Array<ArrayLike<number>>(frameCount);
    }

    public setFrame (frameIndex: number, time: number, vertices: ArrayLike<number>): void {
        this.frames[frameIndex] = time;
        this.frameVertices[frameIndex] = vertices;
    }

    public apply (skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number): void {
        const slot: Slot = skeleton.slots[this.slotIndex];
        const slotAttachment: Attachment = slot.getAttachment();
        if (!(slotAttachment instanceof VertexAttachment) || !(<VertexAttachment>slotAttachment).applyDeform(this.attachment)) {
            return;
        }

        const frames: ArrayLike<number> = this.frames;
        if (time < frames[0]) {
            // Time is before first frame.
            return;
        }

        const frameVertices: Array<ArrayLike<number>> = this.frameVertices;
        const vertexCount: number = frameVertices[0].length;

        const verticesArray: Array<number> = slot.attachmentVertices;
        if (verticesArray.length !== vertexCount) {
            // Don't mix from uninitialized slot vertices.
            alpha = 1;
        }
        const vertices: Array<number> = Utils.setArraySize(verticesArray, vertexCount);

        if (time >= frames[frames.length - 1]) {
            // Time is after last frame.
            const lastVertices: ArrayLike<number> = frameVertices[frames.length - 1];
            if (alpha < 1) {
                for (let i: number = 0; i < vertexCount; i++) {
                    vertices[i] += (lastVertices[i] - vertices[i]) * alpha;
                }
            } else {
                Utils.arrayCopy(lastVertices, 0, vertices, 0, vertexCount);
            }
            return;
        }

        // Interpolate between the previous frame and the current frame.
        const frame: number = Animation.binarySearch(frames, time);
        const prevVertices: ArrayLike<number> = frameVertices[frame - 1];
        const nextVertices: ArrayLike<number> = frameVertices[frame];
        const frameTime: number = frames[frame];
        const percent: number = this.getCurvePercent(frame - 1, 1 - (time - frameTime) / (frames[frame - 1] - frameTime));
        let prev: number;
        if (alpha < 1) {
            for (let i: number = 0; i < vertexCount; i++) {
                prev = prevVertices[i];
                vertices[i] += (prev + (nextVertices[i] - prev) * percent - vertices[i]) * alpha;
            }
        } else {
            for (let i: number = 0; i < vertexCount; i++) {
                prev = prevVertices[i];
                vertices[i] = prev + (nextVertices[i] - prev) * percent;
            }
        }
    }
}
export default DeformTimeline;
