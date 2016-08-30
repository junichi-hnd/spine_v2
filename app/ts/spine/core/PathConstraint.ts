/**
 * Created by honda on 2016/08/24.
 */
import IUpdatable from './IUpdatable';
import PathConstraintData from './PathConstraintData';
import Bone from './Bone';
import Slot from './Slot';
import Skeleton from './Skeleton';
import Attachment from "./attachments/Attachment";
import PathAttachment from './attachments/PathAttachment';
import { SpacingMode, RotateMode, PositionMode } from "./PathConstraintData";
import Utils from "../utils/Utils";
import MathUtils from "../utils/MathUtils";

class PathConstraint implements IUpdatable {
    public static NONE: number = -1;
    public static BEFORE: number = -2;
    public static AFTER: number = -3;

    public data: PathConstraintData;
    public bones: Array<Bone>;
    public target: Slot;
    public position: number;
    public spacing: number;
    public rotateMix: number;
    public translateMix: number;
    public spaces: Array<number>;
    public positions: Array<number>;
    public world: Array<number>;
    public curves: Array<number>;
    public lengths: Array<number>;
    public segments: Array<number>;

    constructor(data: PathConstraintData, skeleton: Skeleton) {
        if(data === null) {
            throw new Error('data cannot be null.');
        }
        if(skeleton === null) {
            throw new Error('skeleton cannot be null.');
        }
        this.data = data;
        this.bones = [];
        this.position = 0;
        this.spacing = 0;
        this.rotateMix = 0;
        this.translateMix = 0;
        this.spaces = [];
        this.positions = [];
        this.world = [];
        this.curves = [];
        this.lengths = [];
        this.segments = [];

        for(let i: number = 0; i < data.bones.length; i++) {
            this.bones[i] = skeleton.findBone(data.bones[i].name);
        }
        this.target = skeleton.findSlot(data.target.name);
        this.position = data.position;
        this.spacing = data.spacing;
        this.rotateMix = data.rotateMix;
        this.translateMix = data.translateMix;
    }

    public apply(): void {
        this.update();
    }

    public update(): void {
        const attachment: Attachment = this.target.getAttachment();
        if(!(attachment instanceof PathAttachment)) {
            return;
        }
        const rotateMix: number = this.rotateMix;
        const translateMix: number = this.translateMix;
        const translate: boolean = translateMix > 0;
        const rotate: boolean = rotateMix > 0;
        if (!translate && !rotate) {
            return;
        }

        const data: PathConstraintData = this.data;
        const spacingMode: SpacingMode = data.spacingMode;
        const lengthSpacing: boolean = spacingMode === SpacingMode.Length;
        const rotateMode: RotateMode = data.rotateMode;
        const tangents: boolean = rotateMode === RotateMode.Tangent;
        const scale: boolean = rotateMode === RotateMode.ChainScale;
        const boneCount: number = this.bones.length;
        const spacesCount: number = tangents ? boneCount : boneCount + 1;
        const bones: Array<Bone> = this.bones;
        const spaces: any = Utils.setArraySize(this.spaces, spacesCount);
        let lengths: Array<number> = null;
        const spacing: number = this.spacing;

        if (scale || lengthSpacing) {
            if (scale) {
                lengths = Utils.setArraySize(this.lengths, boneCount);
            }
            for (let i: number = 0, n: number = spacesCount - 1; i < n;) {
                const bone: Bone = bones[i];
                let length: number = bone.data.length;
                const x: number = length * bone.a;
                const y: number = length * bone.c;
                length = Math.sqrt(x * x + y * y);
                if (scale) {
                    lengths[i] = length;
                }
                spaces[++i] = lengthSpacing ? Math.max(0, length + spacing) : spacing;
            }
        } else {
            for (let i: number = 1; i < spacesCount; i++) {
                spaces[i] = spacing;
            }
        }
        const percentPosition: boolean = data.positionMode === PositionMode.Percent;
        const percentSpacing: boolean = spacingMode === SpacingMode.Percent;
        const positions: boolean = this.computeWorldPositions(<PathAttachment>attachment, spacesCount, tangents, percentPosition, percentSpacing);
        const skeleton: Skeleton = this.target.bone.skeleton;
        const skeletonX: number = skeleton.x;
        const skeletonY: number = skeleton.y;
        let boneX: number = positions[0], boneY: number = positions[1];
        const offsetRotation: number = data.offsetRotation;
        const tip: boolean = (rotateMode === RotateMode.Chain && offsetRotation === 0);
        for (let i: number = 0, p: number = 3; i < boneCount; i++, p += 3) {
            const bone: Bone = bones[i];
            bone.worldX += (boneX - skeletonX - bone.worldX) * translateMix;
            bone.worldY += (boneY - skeletonY - bone.worldY) * translateMix;
            const x: number = positions[p];
            const y: number = positions[p + 1];
            const dx: number = x - boneX;
            const dy: number = y - boneY;
            if(scale) {
                const length: number = lengths[i];
                if(length > 0) {
                    const s: number = (Math.sqrt(dx * dx + dy * dy) / length - 1) * rotateMix + 1;
                    bone.a *= s;
                    bone.c *= s;
                }
            }
            boneX = x;
            boneY = y;
            if (rotate) {
                let a: number = bone.a, b: number = bone.b, c: number = bone.c, d: number = bone.d, r: number = 0, cos: number = 0, sin: number = 0;
                if(tangents) {
                    r = positions[p - 1];
                } else if(spaces[i + 1] === 0) {
                    r = positions[p + 2];
                } else {
                    r = Math.atan2(dy, dx);
                }
                r -= Math.atan2(c, a) - offsetRotation * MathUtils.degRad;
                if(tip) {
                    cos = Math.cos(r);
                    sin = Math.sin(r);
                    const boneNum: number = bone.data.length;
                    boneX += (boneNum * (cos * a - sin * c) - dx) * rotateMix;
                    boneY += (boneNum * (sin * a + cos * c) - dy) * rotateMix;
                }
                if(r > MathUtils.PI) {
                    r -= MathUtils.PI2;
                } else if(r < -MathUtils.PI) {
                    r += MathUtils.PI2;
                }
                r *= rotateMix;
                cos = Math.cos(r);
                sin = Math.sin(r);
                bone.a = cos * a - sin * c;
                bone.b = cos * b - sin * d;
                bone.c = sin * a + cos * c;
                bone.d = sin * b + cos * d;
            }
        }
    }

    public computeWorldPositions(path: PathAttachment, spacesCount: number, tangents: boolean, percentPosition: boolean,
                                 percentSpacing: boolean): any {
        const target: Slot = this.target;
        let position: number = this.position;
        const spaces: Array<number> = this.spaces;
        const out: any = Utils.setArraySize(this.positions, spacesCount * 3 + 2);
        let world: Array<number> = null;
        const closed: boolean = path.closed;
        let verticesLength: number = path.worldVerticesLength;
        let curveCount: number = verticesLength / 6;
        let prevCurve: number = PathConstraint.NONE;

        if(!path.constantSpeed) {
            const lengths: Array<number> = path.lengths;
            curveCount -= closed ? 1 : 2;
            let pathLength: number = lengths[curveCount];
            if (percentPosition) {
                position *= pathLength;
            }
            if (percentSpacing) {
                for(let i: number = 0; i < spacesCount; i++) {
                    spaces[i] *= pathLength;
                }
            }
            world = Utils.setArraySize(this.world, 8);
            for (let i: number = 0, o: number = 0, curve: number = 0; i < spacesCount; i++, o += 3) {
                const space: number = spaces[i];
                position += space;
                let p: number = position;

                if (closed) {
                    p %= pathLength;
                    if (p < 0) {
                        p += pathLength;
                    }
                    curve = 0;
                } else if (p < 0) {
                    if (prevCurve !== PathConstraint.BEFORE) {
                        prevCurve = PathConstraint.BEFORE;
                        path.computeWorldVerticesWith(target, 2, 4, world, 0);
                    }
                    this.addBeforePosition(p, world, 0, out, o);
                    continue;
                } else if (p > pathLength) {
                    if (prevCurve !== PathConstraint.AFTER) {
                        prevCurve = PathConstraint.AFTER;
                        path.computeWorldVerticesWith(target, verticesLength - 6, 4, world, 0);
                    }
                    this.addAfterPosition(p - pathLength, world, 0, out, o);
                    continue;
                }

                // Determine curve containing position.
                for (;; curve++) {
                    const length: number = lengths[curve];
                    if (p > length) {
                        continue;
                    }
                    if (curve == 0)
                        p /= length;
                    else {
                        const prev: number = lengths[curve - 1];
                        p = (p - prev) / (length - prev);
                    }
                    break;
                }
                if (curve !== prevCurve) {
                    prevCurve = curve;

                    if (closed && curve === curveCount) {
                        path.computeWorldVerticesWith(target, verticesLength - 4, 4, world, 0);
                        path.computeWorldVerticesWith(target, 0, 4, world, 4);
                    } else {
                        path.computeWorldVerticesWith(target, curve * 6 + 2, 8, world, 0);
                    }
                }
                this.addCurvePosition(p, world[0], world[1], world[2], world[3], world[4], world[5], world[6], world[7], out, o,
                    tangents || (i > 0 && space == 0));
            }
            return out;
        }
        // World vertices.
        if (closed) {
            verticesLength += 2;
            world = Utils.setArraySize(this.world, verticesLength);
            path.computeWorldVerticesWith(target, 2, verticesLength - 4, world, 0);
            path.computeWorldVerticesWith(target, 0, 2, world, verticesLength - 4);
            world[verticesLength - 2] = world[0];
            world[verticesLength - 1] = world[1];
        } else {
            curveCount--;
            verticesLength -= 4;
            world = Utils.setArraySize(this.world, verticesLength);
            path.computeWorldVerticesWith(target, 2, verticesLength, world, 0);
        }

        // Curve lengths.
        let curves: Array<number> = Utils.setArraySize(this.curves, curveCount);
        let pathLength: number = 0;
        let x1: number = world[0], y1: number = world[1], cx1: number = 0, cy1: number = 0, cx2: number = 0, cy2: number = 0, x2: number = 0, y2: number = 0;
        let tmpx: number = 0, tmpy: number = 0, dddfx: number = 0, dddfy: number = 0, ddfx: number = 0, ddfy: number = 0, dfx: number = 0, dfy: number = 0;
        for (let i: number = 0, w: number = 2; i < curveCount; i++, w += 6) {
            cx1 = world[w];
            cy1 = world[w + 1];
            cx2 = world[w + 2];
            cy2 = world[w + 3];
            x2 = world[w + 4];
            y2 = world[w + 5];
            tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
            tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
            dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
            dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
            ddfx = tmpx * 2 + dddfx;
            ddfy = tmpy * 2 + dddfy;
            dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
            dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
            pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
            dfx += ddfx;
            dfy += ddfy;
            ddfx += dddfx;
            ddfy += dddfy;
            pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
            dfx += ddfx;
            dfy += ddfy;
            pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
            dfx += ddfx + dddfx;
            dfy += ddfy + dddfy;
            pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
            curves[i] = pathLength;
            x1 = x2;
            y1 = y2;
        }

        if (percentPosition) {
            position *= pathLength;
        }
        if (percentSpacing) {
            for (let i: number = 0; i < spacesCount; i++) {
                spaces[i] *= pathLength;
            }
        }

        const segments: Array<number> = this.segments;
        let curveLength: number = 0;
        for (let i: number = 0, o: number = 0, curve: number = 0, segment: number = 0; i < spacesCount; i++, o += 3) {
            const space: number = spaces[i];
            position += space;
            let p: number = position;

            if (closed) {
                p %= pathLength;
                if (p < 0) {
                    p += pathLength;
                }
                curve = 0;
            } else if (p < 0) {
                this.addBeforePosition(p, world, 0, out, o);
                continue;
            } else if (p > pathLength) {
                this.addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
                continue;
            }
            // Determine curve containing position.
            for (;; curve++) {
                const length: number = curves[curve];
                if (p > length) continue;
                if (curve === 0) {
                    p /= length;
                } else {
                    const prev: number = curves[curve - 1];
                    p = (p - prev) / (length - prev);
                }
                break;
            }

            // Curve segment lengths.
            if (curve !== prevCurve) {
                prevCurve = curve;
                let ii: number = curve * 6;
                x1 = world[ii];
                y1 = world[ii + 1];
                cx1 = world[ii + 2];
                cy1 = world[ii + 3];
                cx2 = world[ii + 4];
                cy2 = world[ii + 5];
                x2 = world[ii + 6];
                y2 = world[ii + 7];
                tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
                tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
                dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.006;
                dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.006;
                ddfx = tmpx * 2 + dddfx;
                ddfy = tmpy * 2 + dddfy;
                dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
                dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
                curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
                segments[0] = curveLength;
                for (ii = 1; ii < 8; ii++) {
                    dfx += ddfx;
                    dfy += ddfy;
                    ddfx += dddfx;
                    ddfy += dddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[ii] = curveLength;
                }
                dfx += ddfx;
                dfy += ddfy;
                curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                segments[8] = curveLength;
                dfx += ddfx + dddfx;
                dfy += ddfy + dddfy;
                curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                segments[9] = curveLength;
                segment = 0;
            }
            // Weight by segment length.
            p *= curveLength;
            for (;; segment++) {
                const length: number = segments[segment];
                if (p > length) {
                    continue;
                }
                if (segment === 0) {
                    p /= length;
                } else {
                    const prev: number = segments[segment - 1];
                    p = segment + (p - prev) / (length - prev);
                }
                break;
            }
            this.addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || (i > 0 && space == 0));
        }
        return out;
    }

    public addBeforePosition (p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void {
        const x1: number = temp[i];
        const y1: number = temp[i + 1];
        const dx: number = temp[i + 2] - x1;
        const dy: number = temp[i + 3] - y1;
        const r: number = Math.atan2(dy, dx);
        out[o] = x1 + p * Math.cos(r);
        out[o + 1] = y1 + p * Math.sin(r);
        out[o + 2] = r;
    }

    public addAfterPosition (p: number, temp: Array<number>, i: number, out: Array<number>, o: number): void {
        const x1: number = temp[i + 2];
        const y1: number = temp[i + 3];
        const dx: number = x1 - temp[i];
        const dy: number = y1 - temp[i + 1];
        const r: number = Math.atan2(dy, dx);
        out[o] = x1 + p * Math.cos(r);
        out[o + 1] = y1 + p * Math.sin(r);
        out[o + 2] = r;
    }

    public addCurvePosition (p: number, x1: number, y1: number, cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number,
                             out: Array<number>, o: number, tangents: boolean): void {

        if (p === 0) {
            p = 0.0001;
        }

        const tt: number = p * p;
        const ttt: number = tt * p;
        const u: number = 1 - p;
        const uu: number = u * u;
        const uuu: number = uu * u;
        const ut: number = u * p;
        const ut3: number = ut * 3;
        const uut3: number = u * ut3;
        const utt3: number = ut3 * p;
        const x: number = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt;
        const y: number = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
        out[o] = x;
        out[o + 1] = y;
        if (tangents) {
            out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
        }
    }
}
export default PathConstraint;
