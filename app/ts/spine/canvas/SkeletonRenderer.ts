import Skeleton from '../core/Skeleton';
import Slot from '../core/Slot';
import Attachment from '../core/attachments/Attachment';
import RegionAttachment from '../core/attachments/RegionAttachment';
import TextureAtlasRegion from '../core/texture/TextureAtlasRegion';
import CanvasTexture from './CanvasTexture';
import Bone from '../core/Bone';
import {BlendMode} from '../core/BlendMode';
import MeshAttachment from '../core/attachments/MeshAttachment';

class SkeletonRenderer {
    public static QUAD_TRIANGLES: Array<number> = [0, 1, 2, 2, 3, 0];
    public triangleRendering: boolean = false;
    public debugRendering: boolean = false;

    private ctx: CanvasRenderingContext2D;

    constructor (context: CanvasRenderingContext2D) {
        this.ctx = context;
    }

    public draw (skeleton: Skeleton): void {
        if (this.triangleRendering) {
            this.drawTriangles(skeleton);
        } else {
            this.drawImages(skeleton);
        }
    }

    private drawImages (skeleton: Skeleton): void {
        const ctx: CanvasRenderingContext2D = this.ctx;
        const drawOrder: Array<Slot> = skeleton.drawOrder;

        if (this.debugRendering) {
            ctx.strokeStyle = 'green';
        }

        for (let i: number = 0, n: number = drawOrder.length; i < n; i++) {
            const slot: Slot = drawOrder[i];
            const attachment: Attachment = slot.getAttachment();
            let region: TextureAtlasRegion = null;
            let image: HTMLImageElement = null;
            let vertices: ArrayLike<number> = null;
            if (attachment instanceof RegionAttachment) {
                const regionAttachment: RegionAttachment = <RegionAttachment>attachment;
                vertices = regionAttachment.updateWorldVertices(slot, false);
                region = <TextureAtlasRegion>regionAttachment.region;
                image = (<CanvasTexture>(region).texture).getImage();

            } else {
                continue;
            }

            const att: RegionAttachment = <RegionAttachment>attachment;
            const bone: Bone = slot.bone;
            const x: number = vertices[0];
            const y: number = vertices[1];
            const rotation: number = (bone.getWorldRotationX() - att.rotation) * Math.PI / 180;
            const xx: number = vertices[24] - vertices[0];
            const xy: number = vertices[25] - vertices[1];
            const yx: number = vertices[8] - vertices[0];
            const yy: number = vertices[9] - vertices[1];
            const w: number = Math.sqrt(xx * xx + xy * xy);
            const h: number = -Math.sqrt(yx * yx + yy * yy);
            ctx.translate(x, y);
            ctx.rotate(rotation);
            if (region.rotate) {
                ctx.rotate(Math.PI * 0.5);
                ctx.drawImage(image, region.x, region.y, region.height, region.width, 0, 0, h, -w);
                ctx.rotate(-Math.PI * 0.5);
            } else {
                ctx.drawImage(image, region.x, region.y, region.width, region.height, 0, 0, w, h);
            }
            if (this.debugRendering) {
                ctx.strokeRect(0, 0, w, h);
            }
            ctx.rotate(-rotation);
            ctx.translate(-x, -y);
        }
    }

    private drawTriangles (skeleton: Skeleton): void {
        let blendMode: BlendMode = null;

        let vertices: ArrayLike<number> = null;
        let triangles: Array<number>  = null;
        const drawOrder: Array<Slot> = skeleton.drawOrder;

        for (let i: number = 0, n: number = drawOrder.length; i < n; i++) {
            const slot: Slot = drawOrder[i];
            const attachment: Attachment = slot.getAttachment();
            let texture: HTMLImageElement = null;
            let region: TextureAtlasRegion = null;
            if (attachment instanceof RegionAttachment) {
                let regionAttachment: RegionAttachment = <RegionAttachment>attachment;
                vertices = regionAttachment.updateWorldVertices(slot, false);
                triangles = SkeletonRenderer.QUAD_TRIANGLES;
                region = <TextureAtlasRegion>regionAttachment.region;
                texture = (<CanvasTexture>region.texture).getImage();

            } else if (attachment instanceof MeshAttachment) {
                const mesh: MeshAttachment = <MeshAttachment>attachment;
                vertices = mesh.updateWorldVertices(slot, false);
                triangles = mesh.triangles;
                texture = (<TextureAtlasRegion>mesh.region.renderObject).texture.getImage();
            } else {
                continue;
            }
            if (texture !== null) {
                const slotBlendMode: BlendMode = slot.data.blendMode;
                if (slotBlendMode !== blendMode) {
                    blendMode = slotBlendMode;
                }

                const ctx: CanvasRenderingContext2D = this.ctx;

                for (let j: number = 0; j < triangles.length; j+=3) {
                    const t1: number = triangles[j] * 8;
                    const t2: number = triangles[j+1] * 8;
                    const t3: number = triangles[j+2] * 8;

                    const x0: number = vertices[t1];
                    const y0: number = vertices[t1 + 1];
                    const u0: number = vertices[t1 + 6];
                    const v0: number = vertices[t1 + 7];
                    const x1: number = vertices[t2];
                    const y1: number = vertices[t2 + 1];
                    const u1: number = vertices[t2 + 6];
                    const v1: number = vertices[t2 + 7];
                    const x2: number = vertices[t3];
                    const y2: number = vertices[t3 + 1];
                    const u2: number = vertices[t3 + 6];
                    const v2: number = vertices[t3 + 7];

                    this.drawTriangle(texture, x0, y0, u0, v0, x1, y1, u1, v1, x2, y2, u2, v2);

                    if (this.debugRendering) {
                        ctx.strokeStyle = 'green';
                        ctx.beginPath();
                        ctx.moveTo(x0, y0);
                        ctx.lineTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.lineTo(x0, y0);
                        ctx.stroke();
                    }
                }
            }
        }
    }

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
}
export default SkeletonRenderer;
