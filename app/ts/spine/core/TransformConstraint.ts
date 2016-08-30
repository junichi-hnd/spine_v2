/******************************************************************************
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
 *****************************************************************************/

import IUpdatable from './IUpdatable';
import TransformConstraintData from './TransformConstraintData';
import Bone from './Bone';
import Vector2 from '../utils/Vector2';
import Skeleton from './Skeleton';
import MathUtils from "../utils/MathUtils";

class TransformConstraint implements IUpdatable {
    public data: TransformConstraintData;
    public bones: Array<Bone>;
    public target: Bone;
    public rotateMix: number;
    public translateMix: number;
    public scaleMix: number;
    public shearMix: number;
    public temp: Vector2;

    constructor (data: TransformConstraintData, skeleton: Skeleton) {
        if(data === null) {
            throw new Error('data cannot be null.');
        }
        if(skeleton === null) {
            throw new Error('skeleton cannot be null.');
        }
        this.data = data;
        this.rotateMix = data.rotateMix;
        this.translateMix = data.translateMix;
        this.scaleMix = data.scaleMix;
        this.shearMix = data.shearMix;
        this.bones = new Array<Bone>();
        for(let i: number = 0; i < data.bones.length; i++) {
            this.bones.push(skeleton.findBone(data.bones[i].name));
        }
        this.target = skeleton.findBone(data.target.name);
    }

    apply(): void {
        this.update();
    }

    update(): void {
        let rotateMix: number = this.rotateMix, translateMix: number = this.translateMix, scaleMix: number = this.scaleMix, shearMix: number = this.shearMix;
        const target: Bone = this.target;
        let ta: number = target.a, tb: number = target.b, tc: number = target.c, td: number = target.d;
        let bones:Array<Bone> = this.bones;
        for (let i: number = 0, n: number = bones.length; i < n; i++) {
            let bone: Bone = bones[i];

            if (rotateMix > 0) {
                let a: number = bone.a, b: number = bone.b, c: number = bone.c, d: number = bone.d;
                let r: number = Math.atan2(tc, ta) - Math.atan2(c, a) + this.data.offsetRotation * MathUtils.degRad;
                if (r > MathUtils.PI) {
                    r -= MathUtils.PI2;
                } else if (r < -MathUtils.PI) {
                    r += MathUtils.PI2;
                }
                r *= rotateMix;
                let cos: number = Math.cos(r), sin: number = Math.sin(r);
                bone.a = cos * a - sin * c;
                bone.b = cos * b - sin * d;
                bone.c = sin * a + cos * c;
                bone.d = sin * b + cos * d;
            }

            if (translateMix > 0) {
                let temp: Vector2 = this.temp;
                target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
                bone.worldX += (temp.x - bone.worldX) * translateMix;
                bone.worldY += (temp.y - bone.worldY) * translateMix;
            }

            if (scaleMix > 0) {
                let bs: number = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
                let ts: number = Math.sqrt(ta * ta + tc * tc);
                let s: number = bs > 0.00001 ? (bs + (ts - bs + this.data.offsetScaleX) * scaleMix) / bs : 0;
                bone.a *= s;
                bone.c *= s;
                bs = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
                ts = Math.sqrt(tb * tb + td * td);
                s = bs > 0.00001 ? (bs + (ts - bs + this.data.offsetScaleY) * scaleMix) / bs : 0;
                bone.b *= s;
                bone.d *= s;
            }

            if (shearMix > 0) {
                let b: number = bone.b, d: number = bone.d;
                let by: number = Math.atan2(d, b);
                let r: number = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(bone.c, bone.a));
                if (r > MathUtils.PI) {
                    r -= MathUtils.PI2;
                } else if (r < -MathUtils.PI) {
                    r += MathUtils.PI2;
                }
                r = by + (r + this.data.offsetShearY * MathUtils.degRad) * shearMix;
                let s: number = Math.sqrt(b * b + d * d);
                bone.b = Math.cos(r) * s;
                bone.d = Math.sin(r) * s;
            }
        }
    }
}
export default TransformConstraint;
