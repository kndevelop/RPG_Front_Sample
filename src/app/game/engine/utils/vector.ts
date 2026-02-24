/** 二次元ベクトルの計算をサポートするユーティリティ */
export class Vector2 {
    constructor(public x: number = 0, public y: number = 0) { }

    /** 2点間の距離を計算 */
    static distance(p1: { x: number, y: number }, p2: { x: number, y: number }): number {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** 目標地点への移動量を計算し、かつ目標を超えないようにクランプする */
    static moveTowards(current: number, target: number, maxDelta: number): number {
        if (Math.abs(target - current) <= maxDelta) {
            return target;
        }
        return current + Math.sign(target - current) * maxDelta;
    }
}
