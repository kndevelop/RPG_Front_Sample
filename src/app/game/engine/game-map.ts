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

export class GameMap {

  width = 20;
  height = 20;

  /** タイルデータ（2次元配列: tiles[y][x]） */
  tiles: TileType[][];

  constructor() {
    this.tiles = this.buildDefaultMap();
  }

  getTile(x: number, y: number): TileType | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
    return this.tiles[y][x];
  }

  isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (tile === null) return false;
    return TILE_CONFIG[tile].walkable;
  }

  /** デフォルトのサンプルマップを生成 */
  private buildDefaultMap(): TileType[][] {
    const map: TileType[][] = Array.from({ length: this.height }, () =>
      Array(this.width).fill('GRASS') as TileType[]
    );

    // 外周を壁で囲む
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          map[y][x] = 'WALL';
        }
      }
    }

    // 中央付近に水（川）
    for (let y = 3; y <= 7; y++) {
      map[y][8] = 'WATER';
      map[y][9] = 'WATER';
      map[y][10] = 'WATER';
    }

    // 橋（道）
    map[5][8] = 'ROAD';
    map[5][9] = 'ROAD';
    map[5][10] = 'ROAD';

    // 壁のブロック（建物など）
    for (let y = 10; y <= 13; y++) {
      for (let x = 5; x <= 7; x++) {
        map[y][x] = 'WALL';
      }
    }

    // 通路（道）
    for (let x = 1; x < 19; x++) {
      map[1][x] = 'ROAD';
    }
    for (let y = 1; y < 19; y++) {
      map[y][1] = 'ROAD';
    }

    return map;
  }
}