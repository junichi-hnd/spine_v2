import IUpdatable from './IUpdatable';
import BoneData from './BoneData';
import Skeleton from './Skeleton';
import MathUtils from '../utils/MathUtils';
import Vector2 from "../utils/Vector2";

class Bone implements IUpdatable {
	public data: BoneData;
	public skeleton: Skeleton;
	public parent: Bone;
	public children: Array<Bone>;
	public x: number;
	public y: number;
	public rotation: number;
	public scaleX: number;
	public scaleY: number;
	public shearX: number;
	public shearY: number;
	public appliedRotation: number;
	public a: number;
	public b: number;
	public c: number;
	public d: number;
	public worldX: number;
	public worldY: number;
	public worldSignX: number;
	public worldSignY: number;
	public sorted: boolean;


    constructor(data: BoneData, skeleton: Skeleton, parent: Bone) {
		if(data === null) {
			throw new Error('data cannot be null.');
		}
		if(skeleton === null) {
			throw new Error('skeleton cannot be null');
		}
		this.data = data;
		this.skeleton = skeleton;
		this.parent = parent;
		this.setToSetupPose();
    }

    public update(): void {
		this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
	}

	public updateWorldTransform(): void {
		this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
	}

	public updateWorldTransformWith(x: number, y: number, rotation: number, scaleX: number, scaleY: number, shearX: number, shearY: number): void {
		this.appliedRotation = rotation;
		let rotationY: number = rotation + 90 + shearY;
		let la: number = MathUtils.cosDeg(rotation + shearX) * scaleX, lb = MathUtils.cosDeg(rotationY) * scaleY;
		let lc: number = MathUtils.sinDeg(rotation + shearX) * scaleX, ld = MathUtils.sinDeg(rotationY) * scaleY;
		let parent: Bone = this.parent;
		if(parent === null) {
			let skeleton: Skeleton = this.skeleton;
			if(skeleton.flipX) {
				x = -x;
				la = -la;
				lb = -lb;
			}
			if(skeleton.flipY) {
				y = -y;
				lc = -lc;
				ld = -ld;
			}
			this.a = la;
			this.b = lb;
			this.c = lc;
			this.d = ld;
			this.worldX = x;
			this.worldY = y;
			this.worldSignX = MathUtils.signum(scaleX);
			this.worldSignY = MathUtils.signum(scaleY);
			return;
		}
		let pa: number = parent.a, pb: number = parent.b, pc: number = parent.c, pd: number = parent.d;
		this.worldX = pa * x + pb * y + parent.worldX;
		this.worldY = pc * x + pd * y + parent.worldY;
		this.worldSignX = parent.worldSignX * MathUtils.signum(scaleX);
		this.worldSignY = parent.worldSignY * MathUtils.signum(scaleY);
		if (this.data.inheritRotation && this.data.inheritScale) {
			this.a = pa * la + pb * lc;
			this.b = pa * lb + pb * ld;
			this.c = pc * la + pd * lc;
			this.d = pc * lb + pd * ld;
		} else {
			if (this.data.inheritRotation) {
				// No scale inheritance.
				pa = 1;
				pb = 0;
				pc = 0;
				pd = 1;
				do {
					const cos: number = MathUtils.cosDeg(parent.appliedRotation);
					const sin: number = MathUtils.sinDeg(parent.appliedRotation);
					let temp: number = pa * cos + pb * sin;
					pb = pb * cos - pa * sin;
					pa = temp;
					temp = pc * cos + pd * sin;
					pd = pd * cos - pc * sin;
					pc = temp;

					if (!parent.data.inheritRotation) {
						break;
					}
					parent = parent.parent;
				} while (parent !== null);
				this.a = pa * la + pb * lc;
				this.b = pa * lb + pb * ld;
				this.c = pc * la + pd * lc;
				this.d = pc * lb + pd * ld;
			} else if(this.data.inheritScale) {
				// No rotation inheritance.
				pa = 1;
				pb = 0;
				pc = 0;
				pd = 1;

				do {
					const cos: number = MathUtils.cosDeg(parent.appliedRotation);
					let sin: number = MathUtils.sinDeg(parent.appliedRotation);
					const psx: number = parent.scaleX;
					const psy: number = parent.scaleY;
					const za: number = cos * psx;
					const zb: number = sin * psy;
					const zc: number = sin * psx;
					const zd: number = cos * psy;
					let temp: number = pa * za + pb * zc;
					pb = pb * zd - pa * zb;
					pa = temp;
					temp = pc * za + pd * zc;
					pd = pd * zd - pc * zb;
					pc = temp;

					if (psx >= 0) {
						sin = -sin;
					}
					temp = pa * cos + pb * sin;
					pb = pb * cos - pa * sin;
					pa = temp;
					temp = pc * cos + pd * sin;
					pd = pd * cos - pc * sin;
					pc = temp;

					if (!parent.data.inheritScale) {
						break;
					}
					parent = parent.parent;
				} while (parent != null);
				this.a = pa * la + pb * lc;
				this.b = pa * lb + pb * ld;
				this.c = pc * la + pd * lc;
				this.d = pc * lb + pd * ld;
			} else {
				this.a = la;
				this.b = lb;
				this.c = lc;
				this.d = ld;
			}
			if (this.skeleton.flipX) {
				this.a = -this.a;
				this.b = -this.b;
			}
			if (this.skeleton.flipY) {
				this.c = -this.c;
				this.d = -this.d;
			}
		}
	}

	public setToSetupPose (): void {
		const data: BoneData = this.data;
		this.x = data.x;
		this.y = data.y;
		this.rotation = data.rotation;
		this.scaleX = data.scaleX;
		this.scaleY = data.scaleY;
		this.shearX = data.shearX;
		this.shearY = data.shearY;
	}

	public getWorldRotationX(): number {
		return Math.atan2(this.c, this.a) * MathUtils.radDeg;
	}

	public getWorldRotationY (): number {
		return Math.atan2(this.d, this.b) * MathUtils.radDeg;
	}

	public getWorldScaleX (): number {
		return Math.sqrt(this.a * this.a + this.b * this.b) * this.worldSignX;
	}

	public getWorldScaleY (): number {
		return Math.sqrt(this.c * this.c + this.d * this.d) * this.worldSignY;
	}

	public worldToLocalRotationX (): number {
		const parent: Bone = this.parent;
		if (parent === null) {
			return this.rotation;
		}
		const pa: number = parent.a;
		const pb: number = parent.b;
		const pc: number = parent.c;
		const pd: number = parent.d;
		const a: number = this.a;
		const c: number = this.c;
		return Math.atan2(pa * c - pc * a, pd * a - pb * c) * MathUtils.radDeg;
	}

	public worldToLocalRotationY (): number {
		const parent: Bone = this.parent;
		if (parent === null) {
			return this.rotation;
		}
		const pa: number = parent.a;
		const pb: number = parent.b;
		const pc: number = parent.c;
		const pd: number = parent.d;
		const b: number = this.b;
		const d: number = this.d;
		return Math.atan2(pa * d - pc * b, pd * b - pb * d) * MathUtils.radDeg;
	}

	public rotateWorld (degrees: number): void {
		// let a = this.a, b = this.b, c = this.c, d = this.d;
		const a: number = this.a;
		const b: number = this.b;
		const c: number = this.c;
		const d: number = this.d;
		const cos: number = MathUtils.cosDeg(degrees);
		const sin: number = MathUtils.sinDeg(degrees);
		this.a = cos * a - sin * c;
		this.b = cos * b - sin * d;
		this.c = sin * a + cos * c;
		this.d = sin * b + cos * d;
	}

	public updateLocalTransform (): void {
		const parent: Bone = this.parent;
		if (parent === null) {
			this.x = this.worldX;
			this.y = this.worldY;
			this.rotation = Math.atan2(this.c, this.a) * MathUtils.radDeg;
			this.scaleX = Math.sqrt(this.a * this.a + this.c * this.c);
			this.scaleY = Math.sqrt(this.b * this.b + this.d * this.d);
			const det: number = this.a * this.d - this.b * this.c;
			this.shearX = 0;
			this.shearY = Math.atan2(this.a * this.b + this.c * this.d, det) * MathUtils.radDeg;
			return;
		}
		const pa: number = parent.a;
		const pb: number = parent.b;
		const pc: number = parent.c;
		const pd: number = parent.d;
		const pid: number = 1 / (pa * pd - pb * pc);
		const dx: number = this.worldX - parent.worldX;
		const dy: number = this.worldY - parent.worldY;
		this.x = (dx * pd * pid - dy * pb * pid);
		this.y = (dy * pa * pid - dx * pc * pid);
		const ia: number = pid * pd;
		const id: number = pid * pa;
		const ib: number = pid * pb;
		const ic: number = pid * pc;
		const ra: number = ia * this.a - ib * this.c;
		const rb: number = ia * this.b - ib * this.d;
		const rc: number = id * this.c - ic * this.a;
		const rd: number = id * this.d - ic * this.b;
		this.shearX = 0;
		this.scaleX = Math.sqrt(ra * ra + rc * rc);
		if (this.scaleX > 0.0001) {
			const det: number = ra * rd - rb * rc;
			this.scaleY = det / this.scaleX;
			this.shearY = Math.atan2(ra * rb + rc * rd, det) * MathUtils.radDeg;
			this.rotation = Math.atan2(rc, ra) * MathUtils.radDeg;
		} else {
			this.scaleX = 0;
			this.scaleY = Math.sqrt(rb * rb + rd * rd);
			this.shearY = 0;
			this.rotation = 90 - Math.atan2(rd, rb) * MathUtils.radDeg;
		}
		this.appliedRotation = this.rotation;
	}


	public worldToLocal (world: Vector2): Vector2 {
		// let a = this.a, b = this.b, c = this.c, d = this.d;
		const a: number = this.a;
		const b: number = this.b;
		const c: number = this.c;
		const d: number = this.d;
		const invDet: number = 1 / (a * d - b * c);
		const x: number = world.x - this.worldX;
		const y: number = world.y - this.worldY;
		world.x = (x * d * invDet - y * b * invDet);
		world.y = (y * a * invDet - x * c * invDet);
		return world;
	}

	public localToWorld (local: Vector2): Vector2 {
		const x: number = local.x;
		const y: number = local.y;
		local.x = x * this.a + y * this.b + this.worldX;
		local.y = x * this.c + y * this.d + this.worldY;
		return local;
	}
}
export default Bone;
