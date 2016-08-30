import ITimeline from './timeline/ITimeline';
import Skeleton from './Skeleton';
import Event from './events/Event';
class Animation {
    public name: string;
    public timelines: Array<ITimeline>;
    public duration: number;

    constructor (name: string, timelines: Array<ITimeline>, duration: number) {
        if (name === null) {
            throw new Error('name cannot be null.');
        }
        if (timelines === null) {
            throw new Error('timelines cannot be null.');
        }
        this.name = name;
        this.timelines = timelines;
        this.duration = duration;
    }

    public apply (skeleton: Skeleton, lastTime: number, time: number, loop: boolean, events: Array<Event>): void {
        if (skeleton === null) {
            throw new Error('skeleton cannot be null.');
        }

        if (loop && this.duration !== 0) {
            time %= this.duration;
            if (lastTime > 0) {
                lastTime %= this.duration;
            }
        }

        const timelines: Array<ITimeline> = this.timelines;
        for (let i: number = 0, n: number = timelines.length; i < n; i++) {
            timelines[i].apply(skeleton, lastTime, time, events, 1);
        }
    }

    public mix (skeleton: Skeleton, lastTime: number, time: number, loop: boolean, events: Array<Event>, alpha: number): void {
        if (skeleton === null) {
            throw new Error('skeleton cannot be null.');
        }

        if (loop && this.duration !== 0) {
            time %= this.duration;
            if (lastTime > 0) {
                lastTime %= this.duration;
            }
        }

        const timelines: Array<ITimeline> = this.timelines;
        for (let i: number = 0, n: number = timelines.length; i < n; i++) {
            timelines[i].apply(skeleton, lastTime, time, events, alpha);
        }
    }

    public static binarySearch (values: ArrayLike<number>, target: number, step: number = 1): number {
        let low: number = 0;
        let high: number = values.length / step - 2;
        if (high === 0) {
            return step;
        }
        let current: number = high >>> 1;
        while (true) {
            if (values[(current + 1) * step] <= target) {
                low = current + 1;
            } else {
                high = current;
            }

            if (low === high) {
                return (low + 1) * step;
            }
            current = (low + high) >>> 1;
        }
    }

    public static linearSearch (values: ArrayLike<number>, target: number, step: number): number {
        for (let i: number = 0, last: number = values.length - step; i <= last; i += step) {
            if (values[i] > target) {
                return i;
            }
        }
        return -1;
    }
}
export default Animation;
