import IAnimationStateListener from './IAnimationStateListener';
abstract class AnimationStateAdapter implements IAnimationStateListener {
    public complete(trackIndex: number, loopCount: number): void {}
    public start(trackIndex: number): void {}
    public end(trackIndex: number): void {}
    public event(trackIndex: number, event: Event): void {}
}
export default AnimationStateAdapter;
