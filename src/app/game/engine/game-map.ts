export type TileType = 'GRASS' | 'WATER' | 'WALL' | 'ROAD' | 'TREE';

/** タイルタイプ別の設定 */
export const TILE_CONFIG: Record<TileType, {
  walkable: boolean;
  color: number;       // フォールバックカラー
  wallColor?: number;  // 壁の側面色
  texturePath?: string;
  isVertical?: boolean; // 垂直オブジェクトかどうか
}> = {
  GRASS: { walkable: true, color: 0x4CAF50, texturePath: 'assets/tiles/grass.png' },
  WATER: { walkable: false, color: 0x2196F3, texturePath: 'assets/tiles/water.png' },
  WALL: { walkable: false, color: 0x795548, wallColor: 0x4E342E, texturePath: 'assets/tiles/wall.png', isVertical: true },
  ROAD: { walkable: true, color: 0xBDBDBD, texturePath: 'assets/tiles/road.png' },
  TREE: { walkable: false, color: 0x2E7D32, texturePath: 'assets/tiles/tree.png', isVertical: true },
};

export type LayerType = 'WALKABLE' | 'IMPASSABLE' | 'FOREGROUND';

export interface MapObject {
  layer: LayerType;
  x: number;
  y: number;
  w?: number;
  h?: number;
  type: TileType | null;
  shape: 'point' | 'rect' | 'line';
  length?: number;
  direction?: 'horizontal' | 'vertical';
}

export class GameMap {

  width = 20;
  height = 20;

  /** レイヤー別タイルデータ */
  layers: Record<LayerType, (TileType | null)[][]>;

  constructor() {
    this.layers = {
      WALKABLE: this.createEmptyLayer(),
      IMPASSABLE: this.createEmptyLayer(),
      FOREGROUND: this.createEmptyLayer(),
    };
  }

  private createEmptyLayer(): (TileType | null)[][] {
    return Array.from({ length: this.height }, () =>
      Array(this.width).fill(null)
    );
  }

  /** 特定のレイヤーにタイルを配置 */
  setTile(layer: LayerType, x: number, y: number, type: TileType | null): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.layers[layer][y][x] = type;
  }

  getTile(layer: LayerType, x: number, y: number): TileType | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this.layers[layer][y][x];
  }

  /** 指定した位置が移動可能かどうか */
  isWalkable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
    if (this.layers.IMPASSABLE[y][x] !== null) return false;
    const walkableTile = this.layers.WALKABLE[y][x];
    if (walkableTile === null) return false;
    return TILE_CONFIG[walkableTile].walkable;
  }

  /** 指定した範囲をタイルで埋める（長方形） */
  fillRect(layer: LayerType, x: number, y: number, w: number, h: number, type: TileType | null): void {
    for (let iy = y; iy < y + h; iy++) {
      for (let ix = x; ix < x + w; ix++) {
        this.setTile(layer, ix, iy, type);
      }
    }
  }

  /** 水平または垂直の線を引く */
  fillLine(layer: LayerType, x: number, y: number, length: number, direction: 'horizontal' | 'vertical', type: TileType | null): void {
    for (let i = 0; i < length; i++) {
      const ix = direction === 'horizontal' ? x + i : x;
      const iy = direction === 'vertical' ? y + i : y;
      this.setTile(layer, ix, iy, type);
    }
  }

  /** 外部データからマップを生成 */
  buildMap(data: MapObject[]): void {
    for (const obj of data) {
      switch (obj.shape) {
        case 'point':
          this.setTile(obj.layer, obj.x, obj.y, obj.type);
          break;
        case 'rect':
          this.fillRect(obj.layer, obj.x, obj.y, obj.w!, obj.h!, obj.type);
          break;
        case 'line':
          this.fillLine(obj.layer, obj.x, obj.y, obj.length!, obj.direction!, obj.type);
          break;
      }
    }
  }
}