/*
 * Spine Runtimes Software License
 * Version 2.5
 *
 * Copyright (c) 2013-2016, Esoteric Software
 * All rights reserved.
 *
 * You are granted a perpetual, non-exclusive, non-sublicensable, and
 * non-transferable license to use, install, execute, and perform the Spine
 * Runtimes software and derivative works solely for personal or internal
 * use. Without the written permission of Esoteric Software (see Section 2 of
 * the Spine Software License Agreement), you may not (a) modify, translate,
 * adapt, or develop new applications using the Spine Runtimes or otherwise
 * create derivative works or improvements of the Spine Runtimes or (b) remove,
 * delete, alter, or obscure any trademarks or any copyright, trademark, patent,
 * or other intellectual property or proprietary rights notices on or in the
 * Software, including any copy thereof. Redistributions in binary or source
 * form must include this license and terms.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE 'AS IS' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS INTERRUPTION, OR LOSS OF
 * USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
import VertexAttachment from './VertexAttachment';
import TextureRegion from '../texture/TextureRegion';
import Color from '../../utils/Color';
import Utils from '../../utils/Utils';
import Slot from '../Slot';
import Skeleton from '../Skeleton';
import Bone from '../Bone';

class MeshAttachment extends VertexAttachment {
    public region: TextureRegion;
    public path: string;
    public regionUVs: ArrayLike<number>;
    public worldVertices: ArrayLike<number>;
    public triangles: Array<number>;
    public color: Color;
    public hullLength: number;
    public inheritDeform: boolean;
    public tempColor: Color;

    private parentMesh: MeshAttachment;

    constructor (name: string) {
        super(name);
        this.color = new Color(1, 1, 1, 1);
        this.tempColor = new Color(0, 0, 0, 0);
    }

    public updateUVs(): void {
        const regionUVs: ArrayLike<number>  = this.regionUVs;
        const verticesLength: number = regionUVs.length;
        const worldVerticesLength: number = (verticesLength >> 1) * 8;
        if(this.worldVertices === null || this.worldVertices.length !== worldVerticesLength) {
            this.worldVertices = Utils.newFloatArray(worldVerticesLength);
        }
        let u: number = 0, v: number = 0, width: number = 0, height: number = 0;
        if (this.region === null) {
            u = v = 0;
            width = height = 1;
        } else {
            u = this.region.u;
            v = this.region.v;
            width = this.region.u2 - u;
            height = this.region.v2 - v;
        }

        if (this.region.rotate) {
            for (let i: number = 0, w: number = 6; i < verticesLength; i += 2, w += 8) {
                this.worldVertices[w] = u + regionUVs[i + 1] * width;
                this.worldVertices[w + 1] = v + height - regionUVs[i] * height;
            }
        } else {
            for (let i: number = 0, w: number = 6; i < verticesLength; i += 2, w += 8) {
                this.worldVertices[w] = u + regionUVs[i] * width;
                this.worldVertices[w + 1] = v + regionUVs[i + 1] * height;
            }
        }
    }

    public updateWorldVertices(slot: Slot, premultipliedAlpha: boolean): ArrayLike<number> {
        const skeleton: Skeleton = slot.bone.skeleton;
        const skeletonColor: Color = skeleton.color;
        const slotColor: Color = slot.color;
        const meshColor: Color = this.color;
        const alpha: number = skeletonColor.a * slotColor.a * meshColor.a;
        const multiplier: number = premultipliedAlpha ? alpha : 1;
        const color: Color = this.tempColor;

        color.set(skeletonColor.r * slotColor.r * meshColor.r * multiplier,
            skeletonColor.g * slotColor.g * meshColor.g * multiplier,
            skeletonColor.b * slotColor.b * meshColor.b * multiplier,
            alpha);

        let x: number = skeleton.x;
        let y: number = skeleton.y;
        const deformArray: Array<number> = slot.attachmentVertices;
        let vertices: ArrayLike<number> = this.vertices;
        const worldVertices: ArrayLike<number> = this.worldVertices;
        const bones: Array<number> = this.bones;
        if(bones === null) {
            const verticesLength: number = vertices.length;
            if(deformArray.length > 0) {
                vertices = deformArray;
            }
            const bone: Bone = slot.bone;
            x += bone.worldX;
            y += bone.worldY;
            const a: number = bone.a;
            const b: number = bone.b;
            const c: number = bone.c;
            const d: number = bone.d;
            for(let v: number = 0, w: number = 0; v < verticesLength; v+= 2, w += 8) {
                const vx: number = vertices[v];
                const vy: number = vertices[v + 1];
                worldVertices[w] = vx * a + vy * b + x;
                worldVertices[w + 1] = vx * c + vy * d + y;
                worldVertices[w + 2] = color.r;
                worldVertices[w + 3] = color.g;
                worldVertices[w + 4] = color.b;
                worldVertices[w + 5] = color.a;
            }
            return worldVertices;
        }
        const skeletonBones: Array<Bone> = skeleton.bones;
        let wx: number, wy: number, nn: number;
        let bone: Bone;
        let vx: number, vy: number, weight: number;
        if(deformArray.length === 0) {
            for (let w: number = 0, v: number = 0, b: number = 0, n: number = bones.length; v < n; w += 8) {
                /*let wx: number = x, wy: number = y;
                let nn: number = bones[v++] + v;*/
                wx = x;
                wy = y;
                nn = bones[v++] + v;
                for (; v < nn; v++, b += 3) {
                    /*const bone: Bone = skeletonBones[bones[v]];
                    const vx: number = vertices[b];
                    const vy: number = vertices[b + 1];
                    const weight: number = vertices[b + 2];*/
                    bone = skeletonBones[bones[v]];
                    vx = vertices[b];
                    vy = vertices[b + 1];
                    weight = vertices[b + 2];
                    wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                    wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                }
                worldVertices[w] = wx;
                worldVertices[w + 1] = wy;
                worldVertices[w + 2] = color.r;
                worldVertices[w + 3] = color.g;
                worldVertices[w + 4] = color.b;
                worldVertices[w + 5] = color.a;
            }
        } else {
            const deform: Array<number> = deformArray;
            for (let w: number = 0, v: number = 0, b: number = 0, f: number = 0, n: number = bones.length; v < n; w += 8) {
                wx = x;
                wy = y;
                nn = bones[v++] + v;
                for (; v < nn; v++, b += 3, f += 2) {
                    bone = skeletonBones[bones[v]];
                    vx = vertices[b] + deform[f];
                    vy = vertices[b + 1] + deform[f + 1];
                    weight = vertices[b + 2];
                    wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                    wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                }
                worldVertices[w] = wx;
                worldVertices[w + 1] = wy;
                worldVertices[w + 2] = color.r;
                worldVertices[w + 3] = color.g;
                worldVertices[w + 4] = color.b;
                worldVertices[w + 5] = color.a;
            }
        }
        return worldVertices;
    }

    public applyDeform(sourceAttachment: VertexAttachment): boolean {
        return this === sourceAttachment || (this.inheritDeform && this.parentMesh === sourceAttachment);
    }

    public getParentMesh(): MeshAttachment {
        return this.parentMesh;
    }

    /**
     *
     * @param parentMesh    may be null.
     */
    public setParentMesh(parentMesh: MeshAttachment): void {
        this.parentMesh = parentMesh;
        if(parentMesh !== null) {
            this.bones = parentMesh.bones;
            this.vertices = parentMesh.vertices;
            this.regionUVs = parentMesh.regionUVs;
            this.triangles = parentMesh.triangles;
            this.hullLength = parentMesh.hullLength;
        }
    }
}
export default MeshAttachment;
