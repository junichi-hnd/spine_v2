import AnimationStateData from "./AnimationStateData";
import TrackEntry from "./TrackEntry";
import Event from "./events/Event";
import IAnimationStateListener from "./IAnimationStateListener";
import Skeleton from "./Skeleton";
import MathUtils from "../utils/MathUtils";
import Utils from "../utils/Utils";
import Animation from "./Animation";
class AnimationState {
    public data: AnimationStateData;
    public tracks: Array<TrackEntry>;
    public events: Array<Event>;
    public listeners: Array<IAnimationStateListener>;
    public timeScale: number;

    constructor(data: AnimationStateData) {
        //
        if(data === null) {
            throw new Error("data cannot be null.");
        }
        this.data = data;
        this.tracks = [];
        this.events = [];
        this.listeners = [];
        this.timeScale = 1;
    }

    public update(delta: number): void {
        delta *= this.timeScale;
        for (let i: number = 0; i < this.tracks.length; i++) {
            let current: TrackEntry = this.tracks[i];
            if(current === null) {
                continue;
            }
            const next: TrackEntry = current.next;
            if(next !== null) {
                const nextTime: number = current.lastTime - next.delay;
                if (nextTime >= 0) {
                    const nextDelta: number = delta * next.timeScale;
                    next.time = nextTime + nextDelta; // For start event to see correct time.
                    current.time += delta * current.timeScale; // For end event to see correct time.
                    this.setCurrent(i, next);
                    next.time -= nextDelta; // Prevent increasing time twice, below.
                    current = next;
                }
            } else if(!current.loop && current.lastTime >= current.endTime) {
                // End non-looping animation when it reaches its end time and there is no next entry.
                this.clearTrack(i);
                continue;
            }
            current.time += delta * current.timeScale;
            if (current.previous !== null) {
                let previousDelta = delta * current.previous.timeScale;
                current.previous.time += previousDelta;
                current.mixTime += previousDelta;
            }
        }
    }

    public apply(skeleton: Skeleton): void {
        const events: Array<Event> = this.events;
        const listenerCount: number = this.listeners.length;
        for(let i: number = 0; i < this.tracks.length; i++) {
            const current: TrackEntry = this.tracks[i];
            if(current === null) {
                continue;
            }
            events.length = 0;

            let time: number = current.time;
            const lastTime: number = current.lastTime;
            const endTime: number = current.endTime;
            const loop: boolean = current.loop;
            if (!loop && time > endTime) {
                time = endTime;
            }
            const previous = current.previous;
            if (previous == null) {
                current.animation.mix(skeleton, lastTime, time, loop, events, current.mix);
            } else {
                let previousTime: number = previous.time;
                if (!previous.loop && previousTime > previous.endTime) {
                    previousTime = previous.endTime;
                }
                previous.animation.apply(skeleton, previousTime, previousTime, previous.loop, null);

                let alpha: number = current.mixTime / current.mixDuration * current.mix;
                if (alpha >= 1) {
                    alpha = 1;
                    current.previous = null;
                }
                current.animation.mix(skeleton, lastTime, time, loop, events, alpha);
            }

            for (let ii: number = 0, nn: number = events.length; ii < nn; ii++) {
                const event: Event = events[ii];
                if (current.listener !== null) {
                    current.listener.event(i, event);
                }
                for (let iii: number = 0; iii < listenerCount; iii++) {
                    this.listeners[iii].event(i, event);
                }
            }

            // Check if completed the animation or a loop iteration.
            if (loop ? (lastTime % endTime > time % endTime) : (lastTime < endTime && time >= endTime)) {
                let count = MathUtils.toInt(time / endTime);
                if (current.listener !== null) {
                    current.listener.complete(i, count);
                }
                for (let ii: number = 0, nn: number = this.listeners.length; ii < nn; ii++) {
                    this.listeners[ii].complete(i, count);
                }
            }
            current.lastTime = current.time;
        }
    }

    public clearTracks (): void {
        for (let i: number = 0, n: number = this.tracks.length; i < n; i++) {
            this.clearTrack(i);
        }
        this.tracks.length = 0;
    }

    public clearTrack (trackIndex: number): void {
        if (trackIndex >= this.tracks.length) {
            return;
        }
        const current: TrackEntry = this.tracks[trackIndex];
        if (current === null) {
            return;
        }

        if (current.listener !== null) {
            current.listener.end(trackIndex);
        }
        for (let i: number = 0, n: number = this.listeners.length; i < n; i++) {
            this.listeners[i].end(trackIndex);
        }
        this.tracks[trackIndex] = null;
        this.freeAll(current);
    }

    public freeAll (entry: TrackEntry): void {
        while (entry !== null) {
            const next: TrackEntry = entry.next;
            entry = next;
        }
    }

    public expandToIndex (index: number): TrackEntry {
        if (index < this.tracks.length) {
            return this.tracks[index];
        }
        Utils.setArraySize(this.tracks, index - this.tracks.length + 1, null);
        this.tracks.length = index + 1;
        return null;
    }

    public setCurrent (index: number, entry: TrackEntry): void {
        const current: TrackEntry = this.expandToIndex(index);
        if (current !== null) {
            let previous: TrackEntry = current.previous;
            current.previous = null;

            if (current.listener !== null) {
                current.listener.end(index);
            }
            for (let i: number = 0, n: number = this.listeners.length; i < n; i++) {
                this.listeners[i].end(index);
            }
            entry.mixDuration = this.data.getMix(current.animation, entry.animation);
            if (entry.mixDuration > 0) {
                entry.mixTime = 0;
                // If a mix is in progress, mix from the closest animation.
                if (previous != null && current.mixTime / current.mixDuration < 0.5) {
                    entry.previous = previous;
                    previous = current;
                } else {
                    entry.previous = current;
                }
            }
        }

        this.tracks[index] = entry;

        if (entry.listener !== null) {
            entry.listener.start(index);
        }
        for (let i: number = 0, n: number = this.listeners.length; i < n; i++) {
            this.listeners[i].start(index);
        }
    }

    public setAnimation (trackIndex: number, animationName: string, loop: boolean): TrackEntry {
        const animation: Animation = this.data.skeletonData.findAnimation(animationName);
        if (animation === null) {
            throw new Error(`Animation not found: ${animationName}`);
        }
        return this.setAnimationWith(trackIndex, animation, loop);
    }

    public setAnimationWith (trackIndex: number, animation: Animation, loop: boolean): TrackEntry {
        const current: TrackEntry = this.expandToIndex(trackIndex);
        if (current !== null) {
            this.freeAll(current.next);
        }

        const entry: TrackEntry = new TrackEntry();
        entry.animation = animation;
        entry.loop = loop;
        entry.endTime = animation.duration;
        this.setCurrent(trackIndex, entry);
        return entry;
    }

    public addAnimation (trackIndex: number, animationName: string, loop: boolean, delay: number): TrackEntry {
        const animation: Animation = this.data.skeletonData.findAnimation(animationName);
        if (animation === null) {
            throw new Error(`Animation not found: ${animationName}`);
        }
        return this.addAnimationWith(trackIndex, animation, loop, delay);
    }

    /**
     * Adds an animation to be played delay seconds after the current or last queued animation.
     * @param trackIndex
     * @param animation
     * @param loop
     * @param delay     {number}        May be <= 0 to use duration of previous animation minus any mix duration plus the negative delay.
     * @returns {TrackEntry}
     */
    public addAnimationWith (trackIndex: number, animation: Animation, loop: boolean, delay: number): TrackEntry {
        const entry: TrackEntry = new TrackEntry();
        entry.animation = animation;
        entry.loop = loop;
        entry.endTime = animation.duration;

        let last: TrackEntry = this.expandToIndex(trackIndex);
        if (last !== null) {
            while (last.next !== null) {
                last = last.next;
            }
            last.next = entry;
        } else {
            this.tracks[trackIndex] = entry;
        }

        if (delay <= 0) {
            if (last !== null) {
                delay += last.endTime - this.data.getMix(last.animation, animation);
            } else {
                delay = 0;
            }
        }
        entry.delay = delay;

        return entry;
    }

    /**
     * returns may be null.
     * @param trackIndex
     * @returns {any}
     */
    public getCurrent (trackIndex: number): TrackEntry {
        if (trackIndex >= this.tracks.length) {
            return null;
        }
        return this.tracks[trackIndex];
    }

    /**
     * Adds a listener to receive events for all animations.
     * @param listener
     */
    public addListener (listener: IAnimationStateListener): void {
        if (listener === null) {
            throw new Error('listener cannot be null.');
        }
        this.listeners.push(listener);
    }

    public removeListener (listener: IAnimationStateListener): void {
        const index: number = this.listeners.indexOf(listener);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    }

    public clearListeners (): void {
        this.listeners.length = 0;
    }
}
export default AnimationState;
