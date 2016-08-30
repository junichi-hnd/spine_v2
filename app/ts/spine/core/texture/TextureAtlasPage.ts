import {TextureFilter} from './TextureFilter';
import {TextureWrap} from './TextureWrap';
import Texture from './Texture';

class TextureAtlasPage {
    public name: string;
    public minFilter: TextureFilter;
    public magFilter: TextureFilter;
    public uWrap: TextureWrap;
    public vWrap: TextureWrap;
    public texture: Texture;
    public width: number;
    public height: number;
}
export default TextureAtlasPage;
