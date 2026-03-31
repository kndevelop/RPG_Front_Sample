import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface MoveRequest {
    x: number;
    y: number;
}

@Injectable({
    providedIn: 'root'
})
export class GameEventService {

    /** 移動要求イベント */
    private moveRequestSubject = new Subject<MoveRequest>();
    moveRequest$ = this.moveRequestSubject.asObservable();

    /** アクション要求イベント（将来用） */
    private actionRequestSubject = new Subject<string>();
    actionRequest$ = this.actionRequestSubject.asObservable();

    /**
     * 移動を要求します。
     */
    requestMove(x: number, y: number): void {
        this.moveRequestSubject.next({ x, y });
    }

    /**
     * アクションを要求します。
     */
    requestAction(actionId: string): void {
        this.actionRequestSubject.next(actionId);
    }
}
