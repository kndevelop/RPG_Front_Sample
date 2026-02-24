/** マップと描画に関する共通定数 */
export const GAME_CONSTANTS = {
    // タイル設定
    TILE_WIDTH: 64,
    TILE_HEIGHT: 32,
    TILE_HALF_WIDTH: 32,
    TILE_HALF_HEIGHT: 16,

    // プレイヤー設定
    PLAYER_DEFAULT_SPEED: 4,
    PLAYER_STOP_THRESHOLD: 0.01,
    PLAYER_WIDTH: 50,
    PLAYER_HEIGHT: 100,
    PLAYER_ANCHOR_X: 0.5,
    PLAYER_ANCHOR_Y: 1.0,
    PLAYER_Y_OFFSET: 16,

    // 壁の設定
    WALL_HEIGHT: 20,
};

/** 座標インターフェース */
export interface Point {
    x: number;
    y: number;
}
