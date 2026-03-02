import { Player } from './player';
import { Vector2 } from './utils/vector';
import { GAME_CONSTANTS } from './constants';

export interface PlayerState {
    enter(): void;
    update(delta: number): void;
    exit(): void;
}

/**
 * 待機状態
 */
export class IdleState implements PlayerState {
    constructor(private player: Player) { }

    enter(): void {
        // console.log('Player: Entered IdleState');
    }

    update(delta: number): void {
        // 移動先が現在地と異なる場合は移動状態へ遷移
        const dist = Vector2.distance(
            { x: this.player.x, y: this.player.y },
            { x: this.player.targetX, y: this.player.targetY }
        );

        if (dist > GAME_CONSTANTS.PLAYER_STOP_THRESHOLD) {
            this.player.setState(new MoveState(this.player));
        }
    }

    exit(): void {
        // console.log('Player: Exited IdleState');
    }
}

/**
 * 移動状態
 */
export class MoveState implements PlayerState {
    constructor(private player: Player) { }

    enter(): void {
        // console.log('Player: Entered MoveState');
    }

    update(delta: number): void {
        const dx = this.player.targetX - this.player.x;
        const dy = this.player.targetY - this.player.y;
        const dist = Vector2.distance(
            { x: this.player.x, y: this.player.y },
            { x: this.player.targetX, y: this.player.targetY }
        );

        // 目的地に到達したかチェック
        if (dist <= GAME_CONSTANTS.PLAYER_STOP_THRESHOLD) {
            this.player.x = this.player.targetX;
            this.player.y = this.player.targetY;
            this.player.setState(new IdleState(this.player));
            return;
        }

        const moveAmount = this.player.speed * delta;

        if (moveAmount >= dist) {
            this.player.x = this.player.targetX;
            this.player.y = this.player.targetY;
            this.player.setState(new IdleState(this.player));
        } else {
            const ratio = moveAmount / dist;
            this.player.x += dx * ratio;
            this.player.y += dy * ratio;
        }

        // 向きの更新
        // アイソメトリック座標系において、(dx + dy) < 0 はスクリーン座標で「上」方向（背面）
        if (dx + dy < -0.1) {
            this.player.facing = (dx - dy) >= 0 ? 'rightBack' : 'leftBack';
        } else {
            this.player.facing = (dx - dy) >= 0 ? 'rightForward' : 'leftForward';
        }
    }

    exit(): void {
        // console.log('Player: Exited MoveState');
    }
}
