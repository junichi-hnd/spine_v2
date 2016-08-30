import { Component } from '@angular/core';
// <avatar [isShow]='isReady' atlasURL='avatar/skeleton.atlas' jsonURL='avatar/skeleton.json' skeletonImageURL='avatar/skeleton.png' (loadingCompleted)='onLoadingCompleted()'></avatar>
@Component({
    selector: 'my-app',
    // template: '<h1>hoge</h1>'
    template: `
                <loader [isShow]='!isReady'></loader>
                <div>
                    <avatar [json]='json' [atlas]='atlas' [colorLabel]='colorLabel' (loadingCompleted)='onLoadingCompleted()'></avatar>
                            <colorbtn label="green" color="green" (onChangeColor)='onChangeColor($event)'></colorbtn>
                            <colorbtn label="blue" color="blue" (onChangeColor)='onChangeColor($event)'></colorbtn>
                            <colorbtn label="red" color="red" (onChangeColor)='onChangeColor($event)'></colorbtn>
                </div>
              `
})


export class Index {

    private isReady: boolean;
    private json: any;
    private atlas: any;
    private colorLabel: string;
    constructor() {
        this.isReady = false;

        this.startJsonLoading = this.startJsonLoading.bind(this);
        this.startAtlasLoading = this.startAtlasLoading.bind(this);
        this.startLoadingImages = this.startLoadingImages.bind(this);
        this.startJsonLoading();
        this.startAtlasLoading();
    }

    /**
     * JSONを読み込む
     */
    private startJsonLoading(): void {
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4 && xhr.status === 200) {
                if(xhr.response) {
                    // this.json = xhr.response;
                    const resonse: any = xhr.response;
                    this.startLoadingImages(resonse);
                }
            }
        };
        xhr.open('GET', './avatar/02-neko.json', true);
        xhr.responseType = 'json';
        xhr.send(null);
    }

    private startAtlasLoading(): void {
        const xhr: XMLHttpRequest = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4 && xhr.status === 200) {
                if(xhr.responseText) {
                    // this.json = xhr.response;
                    const resonse: any = xhr.responseText;
                    this.atlas = resonse;
                }
            }
        };
        xhr.open('GET', './avatar/02-neko.atlas', true);
        xhr.send(null);
    }

    /**
     * JSON内からパーツの画像を先読み
     * @param json
     */
    private startLoadingImages(resonse: any): void {
        const slots: any = resonse.slots;
        const num: number = slots.length;
        const prefix: string = './avatar/images_asesets/02_neko/';
        let counter: number = 0;
        for(let i: number = 0; i < num; i++) {
            const image: HTMLImageElement = new Image();
            console.log(`${prefix}${slots[i].name}.png`);
            image.src = (slots[i].name === 'sample') ? `${prefix}${slots[i].name}.jpg` : `${prefix}${slots[i].name}.png`;
            image.onload = () => {
                counter++;
                if(counter === num) {
                    this.json = resonse;
                }
            };
        }

        const anotherPart: Array<string> = ['red', 'blue', 'green'];
        for(let i: number = 0, num: number = anotherPart.length; i < num; i++) {
            const image: HTMLImageElement = new Image();
            image.src = `${prefix}hair_accessory_back01a_${anotherPart[i]}.png`;
        }
    }

    /**
     * avatarのセットアップ完了
     * @param event
     */
    public onLoadingCompleted(event: any): void {
        console.log('ok');
        this.isReady = true;
    }

    /**
     * ボタンが押されたのを受け取る
     * @param label {string}
     * @link ./app/ts/components/color-button.ts
     */
    public onChangeColor(label: string): void {
        this.colorLabel = label;
    }
}
