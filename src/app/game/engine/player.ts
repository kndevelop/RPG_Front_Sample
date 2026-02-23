export type PlayerFacing = 'right' | 'left';

export class Player {

  x = 10;
  y = 10;

  targetX = 10;
  targetY = 10;

  speed = 4;

  /** プレイヤーの向き: 右下方向='right', 左上方向='left' */
  facing: PlayerFacing = 'right';

  update(delta: number) {

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.01) {
      const move = this.speed * delta;
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;

      // アイソメトリック座標でdx+dyの符号で左右を判定
      // dx+dy > 0: 右下方向 → 通常画像
      // dx+dy < 0: 左上方向 → 反転画像
      this.facing = (dx + dy) >= 0 ? 'right' : 'left';
    }
  }
}