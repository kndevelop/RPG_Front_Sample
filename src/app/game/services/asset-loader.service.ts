import { Injectable } from '@angular/core';
import * as PIXI from 'pixi.js';

@Injectable({
    providedIn: 'root'
})
export class AssetLoaderService {

    private textures: Map<string, PIXI.Texture> = new Map();

    private readonly assetManifest: Record<string, string> = {
        'player_right': 'assets/player/player_right.png',
        'player_left': 'assets/player/player_left.png',
        'tile_grass': 'assets/tiles/grass.png',
        'tile_water': 'assets/tiles/water.png',
        'tile_wall': 'assets/tiles/wall.png',
        'tile_road': 'assets/tiles/road.png',
    };

    /**
     * テクスチャを取得します。未ロードの場合はロードを試みます。
     */
    getTexture(key: string): PIXI.Texture | null {
        if (this.textures.has(key)) {
            return this.textures.get(key)!;
        }

        const path = this.assetManifest[key];
        if (!path) {
            console.warn(`Asset key not found: ${key}`);
            return null;
        }

        const texture = PIXI.Texture.from(path);
        this.textures.set(key, texture);
        return texture;
    }

    /**
     * 指定したキーリストのアセットを事前にロードします（将来用）
     */
    async preload(keys: string[]): Promise<void> {
        // PIXI.Assets を使用した一括ロードも可能ですが、
        // 現状は Texture.from のキャッシュ機能に任せます。
        for (const key of keys) {
            this.getTexture(key);
        }
    }
}
