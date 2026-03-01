import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AssetLoaderService } from '../game/services/asset-loader.service';

@Component({
    selector: 'app-develop',
    templateUrl: './develop.component.html',
    styleUrls: ['./develop.component.css']
})
export class DevelopComponent implements OnInit, AfterViewInit {
    private _isoCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('isoCanvas') set isoCanvas(content: ElementRef<HTMLCanvasElement>) {
        if (content) {
            this._isoCanvas = content;
            // ビューが更新された後に描画
            setTimeout(() => this.renderIsoPreview(), 0);
        }
    }

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

    ngAfterViewInit(): void {
        this.renderIsoPreview();
    }

    setTab(tab: 'assets' | 'specs' | 'maps'): void {
        this.activeTab = tab;
        if (tab === 'maps') {
            setTimeout(() => this.renderIsoPreview(), 0);
        }
    }

    selectMap(key: string): void {
        this.selectedMapKey = key;
        this.selectedMapData = this.assetLoader.getData(key);
        if (this.selectedMapData) {
            this.buildPreviewGrid();
            this.renderIsoPreview();
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

    private renderIsoPreview(): void {
        if (!this._isoCanvas || !this.selectedMapData || !this.mapGrid.length) return;

        const canvas = this._isoCanvas.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const config = this.selectedMapData.config || { width: 20, height: 20 };
        const { width, height } = config;
        const tileW = 16; // プレビュー用のタイル幅 (縮小)
        const tileH = 8;  // プレビュー用のタイル高さ (縮小)

        // キャンバスサイズを調整
        canvas.width = (width + height) * (tileW / 2) + 20;
        canvas.height = (width + height) * (tileH / 2) + 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 中心をオフセット
        const offsetX = canvas.width / 2;
        const offsetY = 10;

        // タイル描画の補助関数
        const drawIsoTile = (x: number, y: number, color: string, isWall: boolean = false, highlight: boolean = false) => {
            const sx = offsetX + (x - y) * (tileW / 2);
            const sy = offsetY + (x + y) * (tileH / 2);

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + tileW / 2, sy + tileH / 2);
            ctx.lineTo(sx, sy + tileH);
            ctx.lineTo(sx - tileW / 2, sy + tileH / 2);
            ctx.closePath();

            ctx.fillStyle = color;
            ctx.fill();

            if (highlight) {
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                // 中を明るく
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            } else {
                // 線を少し細く
                ctx.strokeStyle = 'rgba(0,0,0,0.05)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            if (isWall) {
                // 壁の側面も縮小に合わせて調整
                const wallH = 6;
                ctx.beginPath();
                ctx.moveTo(sx - tileW / 2, sy + tileH / 2);
                ctx.lineTo(sx, sy + tileH);
                ctx.lineTo(sx, sy + tileH + wallH);
                ctx.lineTo(sx - tileW / 2, sy + tileH / 2 + wallH);
                ctx.closePath();
                ctx.fillStyle = highlight ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(sx + tileW / 2, sy + tileH / 2);
                ctx.lineTo(sx, sy + tileH);
                ctx.lineTo(sx, sy + tileH + wallH);
                ctx.lineTo(sx + tileW / 2, sy + tileH / 2 + wallH);
                ctx.closePath();
                ctx.fillStyle = highlight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
                ctx.fill();
            }
        };

        // レイヤーごとに描画
        const layers = ['WALKABLE', 'IMPASSABLE', 'FOREGROUND'];
        const colorMap: any = {
            'GRASS': '#2e7d32',
            'WATER': '#0277bd',
            'WALL': '#4e342e',
            'ROAD': '#795548',
            'TREE': '#1b5e20',
            'SAND': '#fbc02d',
            'SNOW': '#e3f2fd',
            'EMPTY': '#222'
        };

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cellValue = this.mapGrid[y][x];
                const highlighted = this.isHighlighted(x, y);
                if (cellValue) {
                    const [layer, type] = cellValue.split(':');
                    const color = colorMap[type] || colorMap['EMPTY'];
                    drawIsoTile(x, y, color, type === 'WALL', highlighted);
                } else {
                    drawIsoTile(x, y, colorMap['EMPTY'], false, highlighted);
                }
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
        this.renderIsoPreview();
    }

    onObjectLeave(): void {
        this.hoveredObject = null;
        this.renderIsoPreview();
    }

    onWarpHover(warp: any): void {
        this.hoveredWarp = warp;
        this.renderIsoPreview();
    }

    onWarpLeave(): void {
        this.hoveredWarp = null;
        this.renderIsoPreview();
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
