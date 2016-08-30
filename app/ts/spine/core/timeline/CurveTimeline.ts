import ITimeline from './ITimeline';
import Utils from '../../utils/Utils';
import MathUtils from '../../utils/MathUtils';
import Skeleton from '../Skeleton';

abstract class CurveTimeline implements ITimeline {
    public static LINEAR: number = 0;
    public static STEPPED: number = 1;
    public static BEZIER: number = 2;
    public static BEZIER_SIZE: number = 10 * 2 - 1;

    private curves: ArrayLike<number>;

    constructor (frameCount: number) {
        if (frameCount <= 0) {
            throw new Error('frameCount must be > 0: ' + frameCount);
        }
        this.curves = Utils.newFloatArray((frameCount - 1) * CurveTimeline.BEZIER_SIZE);
    }

    public getFrameCount (): number {
        return this.curves.length / CurveTimeline.BEZIER_SIZE + 1;
    }

    public setLinear(frameIndex: number): void {
        this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.LINEAR;
    }

    public setStepped (frameIndex: number): void {
        this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.STEPPED;
    }

    public getCurveType (frameIndex: number): number {
        const index: number = frameIndex * CurveTimeline.BEZIER_SIZE;
        if (index === this.curves.length) {
            return CurveTimeline.LINEAR;
        }
        const type: number = this.curves[index];
        if (type === CurveTimeline.LINEAR) {
            return CurveTimeline.LINEAR;
        }
        if (type === CurveTimeline.STEPPED) {
            return CurveTimeline.STEPPED;
        }
        return CurveTimeline.BEZIER;
    }

    /**
     * Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
     * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
     * the difference between the keyframe's values.
     * @param frameIndex
     * @param cx1
     * @param cy1
     * @param cx2
     * @param cy2
     */
    public setCurve (frameIndex: number, cx1: number, cy1: number, cx2: number, cy2: number): void {
        const tmpx: number = (-cx1 * 2 + cx2) * 0.03;
        const tmpy: number = (-cy1 * 2 + cy2) * 0.03;
        const dddfx: number = ((cx1 - cx2) * 3 + 1) * 0.006;
        const dddfy: number = ((cy1 - cy2) * 3 + 1) * 0.006;
        let ddfx: number = tmpx * 2 + dddfx, ddfy: number = tmpy * 2 + dddfy;
        let dfx: number = cx1 * 0.3 + tmpx + dddfx * 0.16666667, dfy: number = cy1 * 0.3 + tmpy + dddfy * 0.16666667;
        let i: number = frameIndex * CurveTimeline.BEZIER_SIZE;
        let curves: ArrayLike<number> = this.curves;
        curves[i++] = CurveTimeline.BEZIER;
        let x: number = dfx, y: number = dfy;
        for (let n: number = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
            curves[i] = x;
            curves[i + 1] = y;
            dfx += ddfx;
            dfy += ddfy;
            ddfx += dddfx;
            ddfy += dddfy;
            x += dfx;
            y += dfy;
        }
    }

    public getCurvePercent (frameIndex: number, percent: number): number {
        percent = MathUtils.clamp(percent, 0, 1);
        const curves: ArrayLike<number> = this.curves;
        let i: number = frameIndex * CurveTimeline.BEZIER_SIZE;
        const type: number = curves[i];
        if (type === CurveTimeline.LINEAR) {
            return percent;
        }
        if (type === CurveTimeline.STEPPED) {
            return 0;
        }
        i++;
        let x: number = 0;
        for (let start: number = i, n: number = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
            x = curves[i];
            if (x >= percent) {
                let prevX: number, prevY: number;
                if (i === start) {
                    prevX = 0;
                    prevY = 0;
                } else {
                    prevX = curves[i - 2];
                    prevY = curves[i - 1];
                }
                return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);
            }
        }
        const y: number = curves[i - 1];
        return y + (1 - y) * (percent - x) / (1 - x); // Last point is 1,1.
    }

    public abstract apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number): void;
}
export default CurveTimeline;
