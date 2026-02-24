# RPG_Front_Sample

このプロジェクトは、Angular と PIXI.js を使用して構築された、アイソメトリック（クォータービュー）形式の RPG フロントエンドサンプルです。

## 主な機能

- **アイソメトリックエンジン**: `IsoMath` による座標変換（マップ座標 ↔ 画面座標）。
- **タイルベースのマップシステム**:
  - `GameMap` クラスによる 2 次元レイアウト管理。
  - タイルタイプ（草地、水辺、壁、道）に応じた通行判定。
  - 立体的な壁（WALL）の自動描画。
- **動的なレンダリング**:
  - タイルごとのテクスチャ画像適用、および画像がない場合のカラーフォールバック機能。
  - プレイヤーのカメラ追従と奥行きを考慮した描画順序。
- **プレイヤー操作**:
  - クリックした位置への自動移動。
  - 移動方向（右下/左上）に応じたスプライトの自動反転。

## 技術スタック

- **Framework**: Angular
- **Rendering**: PIXI.js v7
- **Language**: TypeScript

## プロジェクト構造

```text
src/app/game/
├── engine/             # ゲームコアエンジン
│   ├── camera.ts       # カメラ制御
│   ├── game-engine.ts  # 全体制御・入出力
│   ├── game-map.ts     # マップデータ・衝突判定
│   ├── iso-math.ts     # アイソメトリック計算
│   ├── player.ts       # プレイヤーロジック
│   └── renderer.ts     # PIXI.js による描画ロジック
└── game.component.ts   # Angular コンポーネント（PIXI初期化・BGM制御）
```

## アセットの設定

画像や音声は `src/assets/` に配置します。

### マップチップ (`assets/tiles/`)
正方形（64x64推奨）の画像を置くと、各タイルに適用されます。
- `grass.png`: 草地
- `water.png`: 水辺
- `wall.png`: 壁（上面に使用）
- `road.png`: 道

## 開発サーバーの起動

```bash
npm run start
```
起動後、 `http://localhost:4200` にアクセスしてください。
