import {TextureFilter} from './TextureFilter';
import {TextureWrap} from './TextureWrap';
abstract class Texture {

    protected _image: HTMLImageElement;

    constructor(image: HTMLImageElement) {
        //
        this._image = image;
    }

    public getImage(): HTMLImageElement {
        return this._image;
    }

    public abstract setFilters (minFilter: TextureFilter, magFilter: TextureFilter): void;
    public abstract setWraps (uWrap: TextureWrap, vWrap: TextureWrap): void;
    public abstract dispose (): void;

    public static filterFromString (text: string): TextureFilter {
        switch (text.toLowerCase()) {
            case 'nearest': return TextureFilter.Nearest;
            case 'linear': return TextureFilter.Linear;
            case 'mipmap': return TextureFilter.MipMap;
            case 'mipmapnearestnearest': return TextureFilter.MipMapNearestNearest;
            case 'mipmaplinearnearest': return TextureFilter.MipMapLinearNearest;
            case 'mipmapnearestlinear': return TextureFilter.MipMapNearestLinear;
            case 'mipmaplinearlinear': return TextureFilter.MipMapLinearLinear;
            default: throw new Error(`Unknown texture filter ${text}`);
        }
    }

    public static wrapFromString (text: string): TextureWrap {
        switch (text.toLowerCase()) {
            case 'mirroredtepeat': return TextureWrap.MirroredRepeat;
            case 'clamptoedge': return TextureWrap.ClampToEdge;
            case 'repeat': return TextureWrap.Repeat;
            default: throw new Error(`Unknown texture wrap ${text}`);
        }
    }
}
export default Texture;
