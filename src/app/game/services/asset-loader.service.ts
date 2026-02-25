import { Injectable } from '@angular/core';
import * as PIXI from 'pixi.js';

@Injectable({
    providedIn: 'root'
})
export class AssetLoaderService {

    private readonly assetManifest: Record<string, string> = {
        'player_right': 'assets/player/player_right.png',
        'player_left': 'assets/player/player_left.png',
        'tile_grass': 'assets/tiles/grass.png',
        'tile_water': 'assets/tiles/water.png',
        'tile_wall': 'assets/tiles/wall.png',
        'tile_road': 'assets/tiles/road.png',
        'tile_tree': 'assets/tiles/tree.png',
        'map_default': 'assets/data/map-default.json',
    };

    /**
     * 全てのアセットをロードします。
     */
    async loadAssets(): Promise<void> {
        const keys = Object.keys(this.assetManifest);

        for (const key of keys) {
            const path = this.assetManifest[key];
            PIXI.Assets.add(key, path);
        }

        // 全てのアセットのロードを試みる
        // 個別にロードすることで、一つが失敗しても他が読み込まれるようにする
        const promises = keys.map(key =>
            PIXI.Assets.load(key)
                .then(asset => {
                    // console.log(`Loaded asset: ${key}`);
                    return asset;
                })
                .catch(err => {
                    console.error(`Failed to load asset: ${key} from ${this.assetManifest[key]}`);
                    return null; // 失敗しても null を返して全体の Promise.all を止めない
                })
        );

        await Promise.all(promises);
    }

    /**
     * ロード済みのテクスチャを取得します。
     */
    getTexture(key: string): PIXI.Texture | null {
        try {
            return PIXI.Assets.get(key) as PIXI.Texture || null;
        } catch (e) {
            console.warn(`Asset not found: ${key}`);
            return null;
        }
    }

    /**
     * ロード済みのデータ（JSONなど）を取得します。
     */
    getData(key: string): any {
        try {
            return PIXI.Assets.get(key);
        } catch (e) {
            console.warn(`Data asset not found: ${key}`);
            return null;
        }
    }
}
