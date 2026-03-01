import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AssetLoaderService } from '../game/services/asset-loader.service';
import { TILE_CONFIG, TileType } from '../game/engine/game-map';
import { GAME_CONSTANTS } from '../game/engine/constants';

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

    // TILE_CONFIG をテンプレートから使いやすくするための公開プロパティ
    readonly tileConfig = TILE_CONFIG;

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
        if (!this.selectedMapData) return;
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

    /** プレビューやグリッド用の色取得ヘルパー */
    getTileColor(tileSpec: string | null): string {
        if (!tileSpec) return '#222';
        // "LAYER:TYPE" 形式か "TYPE" 単体かどちらでも対応
        const type = tileSpec.includes(':') ? tileSpec.split(':')[1] : tileSpec;
        const config = (this.tileConfig as any)[type];
        return config ? this.colorToHex(config.color) : '#222';
    }

    /** 数値カラーをCSSヘックス文字列に変換 */
    colorToHex(color: number): string {
        return '#' + color.toString(16).padStart(6, '0').toUpperCase();
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
        const drawIsoTile = (x: number, y: number, color: string, isWall: boolean = false, highlight: boolean = false, objHeight?: number, faces?: string[]) => {
            const sx = offsetX + (x - y) * (tileW / 2);
            const sy = offsetY + (x + y) * (tileH / 2);

            // デフォルト面 (指定がない場合は全部)
            const renderFaces = faces || ['top', 'left', 'right'];
            const wh = objHeight !== undefined ? objHeight / (GAME_CONSTANTS.WALL_HEIGHT / 6) : 6; // プレビュー用にスケール調整

            if (renderFaces.includes('top')) {
                ctx.beginPath();
                ctx.moveTo(sx, sy - (objHeight !== undefined ? wh : 0));
                ctx.lineTo(sx + tileW / 2, sy + tileH / 2 - (objHeight !== undefined ? wh : 0));
                ctx.lineTo(sx, sy + tileH - (objHeight !== undefined ? wh : 0));
                ctx.lineTo(sx - tileW / 2, sy + tileH / 2 - (objHeight !== undefined ? wh : 0));
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();

                if (highlight) {
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fill();
                } else {
                    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            if (isWall || objHeight !== undefined) {
                // 側面描画
                if (renderFaces.includes('left')) {
                    ctx.beginPath();
                    ctx.moveTo(sx - tileW / 2, sy + tileH / 2 - (objHeight !== undefined ? wh : 0));
                    ctx.lineTo(sx, sy + tileH - (objHeight !== undefined ? wh : 0));
                    ctx.lineTo(sx, sy + tileH);
                    ctx.lineTo(sx - tileW / 2, sy + tileH / 2);
                    ctx.closePath();
                    ctx.fillStyle = highlight ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
                    ctx.fill();
                }

                if (renderFaces.includes('right')) {
                    ctx.beginPath();
                    ctx.moveTo(sx + tileW / 2, sy + tileH / 2 - (objHeight !== undefined ? wh : 0));
                    ctx.lineTo(sx, sy + tileH - (objHeight !== undefined ? wh : 0));
                    ctx.lineTo(sx, sy + tileH);
                    ctx.lineTo(sx + tileW / 2, sy + tileH / 2);
                    ctx.closePath();
                    ctx.fillStyle = highlight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
                    ctx.fill();
                }
            }
        };

        // レンダリングアイテムの事前収集
        const items: any[] = [];

        // 通常のタイルレイヤーから収集
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cellValue = this.mapGrid[y][x];
                const highlighted = this.isHighlighted(x, y);
                if (cellValue) {
                    const [layer, type] = cellValue.split(':');
                    if (layer === 'WALKABLE') continue; // 地面は別途

                    items.push({ x, y, type, highlighted, zIndex: 'y-sort' });
                }
            }
        }

        // 特別なオブジェクトも収集
        const objects = this.selectedMapData.objects || [];
        for (const obj of objects) {
            const process = (tx: number, ty: number) => {
                const highlighted = this.isHighlighted(tx, ty);
                items.push({
                    x: tx, y: ty,
                    type: obj.type || 'EMPTY',
                    highlighted,
                    zIndex: obj.zIndex || 'y-sort',
                    height: obj.height,
                    faces: obj.faces
                });
            };

            if (obj.shape === 'rect') {
                for (let ry = obj.y; ry < obj.y + (obj.h || 1); ry++) {
                    for (let rx = obj.x; rx < obj.x + (obj.w || 1); rx++) process(rx, ry);
                }
            } else if (obj.shape === 'line') {
                for (let i = 0; i < (obj.length || 0); i++) {
                    const lx = obj.direction === 'horizontal' ? obj.x + i : obj.x;
                    const ly = obj.direction === 'vertical' ? obj.y + i : obj.y;
                    process(lx, ly);
                }
            } else {
                process(obj.x, obj.y);
            }
        }

        // 1. 地面 (WALKABLE)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cellValue = this.mapGrid[y][x];
                if (cellValue?.startsWith('WALKABLE:')) {
                    const type = cellValue.split(':')[1] as TileType;
                    const config = this.tileConfig[type];
                    const color = config ? this.colorToHex(config.color) : '#222';
                    drawIsoTile(x, y, color, false, this.isHighlighted(x, y), undefined, ['top']);
                }
            }
        }

        // 2. 他のアイテムをソートして描画
        const back = items.filter(i => i.zIndex === 'back');
        const ysort = items.filter(i => i.zIndex === 'y-sort' || !i.zIndex).sort((a, b) => (a.x + a.y) - (b.x + b.y));
        const front = items.filter(i => i.zIndex === 'front');

        const renderList = [...back, ...ysort, ...front];
        for (const item of renderList) {
            const config = this.tileConfig[item.type as TileType];
            const color = config ? this.colorToHex(config.color) : '#222';
            drawIsoTile(item.x, item.y, color, item.type === 'WALL', item.highlighted, item.height, item.faces);
        }
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
