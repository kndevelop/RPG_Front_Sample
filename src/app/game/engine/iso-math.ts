import { Injectable } from '@angular/core';
import { GAME_CONSTANTS } from './constants';

@Injectable({
  providedIn: 'root'
})
export class IsoMath {

  constructor() { }

  mapToScreen(x: number, y: number) {
    return {
      x: (x - y) * (GAME_CONSTANTS.TILE_WIDTH / 2),
      y: (x + y) * (GAME_CONSTANTS.TILE_HEIGHT / 2)
    };
  }

  screenToMap(sx: number, sy: number) {
    const mx = (sx / (GAME_CONSTANTS.TILE_WIDTH / 2) + sy / (GAME_CONSTANTS.TILE_HEIGHT / 2)) / 2;
    const my = (sy / (GAME_CONSTANTS.TILE_HEIGHT / 2) - sx / (GAME_CONSTANTS.TILE_WIDTH / 2)) / 2;
    return { x: Math.floor(mx), y: Math.floor(my) };
  }

  /** タイルの基準位置（中心の足元）の画面相対座標を取得 */
  getTileBottomCenter(x: number, y: number): { x: number, y: number } {
    const pos = this.mapToScreen(x, y);
    return {
      x: pos.x,
      y: pos.y + GAME_CONSTANTS.TILE_HEIGHT / 2
    };
  }

  /**
   * マップ座標から、カメラとセンター補正を考慮した最終的な画面上での描画位置を計算します。
   * @param x マップタイルX
   * @param y マップタイルY
   * @param centerX 画面中心X
   * @param centerY 画面中心Y
   * @param offset カメラのオフセット
   */
  getScreenPos(x: number, y: number, centerX: number, centerY: number, offset: { x: number, y: number }) {
    const pos = this.mapToScreen(x, y);
    return {
      x: centerX + pos.x - offset.x,
      y: centerY + pos.y - offset.y
    };
  }
}