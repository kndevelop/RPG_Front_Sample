import { IsoMath } from './iso-math';
import { Player } from './player';

export class Camera {

  constructor(private iso: IsoMath) {}

  getOffset(player: Player) {
    return this.iso.mapToScreen(player.x, player.y);
  }
}