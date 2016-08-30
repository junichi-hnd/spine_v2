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
import IkConstraintData from './IkConstraintData';
import Bone from './Bone';
import Skeleton from './Skeleton';
import MathUtils from '../utils/MathUtils';


class IkConstraint implements IUpdatable {
    public data: IkConstraintData;
    public bones: Array<Bone>;
    public target: Bone;
    public mix: number;
    public bendDirection: number;
    public level: number;

    constructor (data: IkConstraintData, skeleton: Skeleton) {
        if(data === null) {
            throw new Error('data cannot be null.');
        }

        if(skeleton === null) {
            throw new Error('skeleton cannot be null.');
        }
        this.data = data;
        this.mix = data.mix;
        this.bendDirection = data.bendDirection;
        this.bones = new Array<Bone>();
        for(let i: number = 0; i < data.bones.length; i++) {
            this.bones.push(skeleton.findBone(data.bones[i].name));
        }
        this.target = skeleton.findBone(data.target.name);
    }

    public apply(): void {
        this.update();
    }

    public update(): void {
        let target: Bone = this.target;
        let bones: Array<Bone> = this.bones;
        switch (bones.length) {
            case 1:
                this.apply1(bones[0], target.worldX, target.worldY, this.mix);
                break;
            case 2:
                this.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.mix);
                break;
        }
    }

    /**
     * Adjusts the bone rotation so the tip is as close to the target position as possible. The target is specified in the world
     * coordinate system.
     * @param bone
     * @param targetX
     * @param targetY
     * @param alpha
     */
    public apply1(bone: Bone, targetX: number, targetY: number, alpha: number): void {
        const pp: Bone = bone.parent;
        const id: number = 1 / (pp.a * pp.d - pp.b * pp.c);
        const x: number = targetX - pp.worldX;
        const y: number = targetY - pp.worldY;
        const tx: number = (x * pp.d - y * pp.b) * id - bone.x;
        const ty: number = (y * pp.a - x * pp.c) * id - bone.y;
        let rotationIK: number = Math.atan2(ty, tx) * MathUtils.radDeg - bone.shearX - bone.rotation;
        if(bone.scaleX < 0) {
            rotationIK += 180;
        }
        if(rotationIK > 180) {
            rotationIK -= 360;
        } else if(rotationIK < -180) {
            rotationIK += 360
        }
        bone.updateWorldTransformWith(bone.x, bone.y, bone.rotation + rotationIK * alpha, bone.scaleX, bone.scaleY, bone.shearX,
            bone.shearY);
    }

    /**
     * Adjusts the parent and child bone rotations so the tip of the child is as close to the target position as possible. The
     * target is specified in the world coordinate system.
     * @param parent
     * @param child         A direct descendant of the parent bone.
     * @param targetX
     * @param targetY
     * @param bendDir
     * @param alpha
     */
    public apply2 (parent: Bone, child: Bone, targetX: number, targetY: number, bendDir: number, alpha: number): void {
        if(alpha === 0) {
            child.updateWorldTransform();
            return;
        }
        let px: number = parent.x, py: number = parent.y, psx: number = parent.scaleX, psy: number = parent.scaleY, csx: number = child.scaleX;
        let os1: number = 0, os2: number = 0, s2: number = 0;
        if (psx < 0) {
            psx = -psx;
            os1 = 180;
            s2 = -1;
        } else {
            os1 = 0;
            s2 = 1;
        }

        if (psy < 0) {
            psy = -psy;
            s2 = -s2;
        }

        if (csx < 0) {
            csx = -csx;
            os2 = 180;
        } else {
            os2 = 0;
        }

        let cx: number = child.x, cy: number = 0, cwx: number = 0, cwy: number = 0, a: number = parent.a, b: number = parent.b, c: number = parent.c, d: number = parent.d;
        const u: boolean = Math.abs(psx - psy) <= 0.0001;

        if (!u) {
            cy = 0;
            cwx = a * cx + parent.worldX;
            cwy = c * cx + parent.worldY;
        } else {
            cy = child.y;
            cwx = a * cx + b * cy + parent.worldX;
            cwy = c * cx + d * cy + parent.worldY;
        }

        const pp: Bone = parent.parent;
        a = pp.a;
        b = pp.b;
        c = pp.c;
        d = pp.d;
        const id: number = 1 / (a * d - b * c);
        let x: number = targetX - pp.worldX, y: number = targetY - pp.worldY;
        const tx: number = (x * d - y * b) * id - px;
        const ty: number = (y * a - x * c) * id - py;
        x = cwx - pp.worldX;
        y = cwy - pp.worldY;
        const dx: number = (x * d - y * b) * id - px;
        const dy: number = (y * a - x * c) * id - py;
        const l1: number = Math.sqrt(dx * dx + dy * dy);
        let l2: number = child.data.length * csx;
        let a1: number = 0, a2: number = 0;
        outer:
        if(u) {
            l2 *= psx;
            let cos: number = (tx * tx + ty * ty - l1 * l1 - l2 * l2) / (2 * l1 * l2);
            if (cos < -1) {
                cos = -1;
            } else if(cos > 1) {
                cos = 1;
            }
            a2 = Math.acos(cos) * bendDir;
            a = l1 + l2 * cos;
            b = l2 * Math.sin(a2);
            a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
        } else {
            a = psx * l2;
            b = psy * l2;
            const aa: number = a * a;
            const bb: number = b * b;
            const dd: number = tx * tx + ty * ty;
            const ta: number = Math.atan2(ty, tx);
            c = bb * l1 * l1 + aa * dd - aa * bb;
            const c1: number = -2 * bb * l1;
            const c2: number = bb - aa;
            d = c1 * c1 - 4 * c2 * c;
            if (d >= 0) {
                let q: number = Math.sqrt(d);
                if (c1 < 0) {
                    q = -q;
                }
                q = -(c1 + q) * 0.5;
                const r0: number = q / c2;
                const r1: number = c / q;
                const r: number = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
                if (r * r <= dd) {
                    y = Math.sqrt(dd - r * r) * bendDir;
                    a1 = ta - Math.atan2(y, r);
                    a2 = Math.atan2(y / psy, (r - l1) / psx);
                    break outer;
                }
            }
            let minAngle: number = 0;
            let minDist: number = Number.MAX_VALUE,minX: number = 0, minY: number = 0;
            let maxAngle: number = 0, maxDist: number = 0, maxX: number = 0, maxY: number = 0;
            x = l1 + a;
            d = x * x;
            if(d > maxDist) {
                maxAngle = 0;
                maxDist = d;
                maxX = x;
            }
            x = l1 - a;
            d = x * x;
            if (d < minDist) {
                minAngle = MathUtils.PI;
                minDist = d;
                minX = x;
            }
            const angle: number = Math.acos(-a * l1 / (aa - bb));
            x = a * Math.cos(angle) + l1;
            y = b * Math.sin(angle);
            d = x * x + y * y;
            if (d < minDist) {
                minAngle = angle;
                minDist = d;
                minX = x;
                minY = y;
            }
            if (d > maxDist) {
                maxAngle = angle;
                maxDist = d;
                maxX = x;
                maxY = y;
            }
            if (dd <= (minDist + maxDist) * 0.5) {
                a1 = ta - Math.atan2(minY * bendDir, minX);
                a2 = minAngle * bendDir;
            } else {
                a1 = ta - Math.atan2(maxY * bendDir, maxX);
                a2 = maxAngle * bendDir;
            }
        }
        const os: number = Math.atan2(cy, cx) * s2;
        let rotation: number = parent.rotation;
        a1 = (a1 - os) * MathUtils.radDeg + os1 - rotation;
        if (a1 > 180) {
            a1 -= 360;
        } else if (a1 < -180) {
            a1 += 360;
        }
        parent.updateWorldTransformWith(px, py, rotation + a1 * alpha, parent.scaleX, parent.scaleY, 0, 0);
        rotation = child.rotation;
        a2 = ((a2 + os) * MathUtils.radDeg - child.shearX) * s2 + os2 - rotation;
        if (a2 > 180) {
            a2 -= 360;
        } else if (a2 < -180) {
            a2 += 360;
        }
        child.updateWorldTransformWith(cx, cy, rotation + a2 * alpha, child.scaleX, child.scaleY, child.shearX, child.shearY);
    }
}

export default IkConstraint;