import * as PIXI from 'pixi.js';
import { Camera } from './camera';
import { Player } from './player';
import { IsoMath } from './iso-math';
import { Point } from './constants';

/** 入力処理（クリック、将来的なキーボードなど）を管理するクラス */
export class InputManager {

    constructor(
        private app: PIXI.Application,
        private iso: IsoMath,
        private camera: Camera,
        private player: Player
    ) {
        this.setupEvents();
    }

    private setupEvents() {
        this.app.stage.eventMode = 'static';
        this.app.stage.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
            const mapPos = this.screenToMap(event.global.x, event.global.y);
            this.handleMapClick(mapPos.x, mapPos.y);
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

    /** マップがクリックされた時のコールバック（GameEngineなどで上書き可能にする予定） */
    public onMapClick: (x: number, y: number) => void = () => { };

    private handleMapClick(x: number, y: number) {
        this.onMapClick(x, y);
    }
}
