export class Player {

  x = 10;
  y = 10;

  targetX = 10;
  targetY = 10;

  speed = 4;

  update(delta: number) {

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 0.01) {
      const move = this.speed * delta;
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;
    }
  }
}