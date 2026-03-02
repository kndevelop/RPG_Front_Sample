import { GAME_CONSTANTS } from './constants';
import { PlayerState, IdleState } from './player-state';

export type PlayerFacing = 'rightForward' | 'leftForward' | 'rightBack' | 'leftBack' ;

export class Player {

  x = 10;
  y = 10;

  targetX = 10;
  targetY = 10;

  speed = GAME_CONSTANTS.PLAYER_DEFAULT_SPEED;

  /** プレイヤーの向き: 右方向='rightForward', 左方向='leftForward', 右後ろ='rightBack', 左後ろ='leftBack' */
  facing: PlayerFacing = 'rightForward';

  /** 現在の状態 */
  private currentState: PlayerState;

  constructor() {
    this.currentState = new IdleState(this);
    this.currentState.enter();
  }

  /**
   * 状態を変更します。
   */
  setState(newState: PlayerState): void {
    this.currentState.exit();
    this.currentState = newState;
    this.currentState.enter();
  }

  update(delta: number) {
    this.currentState.update(delta);
  }
}