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

  /** デフォルトのサンプルマップを生成 */
  private buildDefaultMap(): void {
    // 地面（WALKABLE）を敷き詰める
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setTile('WALKABLE', x, y, 'GRASS');
      }
    }

    // 外周を壁（IMPASSABLE）で囲む
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          this.setTile('IMPASSABLE', x, y, 'WALL');
        }
      }
    }

    // 中央付近に水（IMPASSABLE）
    for (let y = 3; y <= 7; y++) {
      this.setTile('IMPASSABLE', 8, y, 'WATER');
      this.setTile('IMPASSABLE', 9, y, 'WATER');
      this.setTile('IMPASSABLE', 10, y, 'WATER');
    }

    // 橋（WALKABLEでIMPASSABLEを上書きできるようにするため、ここではIMPASSABLEをクリアしてWALKABLEにROADを置く）
    // ※現状のisWalkableロジック「IMPASSABLEがあれば不可」に合わせる
    for (let x = 8; x <= 10; x++) {
      this.setTile('IMPASSABLE', x, 5, null);
      this.setTile('WALKABLE', x, 5, 'ROAD');
    }

    // 壁のブロック（IMPASSABLE）
    for (let y = 10; y <= 13; y++) {
      for (let x = 5; x <= 7; x++) {
        this.setTile('IMPASSABLE', x, y, 'WALL');
      }
    }

    // テスト：手前レイヤー（FOREGROUND）
    // 本来は木の上の部分などを想定するが、ここではWALLを浮かせてみる
    this.setTile('FOREGROUND', 12, 12, 'WALL');

    // 通路（WALKABLE）
    for (let x = 1; x < 19; x++) {
      this.setTile('WALKABLE', x, 1, 'ROAD');
    }
    for (let y = 1; y < 19; y++) {
      this.setTile('WALKABLE', 1, y, 'ROAD');
    }
  }
}