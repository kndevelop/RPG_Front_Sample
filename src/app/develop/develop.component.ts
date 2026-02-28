import { Component, OnInit } from '@angular/core';
import { AssetLoaderService } from '../game/services/asset-loader.service';

@Component({
    selector: 'app-develop',
    templateUrl: './develop.component.html',
    styleUrls: ['./develop.component.css']
})
export class DevelopComponent implements OnInit {
    assets: { key: string, path: string, type: 'image' | 'json' | 'other' }[] = [];
    specs: { title: string, content: string }[] = [];
    activeTab: 'assets' | 'specs' | 'maps' = 'maps';
    mapAssets: { key: string, path: string }[] = [];
    selectedMapKey: string | null = null;
    selectedMapData: any = null;
    mapGrid: (string | null)[][] = [];
    hoveredObject: any | null = null;
    hoveredWarp: any | null = null;

    constructor(private assetLoader: AssetLoaderService) { }

    async ngOnInit(): Promise<void> {
        // 全てのアセットのロードを確実にする
        await this.assetLoader.loadAssets();

        const manifest = this.assetLoader.manifest;
        const entries = Object.entries(manifest);

        this.assets = entries.map(([key, path]) => {
            let type: 'image' | 'json' | 'other' = 'other';
            if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.webp')) {
                type = 'image';
            } else if (path.endsWith('.json')) {
                type = 'json';
            }
            return { key, path, type };
        });

        this.mapAssets = this.assets
            .filter(a => a.type === 'json' && a.key.startsWith('map_'))
            .map(a => ({ key: a.key, path: a.path }));

        this.specs = [
            { title: 'Map System', content: 'documents/map/map-spec.md' },
            { title: 'Player Movement', content: 'documents/player-behavor/movement-spec.md' },
            { title: 'Input & Click Event', content: 'documents/click-event/input-spec.md' }
        ];

        if (this.mapAssets.length > 0) {
            this.selectMap(this.mapAssets[0].key);
        }
    }

    setTab(tab: 'assets' | 'specs' | 'maps'): void {
        this.activeTab = tab;
    }

    selectMap(key: string): void {
        this.selectedMapKey = key;
        this.selectedMapData = this.assetLoader.getData(key);
        if (this.selectedMapData) {
            this.buildPreviewGrid();
        }
    }

    private buildPreviewGrid(): void {
        const { width, height } = this.selectedMapData.config || { width: 20, height: 20 };
        this.mapGrid = Array.from({ length: height }, () => Array(width).fill(null));

        const objects = this.selectedMapData.objects || [];
        for (const obj of objects) {
            const { x, y, w, h, layer, type, shape, length, direction } = obj;
            const drawType = type || 'EMPTY';

            const fill = (ix: number, iy: number) => {
                if (iy >= 0 && iy < height && ix >= 0 && ix < width) {
                    this.mapGrid[iy][ix] = `${layer}:${drawType}`;
                }
            };

            if (shape === 'rect') {
                for (let ry = y; ry < y + (h || 1); ry++) {
                    for (let rx = x; rx < x + (w || 1); rx++) {
                        fill(rx, ry);
                    }
                }
            } else if (shape === 'line') {
                for (let i = 0; i < (length || 0); i++) {
                    const lx = direction === 'horizontal' ? x + i : x;
                    const ly = direction === 'vertical' ? y + i : y;
                    fill(lx, ly);
                }
            } else if (shape === 'point') {
                fill(x, y);
            }
        }
    }

    getTileClass(cellValue: string | null): string {
        if (!cellValue) return 'tile-empty';
        const [layer, type] = cellValue.split(':');
        return `tile-${layer.toLowerCase()} type-${(type || 'none').toLowerCase()}`;
    }

    onObjectHover(obj: any): void {
        this.hoveredObject = obj;
    }

    onObjectLeave(): void {
        this.hoveredObject = null;
    }

    onWarpHover(warp: any): void {
        this.hoveredWarp = warp;
    }

    onWarpLeave(): void {
        this.hoveredWarp = null;
    }

    isHighlighted(x: number, y: number): boolean {
        if (this.hoveredWarp) {
            return this.hoveredWarp.x === x && this.hoveredWarp.y === y;
        }

        if (this.hoveredObject) {
            const obj = this.hoveredObject;
            if (obj.shape === 'rect') {
                return x >= obj.x && x < obj.x + (obj.w || 1) &&
                    y >= obj.y && y < obj.y + (obj.h || 1);
            } else if (obj.shape === 'line') {
                if (obj.direction === 'horizontal') {
                    return y === obj.y && x >= obj.x && x < obj.x + (obj.length || 0);
                } else {
                    return x === obj.x && y >= obj.y && y < obj.y + (obj.length || 0);
                }
            } else if (obj.shape === 'point') {
                return x === obj.x && y === obj.y;
            }
        }

        return false;
    }
}
