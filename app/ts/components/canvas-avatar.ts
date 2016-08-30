import { Component, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import Event from '../events/Event';
import SkeletonRender from '../spine/SkeletonRenderer';
@Component({
    selector: 'avatar',
    template: `<canvas #avatarCanvas></canvas>`
})

class CanvasAvatar {
    @Input() json: any;
    @Input() atlas: string;
    @Input() colorLabel: string;
    @Output() loadingCompleted: any = new EventEmitter();
    @ViewChild('avatarCanvas') avatarCanvas: ElementRef;

    private canvas: HTMLCanvasElement;
    private skeletonRender: SkeletonRender;

    constructor() {
        this.canvas = null;

        this.onResize = this.onResize.bind(this);
        this.setupAvatar = this.setupAvatar.bind(this);
        this.onRenderReady = this.onRenderReady.bind(this);
    }

    ngAfterViewInit(): void {
        this.canvas = this.avatarCanvas.nativeElement;
        this.canvas.style.display = 'none';
        this.onResize();
        window.addEventListener(Event.RESIZE, this.onResize);
    }

    ngOnChanges(): void {
        if(this.json !== null && typeof this.json !== 'undefined' && this.atlas !== null && typeof this.atlas !== 'undefined') {
            console.log('atlas && json is ok');
            this.setupAvatar();
            if(typeof this.colorLabel !== 'undefined' && this.colorLabel.length > 0) {
                this.skeletonRender.changeParts(this.colorLabel);
            }
        }
    }

    /**
     * avatorの準備をする
     */
    private setupAvatar(): void {
        this.skeletonRender = new SkeletonRender(this.canvas.getContext('2d'));
        this.skeletonRender.addEventListener(Event.COMPLETE, this.onRenderReady);
        this.skeletonRender.setFiles(this.json, this.atlas);
        this.skeletonRender.loadParts();
        this.onResize();
        this.skeletonRender.animate();
    }

    private onRenderReady(event: any): void {
        this.skeletonRender.removeEventListener(Event.COMPLETE, this.onRenderReady);
        this.canvas.style.display = 'block';
        this.loadingCompleted.emit(Event.COMPLETE);
    }

    private onResize(): void {
        if(this.canvas !== null) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.canvas.style.width = `${this.canvas.width}px`;
            this.canvas.style.height = `${this.canvas.height}px`;
            if(this.skeletonRender !== null && typeof this.skeletonRender !== 'undefined') {
                this.skeletonRender.resize();
            }
        }
    }
}
export default CanvasAvatar;
