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

import Attachment from './Attachment';
import Color from '../../utils/Color';
import TextureRegion from '../texture/TextureRegion';
import Utils from '../../utils/Utils';
import Slot from '../Slot';
import Skeleton from '../Skeleton';
import Bone from '../Bone';

class RegionAttachment extends Attachment {
    public static OX1: number = 0;
    public static OY1: number = 1;
    public static OX2: number = 2;
    public static OY2: number = 3;
    public static OX3: number = 4;
    public static OY3: number = 5;
    public static OX4: number = 6;
    public static OY4: number = 7;

    public static X1: number = 0;
    public static Y1: number = 1;
    public static C1R: number = 2;
    public static C1G: number = 3;
    public static C1B: number = 4;
    public static C1A: number = 5;
    public static U1: number = 6;
    public static V1: number = 7;

    public static X2: number = 8;
    public static Y2: number = 9;
    public static C2R: number = 10;
    public static C2G: number = 11;
    public static C2B: number = 12;
    public static C2A: number = 13;
    public static U2: number = 14;
    public static V2: number = 15;

    public static X3: number = 16;
    public static Y3: number = 17;
    public static C3R: number = 18;
    public static C3G: number = 19;
    public static C3B: number = 20;
    public static C3A: number = 21;
    public static U3: number = 22;
    public static V3: number = 23;

    public static X4: number = 24;
    public static Y4: number = 25;
    public static C4R: number = 26;
    public static C4G: number = 27;
    public static C4B: number = 28;
    public static C4A: number = 29;
    public static U4: number = 30;
    public static V4: number = 31;

    public x: number;
    public y: number;
    public scaleX: number;
    public scaleY: number;
    public rotation: number;
    public width: number;
    public height: number;
    public color: Color;
    public path: string;
    public rendererObject: any;
    public region: TextureRegion;
    public offset: ArrayLike<number>;// Utils.newFloatArray(8);
    public vertices: ArrayLike<number>;// Utils.newFloatArray(8 * 4);
    public tempColor: Color;

    constructor (name:string) {
        super(name);
        this.x = 0;
        this.y = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        this.width = 0;
        this.height = 0;
        this.color = new Color(1, 1, 1, 1);
        this.offset = Utils.newFloatArray(8);
        this.vertices = Utils.newFloatArray(8 * 4);
        this.tempColor = new Color(1, 1, 1, 1);
    }

    public setRegion(region: TextureRegion): void {
        const vertices: ArrayLike<number> = this.vertices;
        if(region.rotate) {
            vertices[RegionAttachment.U2] = region.u;
            vertices[RegionAttachment.V2] = region.v2;
            vertices[RegionAttachment.U3] = region.u;
            vertices[RegionAttachment.V3] = region.v;
            vertices[RegionAttachment.U4] = region.u2;
            vertices[RegionAttachment.V4] = region.v;
            vertices[RegionAttachment.U1] = region.u2;
            vertices[RegionAttachment.V1] = region.v2;
        } else {
            vertices[RegionAttachment.U1] = region.u;
            vertices[RegionAttachment.V1] = region.v2;
            vertices[RegionAttachment.U2] = region.u;
            vertices[RegionAttachment.V2] = region.v;
            vertices[RegionAttachment.U3] = region.u2;
            vertices[RegionAttachment.V3] = region.v;
            vertices[RegionAttachment.U4] = region.u2;
            vertices[RegionAttachment.V4] = region.v2;
        }
    }

    public updateOffset(): void {
        const regionScaleX: number = this.width / this.region.originalWidth * this.scaleX;
        const regionScaleY: number = this.height / this.region.originalHeight * this.scaleY;
        const localX: number = -this.width / 2 * this.scaleX + this.region.offsetX * regionScaleX;
        const localY: number = -this.height / 2 * this.scaleY + this.region.offsetY * regionScaleY;
        const localX2: number = localX + this.region.width * regionScaleX;
        const localY2: number = localY + this.region.height * regionScaleY;
        const radians: number = this.rotation * Math.PI / 180;
        const cos: number = Math.cos(radians);
        const sin: number = Math.sin(radians);
        const localXCos: number = localX * cos + this.x;
        const localXSin: number = localX * sin;
        const localYCos: number = localY * cos + this.y;
        const localYSin: number = localY * sin;
        const localX2Cos: number = localX2 * cos + this.x;
        const localX2Sin: number = localX2 * sin;
        const localY2Cos: number = localY2 * cos + this.y;
        const localY2Sin: number = localY2 * sin;
        const offset:ArrayLike<number> = this.offset;

        offset[RegionAttachment.OX1] = localXCos - localYSin;
        offset[RegionAttachment.OY1] = localYCos + localXSin;
        offset[RegionAttachment.OX2] = localXCos - localY2Sin;
        offset[RegionAttachment.OY2] = localY2Cos + localXSin;
        offset[RegionAttachment.OX3] = localX2Cos - localY2Sin;
        offset[RegionAttachment.OY3] = localY2Cos + localX2Sin;
        offset[RegionAttachment.OX4] = localX2Cos - localYSin;
        offset[RegionAttachment.OY4] = localYCos + localX2Sin;
    }

    public updateWorldVertices(slot: Slot, premultipliedAlpha: boolean): ArrayLike<number> {
        const skeleton: Skeleton = slot.bone.skeleton;
        const skeletonColor: Color = skeleton.color;
        const slotColor: Color = slot.color;
        const regionColor: Color = this.color;
        const alpha: number = skeletonColor.a * slotColor.a * regionColor.a;
        const multiplier: number = premultipliedAlpha ? alpha : 1;
        const color: Color = this.tempColor;
        color.set(skeletonColor.r * slotColor.r * regionColor.r * multiplier,
            skeletonColor.g * slotColor.g * regionColor.g * multiplier,
            skeletonColor.b * slotColor.b * regionColor.b * multiplier,
            alpha);

        const vertices: ArrayLike<number> = this.vertices;
        const offset: ArrayLike<number> = this.offset;
        const bone: Bone = slot.bone;
        const x: number = skeleton.x + bone.worldX;
        const y: number = skeleton.y + bone.worldY;
        const a: number = bone.a;
        const b: number = bone.b;
        const c: number = bone.c;
        const d: number = bone.d;
        let offsetX: number = 0;
        let offsetY: number = 0;

        offsetX = offset[RegionAttachment.OX1];
        offsetY = offset[RegionAttachment.OY1];
        vertices[RegionAttachment.X1] = offsetX * a + offsetY * b + x; // br
        vertices[RegionAttachment.Y1] = offsetX * c + offsetY * d + y;
        vertices[RegionAttachment.C1R] = color.r;
        vertices[RegionAttachment.C1G] = color.g;
        vertices[RegionAttachment.C1B] = color.b;
        vertices[RegionAttachment.C1A] = color.a;

        offsetX = offset[RegionAttachment.OX2];
        offsetY = offset[RegionAttachment.OY2];
        vertices[RegionAttachment.X2] = offsetX * a + offsetY * b + x; // bl
        vertices[RegionAttachment.Y2] = offsetX * c + offsetY * d + y;
        vertices[RegionAttachment.C2R] = color.r;
        vertices[RegionAttachment.C2G] = color.g;
        vertices[RegionAttachment.C2B] = color.b;
        vertices[RegionAttachment.C2A] = color.a;

        offsetX = offset[RegionAttachment.OX3];
        offsetY = offset[RegionAttachment.OY3];
        vertices[RegionAttachment.X3] = offsetX * a + offsetY * b + x; // ul
        vertices[RegionAttachment.Y3] = offsetX * c + offsetY * d + y;
        vertices[RegionAttachment.C3R] = color.r;
        vertices[RegionAttachment.C3G] = color.g;
        vertices[RegionAttachment.C3B] = color.b;
        vertices[RegionAttachment.C3A] = color.a;

        offsetX = offset[RegionAttachment.OX4];
        offsetY = offset[RegionAttachment.OY4];
        vertices[RegionAttachment.X4] = offsetX * a + offsetY * b + x; // ur
        vertices[RegionAttachment.Y4] = offsetX * c + offsetY * d + y;
        vertices[RegionAttachment.C4R] = color.r;
        vertices[RegionAttachment.C4G] = color.g;
        vertices[RegionAttachment.C4B] = color.b;
        vertices[RegionAttachment.C4A] = color.a;

        return vertices;
    }
}
export default RegionAttachment;
