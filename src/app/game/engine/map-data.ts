import { TileType, LayerType } from './game-map';

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

/** 初期マップの定義データ */
export const INITIAL_MAP_DATA: MapObject[] = [
    // 地面
    { layer: 'WALKABLE', x: 0, y: 0, w: 20, h: 20, type: 'GRASS', shape: 'rect' },

    // 外周
    { layer: 'IMPASSABLE', x: 0, y: 0, length: 20, direction: 'horizontal', type: 'WALL', shape: 'line' },
    { layer: 'IMPASSABLE', x: 0, y: 19, length: 20, direction: 'horizontal', type: 'WALL', shape: 'line' },
    { layer: 'IMPASSABLE', x: 0, y: 0, length: 20, direction: 'vertical', type: 'WALL', shape: 'line' },
    { layer: 'IMPASSABLE', x: 19, y: 0, length: 20, direction: 'vertical', type: 'WALL', shape: 'line' },

    // 水
    { layer: 'IMPASSABLE', x: 8, y: 3, w: 3, h: 5, type: 'WATER', shape: 'rect' },

    // 橋
    { layer: 'IMPASSABLE', x: 8, y: 5, w: 3, h: 1, type: null, shape: 'rect' },
    { layer: 'WALKABLE', x: 8, y: 5, w: 3, h: 1, type: 'ROAD', shape: 'rect' },

    // 建物
    { layer: 'IMPASSABLE', x: 5, y: 10, w: 3, h: 4, type: 'WALL', shape: 'rect' },

    // 手前オブジェクト
    { layer: 'FOREGROUND', x: 12, y: 12, type: 'WALL', shape: 'point' },

    // 通路
    { layer: 'WALKABLE', x: 1, y: 1, length: 18, direction: 'horizontal', type: 'ROAD', shape: 'line' },
    { layer: 'WALKABLE', x: 1, y: 1, length: 18, direction: 'vertical', type: 'ROAD', shape: 'line' },
];
