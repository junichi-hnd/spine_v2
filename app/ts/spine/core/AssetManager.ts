import IDisposable from './IDisposable';
import IMap from './IMap';
class AssetManager implements IDisposable {


    private textureLoader: (image: HTMLImageElement) => any;
    private assets: IMap<any> = {};
    private errors: IMap<string> = {};
    private toLoad: number = 0;
    private loaded: number = 0;

    constructor(textureLoader: (image: HTMLImageElement) => any) {
        //
        this.textureLoader = this.textureLoader;
    }

    public loadText(path: string, success: (path: string, text: string) => void = null, error: (path: string, error: string) => void = null): void {
        this.toLoad++;
        const request: XMLHttpRequest = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status >= 200 && request.status < 300) {
                    if (success) {
                        success(path, request.responseText);
                    }
                    this.assets[path] = request.responseText;
                } else {
                    if (error) {
                        error(path, `Couldn't load text ${path}: status ${request.status}, ${request.responseText}`);
                    }
                    this.errors[path] = `Couldn't load text ${path}: status ${request.status}, ${request.responseText}`;
                }
                this.toLoad--;
                this.loaded++;
            }
        };
        request.open('GET', path, true);
        request.send();
    }

    public loadTexture(path: string, success: (path: string, image: HTMLImageElement) => void = null, error: (path: string, error: string) => void = null): void {
        this.toLoad++;
        const img: HTMLImageElement = new Image();
        img.src = path;
        img.onload = (ev: any) => {
            if (success) {
                success(path, img);
            }
            const texture:(image: HTMLImageElement) => any = this.textureLoader(img);
            this.assets[path] = texture;
            this.toLoad--;
            this.loaded++;
        };
        img.onerror = (ev: any) => {
            if (error) {
                error(path, `Couldn't load image ${path}`);
            }
            this.errors[path] = `Couldn't load image ${path}`;
            this.toLoad--;
            this.loaded++;
        };
    }

    public get (path: string): any {
        return this.assets[path];
    }

    public remove(path: string): void {
        const asset: IMap<any> = this.assets[path];
        if ((<any>asset).dispose) {
            (<any>asset).dispose();
        }
        this.assets[path] = null;
    }

    public removeAll(): void {
        for (let key in this.assets) {
            if(this.assets.hasOwnProperty(key)) {
                const asset: IMap<any> = this.assets[key];
                if ((<any>asset).dispose) {
                    (<any>asset).dispose();
                }
            }
        }
        this.assets = {};
    }

    public isLoadingComplete (): boolean {
        return this.toLoad === 0;
    }

    public getToLoad (): number {
        return this.toLoad;
    }

    public getLoaded (): number {
        return this.loaded;
    }

    public dispose(): void {
        this.removeAll();
    }

    public hasErrors(): boolean {
        return Object.keys(this.errors).length > 0;
    }

    public getErrors(): IMap<string> {
        return this.errors;
    }
}
export default AssetManager;
