import Event from './events/Event';
interface IAnimationStateListener {
    event(trackIndex: number, event: Event): void;
    complete(trackIndex: number, loopCount: number): void;
    start(trackIndex: number): void;
    end(trackIndex: number): void;
}
export default IAnimationStateListener;
