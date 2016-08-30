import EventDispatcher from '../events/EventDispatcher';
import Event from '../events/Event';

interface IBounds {
    offset: spine.Vector2;
    size: spine.Vector2;
}

class SkeletonRenderer extends EventDispatcher {
    public scale: number;
    public skeleton: spine.Skeleton;
    public json: any;
    public state: spine.AnimationState;
    public skeletonData: spine.SkeletonData;

    private lastTime: number;
    private ctx: CanvasRenderingContext2D;
    private atlas: string;
    private bounds: IBounds;
    private canvasRender: spine.canvas.SkeletonRenderer;
    private partsJSON: any;
    private hasMesh: boolean;

    constructor(ctx: CanvasRenderingContext2D, hasMesh: boolean = false) {
        super();
        //
        this.ctx = ctx;
        this.canvasRender = new spine.canvas.SkeletonRenderer(this.ctx);
        // this.hasMesh = hasMesh;
        this.hasMesh = false;
        this.lastTime = Date.now() * 0.001;
        this.json = null;
        this.partsJSON = {};
        this.render = this.render.bind(this);
        this.drawTriangles = this.drawTriangles.bind(this);
        this.drawTriangle = this.drawTriangle.bind(this);
        this.getBounds = this.getBounds.bind(this);
        this.animate = this.animate.bind(this);
    }

    /**
     * JSONの内容をstringでセットさせる
     * @param text
     */
    public setFiles(json: any, atlas: string): void {
        this.json = json;
        this.atlas = atlas;
    }

    /**
     * パーツをセットする
     */
    public loadParts(): void {
        const textureAtlas: spine.TextureAtlas = new spine.TextureAtlas(this.atlas, (path: string) => {
            const image: HTMLImageElement = new Image();
            image.src = `./avatar/images_asesets/02_neko/${path}`;
            return new spine.canvas.CanvasTexture(image);
        });
        // jsonを作成する
        const regions: Array<spine.TextureAtlasRegion> = textureAtlas.regions;
        const regionNum: number = regions.length;
        for(let i: number = 0; i < regionNum; i++) {
            const region: spine.TextureAtlasRegion = regions[i];
            this.partsJSON[region.name] = {
                x: region.x,
                y: region.y,
                width: region.width,
                height: region.height,
                name: region.name
            };
        }
        const atlasLoader: spine.TextureAtlasAttachmentLoader = new spine.TextureAtlasAttachmentLoader(textureAtlas);
        const skeletonJSON: spine.SkeletonJson = new spine.SkeletonJson(atlasLoader);
        skeletonJSON.scale = 0.6;
        this.skeletonData = skeletonJSON.readSkeletonData(JSON.stringify(this.json));
        this.skeleton = new spine.Skeleton(this.skeletonData);
        this.bounds = this.getBounds();
        this.skeleton.flipY = true;
        const stateData: spine.AnimationStateData = new spine.AnimationStateData(this.skeletonData);
        this.state = new spine.AnimationState(stateData);
        this.skeleton.setSkinByName('default');
        this.state.setAnimation(0, 'animation', true);

        window.setTimeout(() => {
            this.trigger(new Event(Event.COMPLETE));
        }, 200);
    }

    /**
     * context(2d)で描画
     */
    private render(): void {
        const now: number = Date.now() * 0.001;
        const delta: number = now - this.lastTime;
        this.lastTime = now;

        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.restore();

        this.state.update(delta);
        this.state.apply(this.skeleton);
        this.skeleton.updateWorldTransform();

        const drawOrder: Array<spine.Slot> = this.skeleton.drawOrder;
        const num: number = drawOrder.length;
        for(let i: number = 0; i < num; i++) {
            const slot: spine.Slot = drawOrder[i];
            const attachment: any = slot.getAttachment();
            let region: spine.TextureAtlasRegion = null;
            let image: HTMLImageElement = null;
            let vertices: ArrayLike<number> = [];
            if(attachment instanceof spine.RegionAttachment) {
                const regionAttachment: spine.RegionAttachment = attachment;
                vertices = regionAttachment.updateWorldVertices(slot, false);
                region = <spine.TextureAtlasRegion>regionAttachment.region;
                image = new Image();
                image.src = `avatar/images_asesets/02_neko/${this.partsJSON[attachment.name].name}.png`;

            } else {
                continue;
            }
            const att: spine.RegionAttachment = <spine.RegionAttachment>attachment;
            const bone: spine.Bone = slot.bone;
            const x: number = vertices[0];
            const y: number = vertices[1];
            const rotation: number = (bone.getWorldRotationX() - att.rotation) * Math.PI / 180;
            const xx: number = vertices[24] - vertices[0];
            const xy: number = vertices[25] - vertices[1];
            const yx: number = vertices[8] - vertices[0];
            const yy: number = vertices[9] - vertices[1];
            const w: number = Math.sqrt(xx * xx + xy * xy);
            const h: number = -Math.sqrt(yx * yx + yy * yy);
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            if (region.rotate) {
                this.ctx.rotate(Math.PI * 0.5);
                this.ctx.drawImage(image, region.x, region.y, region.height, region.width, 0, 0, h, -w);
                this.ctx.rotate(-Math.PI * 0.5);
            } else {
                this.ctx.drawImage(image, 0, 0, w, h);
            }
            this.ctx.rotate(-rotation);
            this.ctx.translate(-x, -y);
        }
    }

    private getBounds(): IBounds {
        this.skeleton.setToSetupPose();
        this.skeleton.updateWorldTransform();
        const offset: spine.Vector2 = new spine.Vector2();
        const size: spine.Vector2 = new spine.Vector2();
        this.skeleton.getBounds(offset, size);
        const bounds: IBounds = {offset: offset, size: size};
        return bounds;
    }

    /**
     * resizeイベント
     */
    public resize(): void {
        if(this.bounds !== null && typeof this.bounds !== 'undefined') {
            const canvas: HTMLCanvasElement = this.ctx.canvas;
            const centerX: number = this.bounds.offset.x + this.bounds.size.x * 0.5;
            const centerY: number = this.bounds.offset.y + this.bounds.size.y * 0.5;
            const scaleX: number = this.bounds.size.x / canvas.width;
            const scaleY: number = this.bounds.size.y / canvas.height;
            let scale: number = Math.max(scaleX, scaleY) * 1.2;
            if(scale < 1) {
                scale = 1.0;
            }
            const width: number = canvas.width * scale;
            const height: number = canvas.height * scale;
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.scale(1 / scale, 1 / scale);
            this.ctx.translate(-centerX, -centerY + 300);
            this.ctx.translate(width * 0.5, height * 0.5);
        }
    }

    /**
     * todo: バグがあるので取り除く
     * ひとまず、今回はmeshは使わない想定で
     * mesh機能の描画
     */
    private drawTriangles(): void {
        let blendMode: spine.BlendMode = null;

        let vertices: ArrayLike<number> = null;
        let triangles: Array<number>  = null;
        let drawOrder: Array<spine.Slot> = this.skeleton.drawOrder;
        for (let i: number = 0, n: number = drawOrder.length; i < n; i++) {
            const slot: spine.Slot = drawOrder[i];
            const attachment: any = slot.getAttachment();
            let texture: HTMLImageElement = new Image();
            let region: spine.TextureAtlasRegion = null;
            if (attachment instanceof spine.RegionAttachment) {
                const regionAttachment: spine.RegionAttachment = <spine.RegionAttachment>attachment;
                vertices = regionAttachment.updateWorldVertices(slot, false);
                triangles = [0, 1, 2, 2, 3, 0];
                region = <spine.TextureAtlasRegion>regionAttachment.region;
                texture.src = `avatar/images_asesets/02_neko/${this.partsJSON[attachment.name].name}.png`;

            } else if(attachment instanceof spine.MeshAttachment) {
                const mesh: spine.MeshAttachment = <spine.MeshAttachment>attachment;
                vertices = mesh.updateWorldVertices(slot, false);
                triangles = mesh.triangles;
                texture.src = `avatar/images_asesets/02_neko/${this.partsJSON[attachment.name].name}.png`;
            } else {
                continue;
            }
            if(texture !== null) {
                const slotBlendMode: spine.BlendMode = slot.data.blendMode;
                if(slotBlendMode !== blendMode) {
                    blendMode = slotBlendMode;
                }
                // const ctx: CanvasRenderingContext2D = this.ctx;
                for (let j: number = 0; j < triangles.length; j += 3) {
                    const t1: number = triangles[j] * 8;
                    const t2: number = triangles[j+1] * 8;
                    const t3: number = triangles[j+2] * 8;
                    //
                    const x0: number = vertices[t1];
                    const y0: number = vertices[t1 + 1];
                    const u0: number = vertices[t1 + 6];
                    const v0: number = vertices[t1 + 7];
                    //
                    const x1: number = vertices[t2];
                    const y1: number = vertices[t2 + 1];
                    const u1: number = vertices[t2 + 6];
                    const v1: number = vertices[t2 + 7];
                    //
                    const x2: number = vertices[t3];
                    const y2: number = vertices[t3 + 1];
                    const u2: number = vertices[t3 + 6];
                    const v2: number = vertices[t3 + 7];
                    this.drawTriangle(texture, x0, y0, u0, v0, x1, y1, u1, v1, x2, y2, u2, v2);
                }
            }
        }
    }

    /**
     * todo: ここもバグがあり。おそらくpositionの取り方がおかしい
     * meshは今回使わない
     * @param img
     * @param x0
     * @param y0
     * @param u0
     * @param v0
     * @param x1
     * @param y1
     * @param u1
     * @param v1
     * @param x2
     * @param y2
     * @param u2
     * @param v2
     */
    private drawTriangle(img: HTMLImageElement, x0: number, y0: number, u0: number, v0: number,
                         x1: number, y1: number, u1: number, v1: number,
                         x2: number, y2: number, u2: number, v2: number): void {
        const ctx: CanvasRenderingContext2D = this.ctx;
        u0 *= img.width;
        v0 *= img.height;
        u1 *= img.width;
        v1 *= img.height;
        u2 *= img.width;
        v2 *= img.height;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();

        x1 -= x0;
        y1 -= y0;
        x2 -= x0;
        y2 -= y0;

        u1 -= u0;
        v1 -= v0;
        u2 -= u0;
        v2 -= v0;

        const det: number = 1 / (u1*v2 - u2*v1);

        // linear transformation
        const a: number = (v2*x1 - v1*x2) * det;
        const b: number = (v2*y1 - v1*y2) * det;
        const c: number = (u1*x2 - u2*x1) * det;
        const d: number = (u1*y2 - u2*y1) * det;
        // translation
        const e: number = x0 - a*u0 - c*v0;
        const f: number = y0 - b*u0 - d*v0;

        ctx.save();
        ctx.transform(a, b, c, d, e, f);
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        ctx.restore();
    }

    public animate(): void {
        if(!this.hasMesh) {
            this.render();
        } else {
            this.drawTriangles();
        }
        window.requestAnimationFrame(this.animate);
    }

    public changeParts(name: string): void {
        const ribon: string = 'hair_accessory_back01a';
        this.partsJSON[ribon].name = `${ribon}_${name}`;
    }
}
export default SkeletonRenderer;
