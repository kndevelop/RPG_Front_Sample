export type TileType = 'GRASS' | 'WATER' | 'WALL' | 'ROAD' | 'TREE' | 'SAND' | 'SNOW';

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
  SAND: { walkable: true, color: 0xFFECB3, texturePath: 'assets/tiles/sand.png' },
  SNOW: { walkable: true, color: 0xE3F2FD, texturePath: 'assets/tiles/snow.png' },
};

export type LayerType = 'WALKABLE' | 'IMPASSABLE';

export interface WarpPoint {
  x: number;
  y: number;
  targetMap: string;
  targetX: number;
  targetY: number;
}

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

  // 新規属性
  isIsometric?: boolean;
  zIndex?: 'front' | 'back' | 'y-sort';
  height?: number;
  faces?: ('top' | 'left' | 'right')[];
}

export class GameMap {

  width: number;
  height: number;

  /** レイヤー別タイルデータ */
  layers: Record<LayerType, (TileType | null)[][]>;

  /** ワープポイント */
  warps: WarpPoint[] = [];

  constructor(width: number = 20, height: number = 20) {
    this.width = width;
    this.height = height;
    this.layers = {
      WALKABLE: this.createEmptyLayer(),
      IMPASSABLE: this.createEmptyLayer()
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

  /**
   * 始点(x0, y0)から終点(x1, y1)に向かって直線的に移動し、最初に衝突する手前の到達可能点を返します。
   * @param x0 始点のタイルX
   * @param y0 始点のタイルY
   * @param x1 終点のタイルX
   * @param y1 終点のタイルY
   */
  findReachablePoint(x0: number, y0: number, x1: number, y1: number): { x: number, y: number } {
    // 整数化
    let lastX = Math.round(x0);
    let lastY = Math.round(y0);
    const targetX = Math.round(x1);
    const targetY = Math.round(y1);

    // 既に始点が通り抜け不可なら始点を返す
    if (!this.isWalkable(lastX, lastY)) {
      return { x: lastX, y: lastY };
    }

    // Bresenhamのアルゴリズム的なステップ実行
    const dx = Math.abs(targetX - lastX);
    const dy = Math.abs(targetY - lastY);
    const sx = (lastX < targetX) ? 1 : -1;
    const sy = (lastY < targetY) ? 1 : -1;
    let err = dx - dy;

    let currX = lastX;
    let currY = lastY;

    while (true) {
      if (currX === targetX && currY === targetY) break;

      const e2 = 2 * err;
      let nextX = currX;
      let nextY = currY;

      if (e2 > -dy) {
        err -= dy;
        nextX += sx;
      }
      if (e2 < dx) {
        err += dx;
        nextY += sy;
      }

      // 次のマスが歩行可能かチェック
      if (!this.isWalkable(nextX, nextY)) {
        // 衝突した場合は、その直前の座標を返す
        return { x: currX, y: currY };
      }

      currX = nextX;
      currY = nextY;
    }

    return { x: targetX, y: targetY };
  }

  /** 外部データからマップを生成 */
  buildMap(data: MapObject[], warps?: WarpPoint[]): void {
    if (warps) {
      this.warps = warps;
    }
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