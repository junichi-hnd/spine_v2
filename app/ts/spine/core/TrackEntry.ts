import IAnimationStateListener from './IAnimationStateListener';
import Animation from './Animation';
class TrackEntry {
    public next: TrackEntry;
    public previous: TrackEntry;

    public loop: boolean;
    public delay: number;
    public time: number;
    public lastTime: number;
    public endTime: number;
    public timeScale: number;
    public mixTime: number;
    public mixDuration: number;
    public listener: IAnimationStateListener;
    public mix: number;
    public animation: Animation;

    constructor() {
        //
        this.loop = false;
        this.delay = 0;
        this.time = 0;
        this.lastTime = -1;
        this.endTime = 0;
        this.timeScale = 1;
        this.mixTime = 0;
        this.mixDuration = 0;
        this.mix = 1;
    }

    public reset(): void {
        this.next = null;
        this.previous = null;
        this.animation = null;
        this.listener = null;
        this.timeScale = 1;
        this.lastTime = -1; // Trigger events on frame zero.
        this.time = 0;
    }

    /**
     * Returns true if the current time is greater than the end time, regardless of looping.
     * @returns {boolean}
     */
    public isComplete(): boolean {
        return this.time >= this.endTime;
    }
}
export default TrackEntry
