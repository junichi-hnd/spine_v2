import Texture from '../core/texture/Texture';
import {TextureFilter} from '../core/texture/TextureFilter';
import {TextureWrap} from '../core/texture/TextureWrap';
class CanvasTexture extends Texture {
    constructor (image: HTMLImageElement) {
        super(image);
    }

    public setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void {}
    public setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void {}
    public dispose(): void {}
}
export default CanvasTexture;
