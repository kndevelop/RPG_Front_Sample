import { GAME_CONSTANTS } from './constants';
import { Vector2 } from './utils/vector';

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
    const dist = Vector2.distance({ x: this.x, y: this.y }, { x: this.targetX, y: this.targetY });

    if (dist > GAME_CONSTANTS.PLAYER_STOP_THRESHOLD) {
      const moveAmount = this.speed * delta;

      // 目標地点を超えないように移動
      if (moveAmount >= dist) {
        this.x = this.targetX;
        this.y = this.targetY;
      } else {
        const ratio = moveAmount / dist;
        this.x += dx * ratio;
        this.y += dy * ratio;
      }

      // 画面上の左右判定 (dx - dy)
      this.facing = (dx - dy) >= 0 ? 'right' : 'left';
    }
  }
}