import Attachment from './Attachment';
import Bone from '../Bone';
import Slot from '../Slot';
import Skeleton from '../Skeleton';

abstract class VertexAttachment extends Attachment {
    public bones: Array<number>;
    public vertices: ArrayLike<number>;
    public worldVerticesLength: number;

    constructor (name: string) {
        super(name);
        this.worldVerticesLength = 0;
    }

    public computeWorldVertices(slot: Slot, worldVertices: ArrayLike<number>): void {
        this.computeWorldVerticesWith(slot, 0, this.worldVerticesLength, worldVertices, 0);
    }

    /**
     * Transforms local vertices to world coordinates.
     * @param slot
     * @param start The index of the first local vertex value to transform. Each vertex has 2 values, x and y.
     * @param count The number of world vertex values to output. Must be <= {@link #getWorldVerticesLength()} - start.
     * @param worldVertices The output world vertices. Must have a length >= offset + count.
     * @param offset The worldVertices index to begin writing values.
     */
    public computeWorldVerticesWith(slot: Slot, start: number, count: number, worldVertices: ArrayLike<number>, offset: number): void {
        count += offset;
        let skeleton: Skeleton = slot.bone.skeleton;
        let x: number = skeleton.x, y: number = skeleton.y;
        let deformArray: Array<number> = slot.attachmentVertices;
        let vertices: ArrayLike<number> = this.vertices;
        let bones: Array<number> = this.bones;
        if (bones === null) {
            if (deformArray.length > 0) {
                vertices = deformArray;
            }
            let bone: Bone = slot.bone;
            x += bone.worldX;
            y += bone.worldY;
            let a: number = bone.a, b: number = bone.b, c: number = bone.c, d: number = bone.d;
            for (let v: number = start, w: number = offset; w < count; v += 2, w += 2) {
                const vx: number = vertices[v];
                const vy: number = vertices[v + 1];
                worldVertices[w] = vx * a + vy * b + x;
                worldVertices[w + 1] = vx * c + vy * d + y;
            }
            return;
        }
        let v: number = 0, skip: number = 0;
        for (let i: number = 0; i < start; i += 2) {
            let n: number = bones[v];
            v += n + 1;
            skip += n;
        }
        let skeletonBones: Array<Bone> = skeleton.bones;
        if (deformArray.length === 0) {
            for (let w: number = offset, b: number = skip * 3; w < count; w += 2) {
                let wx: number = x, wy: number = y;
                let n: number = bones[v++];
                n += v;
                for (; v < n; v++, b += 3) {
                    let bone: Bone = skeletonBones[bones[v]];
                    let vx: number = vertices[b], vy: number = vertices[b + 1], weight: number = vertices[b + 2];
                    wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                    wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                }
                worldVertices[w] = wx;
                worldVertices[w + 1] = wy;
            }
        } else {
            let deform: Array<number> = deformArray;
            for (let w: number = offset, b: number = skip * 3, f: number = skip << 1; w < count; w += 2) {
                let wx: number = x, wy: number = y;
                let n: number = bones[v++];
                n += v;
                for (; v < n; v++, b += 3, f += 2) {
                    let bone: Bone = skeletonBones[bones[v]];
                    let vx: number = vertices[b] + deform[f], vy: number = vertices[b + 1] + deform[f + 1], weight: number = vertices[b + 2];
                    wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                    wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                }
                worldVertices[w] = wx;
                worldVertices[w + 1] = wy;
            }
        }
    }

    /**
     * Returns true if a deform originally applied to the specified attachment should be applied to this attachment.
     * @param sourceAttachment
     * @returns {boolean}
     */
    public applyDeform (sourceAttachment: VertexAttachment): boolean {
        return this === sourceAttachment;
    }
}
export default VertexAttachment;
