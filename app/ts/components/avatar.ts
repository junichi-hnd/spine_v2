/**
 * このavatarクラスはWebGLで描画させる。
 * 主に、mesh機能とか使ってるようのテスト
 */
import { Component, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import Event from '../events/Event';

interface IBounds {
    offset: spine.Vector2;
    size: spine.Vector2;
}

interface ISkeleton {
    skeleton: spine.Skeleton;
    state: spine.AnimationState;
    bounds: IBounds;
    premultipliedAlpha: boolean;
}

@Component({
    selector: 'avatar',
    template: `<canvas #avatarCanvas></canvas>`
})

class Avatar {
    @Input() atlasURL: string;
    @Input() jsonURL: string;
    @Input() skeletonImageURL: string;
    @Input() isShow: boolean;
    @Output() loadingCompleted: any = new EventEmitter();
    @ViewChild('avatarCanvas') avatarCanvas: ElementRef;

    private canvas: HTMLCanvasElement;
    // private skeletonRenderer: spine.canvas.SkeletonRenderer;
    // atlas, jason, .pngが読み込み終えたか
    private isLoaded: boolean;
    private assetManager: spine.webgl.AssetManager;
    private lastFrameTime: number;

    private gl: WebGLRenderingContext;
    private shader: spine.webgl.Shader;
    private batcher: spine.webgl.PolygonBatcher;
    private mvp: spine.webgl.Matrix4;
    private skeletonRenderer: spine.webgl.SkeletonRenderer;
    private skeleton: ISkeleton;

    constructor() {
        this.isLoaded = false;
        this.lastFrameTime = Date.now() * 0.001;
        this.mvp = new spine.webgl.Matrix4();
        this.canvas = null;

        this.onResize = this.onResize.bind(this);
        this.check = this.check.bind(this);
        this.render = this.render.bind(this);
        this.loadSkeleton = this.loadSkeleton.bind(this);
        this.calculateBounds = this.calculateBounds.bind(this);
    }

    ngAfterViewInit(): void {
        this.canvas = this.avatarCanvas.nativeElement;
        this.canvas.style.display = 'none';
        const config: {alpha: boolean} = { alpha: false };
        this.gl = (this.canvas.getContext('webgl', config) || this.canvas.getContext('experimental-webgl', config)) as WebGLRenderingContext;
        this.shader = spine.webgl.Shader.newColoredTextured(this.gl);
        this.batcher = new spine.webgl.PolygonBatcher(this.gl);
        this.mvp.ortho2d(0, 0, this.canvas.width - 1, this.canvas.height - 1);
        this.skeletonRenderer = new spine.webgl.SkeletonRenderer(this.gl);
        this.assetManager = new spine.webgl.AssetManager(this.gl);
        this.assetManager.loadText(this.atlasURL);
        this.assetManager.loadText(this.jsonURL);
        this.assetManager.loadTexture(this.skeletonImageURL);
        this.onResize();
        window.addEventListener(Event.RESIZE, this.onResize);
        window.requestAnimationFrame(this.check);
    }

    ngOnChanges(): void {
        if(this.canvas !== null) {
            this.canvas.style.display = this.isShow ? 'block' : 'none';
        }
    }

    private check(): void {
        this.isLoaded = this.assetManager.isLoadingComplete();
        if(!this.isLoaded) {
            window.requestAnimationFrame(this.check);
        } else {
            console.log('dispatcher');
            this.loadingCompleted.emit(Event.COMPLETE);
            this.skeleton = this.loadSkeleton('animation', 'default', false);
            window.requestAnimationFrame(this.render);
        }
    }

    private calculateBounds(skeleton: spine.Skeleton): IBounds {
        skeleton.setToSetupPose();
        skeleton.updateWorldTransform();
        const offset: spine.Vector2 = new spine.Vector2();
        const size: spine.Vector2 = new spine.Vector2();
        skeleton.getBounds(offset, size);
        return {offset, size} as IBounds;
    }

    private loadSkeleton(name: string, skin: string = 'default', premultipliedAlpha: boolean = false): ISkeleton {
        const atlas: spine.TextureAtlas = new spine.TextureAtlas(this.assetManager.get(this.atlasURL), (path: string) => {
            return this.assetManager.get(`avatar/${path}`);
        });
        const atlasLoader: spine.TextureAtlasAttachmentLoader = new spine.TextureAtlasAttachmentLoader(atlas);
        const skeletonJson: spine.SkeletonJson = new spine.SkeletonJson(atlasLoader);
        const skeletonData: spine.SkeletonData = skeletonJson.readSkeletonData(this.assetManager.get(this.jsonURL));
        const skeleton: spine.Skeleton = new spine.Skeleton(skeletonData);
        const bounds: IBounds = this.calculateBounds(skeleton);
        skeleton.setSkinByName(skin);
        const state: spine.AnimationState = new spine.AnimationState(new spine.AnimationStateData(skeleton.data));
        state.setAnimation(0, 'animation', true);
        const data: ISkeleton = {
            skeleton,
            state,
            bounds,
            premultipliedAlpha
        };
        return data;
    }

    private render(): void {
        const now: number = Date.now() * 0.001;
        const delta: number = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.onResize();
        this.gl.clearColor(0.51, 0.51, 0.51, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        const state: spine.AnimationState = this.skeleton.state;
        const skeleton: spine.Skeleton = this.skeleton.skeleton;
        const premultipliedAlpha: boolean = this.skeleton.premultipliedAlpha;
        state.update(delta);
        state.apply(skeleton);
        skeleton.updateWorldTransform();

        // Bind the shader and set the texture and model-view-projection matrix.
        this.shader.bind();
        this.shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
        this.shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, this.mvp.values);

        // Start the batch and tell the SkeletonRenderer to render the active skeleton.
        this.batcher.begin(this.shader);
        this.skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
        this.skeletonRenderer.draw(this.batcher, skeleton);
        this.batcher.end();

        this.shader.unbind();

        window.requestAnimationFrame(this.render);
    }

    private onResize(): void {
        if(this.canvas !== null) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.canvas.style.width = `${this.canvas.width}px`;
            this.canvas.style.height = `${this.canvas.height}px`;

            if(typeof this.skeleton !== 'undefined') {
                const bounds: IBounds = this.skeleton.bounds;
                const centerX: number = bounds.offset.x + bounds.size.x * 0.5;
                const centerY: number = bounds.offset.y + bounds.size.y * 0.5;
                const scaleX: number = bounds.size.x / this.canvas.width;
                const scaleY: number = bounds.size.y / this.canvas.height;
                let scale: number = Math.max(scaleX, scaleY) * 1.2;
                if (scale < 1) {
                    scale = 1;
                }
                const width: number = this.canvas.width * scale;
                const height: number = this.canvas.height * scale;
                this.mvp.ortho2d(centerX - width * 0.5, centerY - height * 0.5, width, height);
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }
}
export default Avatar;
