import Skeleton from '../Skeleton';
import Event from '../events/Event';
interface ITimeline {
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number): void;
}
export default ITimeline;
