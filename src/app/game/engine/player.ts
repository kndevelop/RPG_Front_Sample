import { GAME_CONSTANTS } from './constants';

export type PlayerFacing = 'right' | 'left';

export class Player {

  x = 10;
  y = 10;

  targetX = 10;
  targetY = 10;

  speed = GAME_CONSTANTS.PLAYER_DEFAULT_SPEED;

  /** プレイヤーの向き: 右方向='right', 左方向='left' */
  facing: PlayerFacing = 'right';

  update(delta: number) {

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > GAME_CONSTANTS.PLAYER_STOP_THRESHOLD) {
      const move = this.speed * delta;

      if (move >= dist) {
        // 目標地点に到達または追い越す場合は、目標地点に直接セット
        this.x = this.targetX;
        this.y = this.targetY;
      } else {
        // 通常の移動
        this.x += (dx / dist) * move;
        this.y += (dy / dist) * move;
      }

      // 画面上の左右方向（X軸）で判定
      // dx - dy > 0: 画面右方向
      // dx - dy < 0: 画面左方向
      this.facing = (dx - dy) >= 0 ? 'right' : 'left';
    }
  }
}