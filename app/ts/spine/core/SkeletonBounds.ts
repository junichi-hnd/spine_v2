import BoundingBoxAttachment from "./attachments/BoundingBoxAttachment";
import Utils from "../utils/Utils";
import Pool from "../utils/Pool";
import Skeleton from "./Skeleton";
class SkeletonBounds {
    public minX = 0;
    public minY = 0;
    public maxX = 0;
    public maxY = 0;
    public boundingBoxes = new Array<BoundingBoxAttachment>();
    public polygons = new Array<ArrayLike<number>>();

    private polygonPool = new Pool<ArrayLike<number>>(() => {
        return Utils.newFloatArray(16);
    });


    public update (skeleton: Skeleton, updateAabb: boolean) {
        if (skeleton === null) {
            throw new Error("skeleton cannot be null.");
        }
        const boundingBoxes: Array<BoundingBoxAttachment> = this.boundingBoxes;
        const polygons: Array<ArrayLike<number>> = this.polygons;
        let polygonPool = this.polygonPool;
        let slots = skeleton.slots;
        let slotCount = slots.length;

        boundingBoxes.length = 0;
        polygonPool.freeAll(polygons);
        polygons.length = 0;

        for (let i = 0; i < slotCount; i++) {
            let slot = slots[i];
            let attachment = slot.getAttachment();
            if (attachment instanceof BoundingBoxAttachment) {
                let boundingBox = attachment as BoundingBoxAttachment;
                boundingBoxes.push(boundingBox);

                let polygon = polygonPool.obtain();
                if (polygon.length != boundingBox.worldVerticesLength) {
                    polygon = Utils.newFloatArray(boundingBox.worldVerticesLength);
                }
                polygons.push(polygon);
                boundingBox.computeWorldVertices(slot, polygon);
            }
        }

        if (updateAabb) this.aabbCompute();
    }

    public aabbCompute(): void {
        let minX: number = Number.POSITIVE_INFINITY, minY: number = Number.POSITIVE_INFINITY, maxX: number = Number.NEGATIVE_INFINITY, maxY: number = Number.NEGATIVE_INFINITY;
        const polygons: Array<ArrayLike<number>> = this.polygons;
        for (let i: number = 0, n: number = polygons.length; i < n; i++) {
            const polygon: ArrayLike<number> = polygons[i];
            const vertices: ArrayLike<number> = polygon;
            for (let ii: number = 0, nn: number = polygon.length; ii < nn; ii += 2) {
                const x: number = vertices[ii];
                const y: number = vertices[ii + 1];
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    public aabbContainsPoint (x: number, y: number): number {
        return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
    }

    public aabbIntersectsSegment (x1: number, y1: number, x2: number, y2: number): boolean {
        const minX: number = this.minX;
        const minY: number = this.minY;
        const maxX: number = this.maxX;
        const maxY: number = this.maxY;
        if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY)) {
            return false;
        }

        const m: number = (y2 - y1) / (x2 - x1);
        let y: number = m * (minX - x1) + y1;
        if (y > minY && y < maxY) {
            return true;
        }
        y = m * (maxX - x1) + y1;
        if (y > minY && y < maxY) {
            return true;
        }
        let x: number = (minY - y1) / m + x1;
        if (x > minX && x < maxX) {
            return true;
        }
        x = (maxY - y1) / m + x1;
        if (x > minX && x < maxX) {
            return true;
        }
        return false;
    }

    public aabbIntersectsSkeleton (bounds: SkeletonBounds): boolean {
        return this.minX < bounds.maxX && this.maxX > bounds.minX && this.minY < bounds.maxY && this.maxY > bounds.minY;
    }

    public containsPoint (x: number, y: number): BoundingBoxAttachment {
        const polygons: Array<ArrayLike<number>> = this.polygons;
        for (let i: number = 0, n: number = polygons.length; i < n; i++)
            if (this.containsPointPolygon(polygons[i], x, y)) {
                return this.boundingBoxes[i];
            }
        return null;
    }

    /**
     * Returns true if the polygon contains the point.
     * @param polygon
     * @param x
     * @param y
     * @returns {boolean}
     */
    public containsPointPolygon (polygon: ArrayLike<number>, x: number, y: number): boolean {
        const vertices: ArrayLike<number> = polygon;
        const nn: number = polygon.length;

        let prevIndex: number = nn - 2;
        let inside: boolean = false;
        for (let ii: number = 0; ii < nn; ii += 2) {
            const vertexY: number = vertices[ii + 1];
            const prevY: number = vertices[prevIndex + 1];
            if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
                const vertexX = vertices[ii];
                if (vertexX + (y - vertexY) / (prevY - vertexY) * (vertices[prevIndex] - vertexX) < x) {
                    inside = !inside;
                }
            }
            prevIndex = ii;
        }
        return inside;
    }

    /**
     * Returns the first bounding box attachment that contains any part of the line segment, or null. When doing many checks, it
     * is usually more efficient to only call this method if {@link #aabbIntersectsSegment(float, float, float, float)} returns true
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns {any}
     */
    public intersectsSegment (x1: number, y1: number, x2: number, y2: number): BoundingBoxAttachment {
        const polygons: Array<ArrayLike<number>> = this.polygons;
        for (let i: number = 0, n: number = polygons.length; i < n; i++)
            if (this.intersectsSegmentPolygon(polygons[i], x1, y1, x2, y2)) {
                return this.boundingBoxes[i];
            }
        return null;
    }

    public intersectsSegmentPolygon(polygon: ArrayLike<number>, x1: number, y1: number, x2: number, y2: number): boolean {
        const vertices: ArrayLike<number> = polygon;
        const nn: number = polygon.length;

        const width12: number = x1 - x2;
        const height12: number = y1 - y2;
        const det1: number = x1 * y2 - y1 * x2;
        let x3: number = vertices[nn - 2], y3: number = vertices[nn - 1];
        for (let ii: number = 0; ii < nn; ii += 2) {
            const x4: number = vertices[ii];
            const y4: number = vertices[ii + 1];
            const det2: number = x3 * y4 - y3 * x4;
            const width34: number = x3 - x4, height34 = y3 - y4;
            const det3: number = width12 * height34 - height12 * width34;
            const x: number = (det1 * width34 - width12 * det2) / det3;
            if (((x >= x3 && x <= x4) || (x >= x4 && x <= x3)) && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1))) {
                const y: number = (det1 * height34 - height12 * det2) / det3;
                if (((y >= y3 && y <= y4) || (y >= y4 && y <= y3)) && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1))) {
                    return true;
                }
            }
            x3 = x4;
            y3 = y4;
        }
        return false;
    }

    public getPolygon (boundingBox: BoundingBoxAttachment): ArrayLike<number> {
        if (boundingBox === null) {
            throw new Error('boundingBox cannot be null.');
        }
        const index: number = this.boundingBoxes.indexOf(boundingBox);
        return index == -1 ? null : this.polygons[index];
    }
}
export default SkeletonBounds;
