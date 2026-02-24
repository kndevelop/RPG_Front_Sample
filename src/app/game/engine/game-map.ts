export type TileType = 'GRASS' | 'WATER' | 'WALL' | 'ROAD';

/** タイルタイプ別の設定 */
export const TILE_CONFIG: Record<TileType, {
  walkable: boolean;
  color: number;       // フォールバックカラー
  wallColor?: number;  // 壁の側面色
  texturePath?: string;
}> = {
  GRASS: { walkable: true, color: 0x4CAF50, texturePath: 'assets/tiles/grass.png' },
  WATER: { walkable: false, color: 0x2196F3, texturePath: 'assets/tiles/water.png' },
  WALL: { walkable: false, color: 0x795548, wallColor: 0x4E342E, texturePath: 'assets/tiles/wall.png' },
  ROAD: { walkable: true, color: 0xBDBDBD, texturePath: 'assets/tiles/road.png' },
};

export type LayerType = 'WALKABLE' | 'IMPASSABLE' | 'FOREGROUND';

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
    this.buildDefaultMap();
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
    // 範囲外は不可
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;

    // 不可侵レイヤーにタイルがある場合は不可
    if (this.layers.IMPASSABLE[y][x] !== null) return false;

    // 歩行可能レイヤーにタイルがある場合のみ移動可能（現状の仕様に合わせるなら）
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

  /** デフォルトのサンプルマップを生成 */
  private buildDefaultMap(): void {
    // 地面（WALKABLE）を敷き詰める
    this.fillRect('WALKABLE', 0, 0, this.width, this.height, 'GRASS');

    // 外周を壁（IMPASSABLE）で囲む
    this.fillLine('IMPASSABLE', 0, 0, this.width, 'horizontal', 'WALL');
    this.fillLine('IMPASSABLE', 0, this.height - 1, this.width, 'horizontal', 'WALL');
    this.fillLine('IMPASSABLE', 0, 0, this.height, 'vertical', 'WALL');
    this.fillLine('IMPASSABLE', this.width - 1, 0, this.height, 'vertical', 'WALL');

    // 中央付近に水（IMPASSABLE）
    this.fillRect('IMPASSABLE', 8, 3, 3, 5, 'WATER');

    // 橋（IMPASSABLEをクリアしてWALKABLEにROADを置く）
    this.fillRect('IMPASSABLE', 8, 5, 3, 1, null);
    this.fillRect('WALKABLE', 8, 5, 3, 1, 'ROAD');

    // 建物（IMPASSABLE）
    this.fillRect('IMPASSABLE', 5, 10, 3, 4, 'WALL');

    // テスト：手前レイヤー（FOREGROUND）
    this.setTile('FOREGROUND', 12, 12, 'WALL');

    // 通路（WALKABLE）
    this.fillLine('WALKABLE', 1, 1, this.width - 2, 'horizontal', 'ROAD');
    this.fillLine('WALKABLE', 1, 1, this.height - 2, 'vertical', 'ROAD');
  }
}