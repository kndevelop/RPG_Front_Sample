import { GAME_CONSTANTS } from './constants';
import { PlayerState, IdleState } from './player-state';
import { Vector2 } from './utils/vector';

export type PlayerFacing = 'rightForward' | 'leftForward' | 'rightBack' | 'leftBack';

export class Player {

  x = 10;
  y = 10;

  targetX = 10;
  targetY = 10;

  speed = GAME_CONSTANTS.PLAYER_DEFAULT_SPEED;

  /** プレイヤーの向き: 右方向='rightForward', 左方向='leftForward', 右後ろ='rightBack', 左後ろ='leftBack' */
  facing: PlayerFacing = 'rightForward';

  /** アニメーション用の経過時間 */
  animationTimer = 0;

  // ステータス
  hp = 1845;
  maxHp = 2150;
  sp = 128;
  maxSp = 180;
  exp = 6720;
  maxExp = 8500;
  level = 25;
  coins = 15780;

  /** 移動中かどうか */
  get isMoving(): boolean {
    return Vector2.distance({ x: this.x, y: this.y }, { x: this.targetX, y: this.targetY }) > GAME_CONSTANTS.PLAYER_STOP_THRESHOLD;
  }

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
    this.animationTimer += delta;
    this.currentState.update(delta);
  }
}