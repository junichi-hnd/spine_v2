import TextureRegion from './TextureRegion';
import TextureAtlasPage from './TextureAtlasPage';
import Texture from './Texture';
class TextureAtlasRegion extends TextureRegion {
    public page: TextureAtlasPage;
    public name: string;
    public x: number;
    public y: number;
    public index: number;
    public rotate: boolean;
    public texture: Texture;
}

export default TextureAtlasRegion;
