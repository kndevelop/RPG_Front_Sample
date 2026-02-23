export class IsoMath {

  constructor(
    public tileWidth: number,
    public tileHeight: number
  ) {}

  mapToScreen(x: number, y: number) {
    return {
      x: (x - y) * (this.tileWidth / 2),
      y: (x + y) * (this.tileHeight / 2)
    };
  }

  screenToMap(sx: number, sy: number) {
    const mx = (sx / (this.tileWidth/2) + sy / (this.tileHeight/2)) / 2;
    const my = (sy / (this.tileHeight/2) - sx / (this.tileWidth/2)) / 2;
    return { x: Math.floor(mx), y: Math.floor(my) };
  }
}