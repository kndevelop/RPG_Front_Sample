export class GameMap {

  width = 20;
  height = 20;

  isWalkable(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
}