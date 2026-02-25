import * as PIXI from 'pixi.js';
import { Camera } from './camera';
import { Player } from './player';
import { IsoMath } from './iso-math';
import { Point } from './constants';
import { GameEventService } from '../services/game-event.service';

/** 入力処理（クリック、将来的なキーボードなど）を管理するクラス */
export class InputManager {

    constructor(
        private app: PIXI.Application,
        private iso: IsoMath,
        private camera: Camera,
        private player: Player, // まだ screenToMap で Camera.getOffset(player) が必要なため保持
        private gameEvent: GameEventService
    ) {
        this.setupEvents();
    }

    private setupEvents() {
        this.app.stage.eventMode = 'static';
        this.app.stage.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
            const mapPos = this.screenToMap(event.global.x, event.global.y);
            this.gameEvent.requestMove(mapPos.x, mapPos.y);
        });
    }

    /** 画面座標をマップ座標に変換 */
    private screenToMap(screenX: number, screenY: number): Point {
        const centerX = this.app.screen.width / 2;
        const centerY = this.app.screen.height / 2;
        const offset = this.camera.getOffset(this.player);

        const worldX = screenX - centerX + offset.x;
        const worldY = screenY - centerY + offset.y;

        return this.iso.screenToMap(worldX, worldY);
    }
}
