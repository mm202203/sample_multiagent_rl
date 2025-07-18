<<<<<<< HEAD
# マルチエージェント強化学習 Streamlit アプリ

PythonとStreamlitを使用したマルチエージェント強化学習のWebアプリケーションです。2つのエージェントがグリッド世界でQ学習を行い、競争型または協調型の行動を学習します。

## 🚀 機能

### 主要機能
- **リアルタイム学習シミュレーション**: エージェントの学習過程をリアルタイムで観察
- **インタラクティブパラメータ調整**: Webインターフェースから学習パラメータを調整
- **2つのエージェントモード**: 競争型と協調型の切り替え可能
- **豊富な可視化**: グリッド環境、学習進捗、統計情報をグラフ表示
- **データエクスポート**: 学習結果をCSVファイルでダウンロード

### エージェントタイプ
- **競争型**: 独立して学習し、他のエージェントと競争
- **協調型**: 知識を共有し、協力して環境を探索

## 📁 プロジェクト構造

```
multiagent_rl_streamlit/
├── app.py                          # メインのStreamlitアプリ
├── requirements.txt                # 依存関係
├── README.md                      # このファイル
├── src/                           # ソースコード
│   ├── __init__.py
│   ├── multiagent_rl.py          # メインのRL系システム
│   ├── agents/                    # エージェント関連
│   │   ├── __init__.py
│   │   └── agent.py              # Agentクラス
│   ├── environment/               # 環境関連
│   │   ├── __init__.py
│   │   └── environment.py        # Environmentクラス
│   └── visualization/             # 可視化関連
│       ├── __init__.py
│       └── plots.py              # プロット関数
├── utils/                         # ユーティリティ
├── data/                          # データファイル
└── config/                        # 設定ファイル
```

## 🛠️ セットアップ

### 1. 必要な依存関係をインストール

```bash
pip install -r requirements.txt
```

### 2. アプリケーションを起動

```bash
streamlit run app.py
```

### 3. ブラウザでアクセス

ブラウザで `http://localhost:8501` にアクセスしてアプリを使用します。

## 📊 使用方法

### 1. パラメータ設定
サイドバーで以下のパラメータを調整できます：

**環境設定:**
- グリッドサイズ (5-20)
- 障害物の数 (0-20)
- 報酬の位置数 (1-10)

**学習パラメータ:**
- 学習率 α (0.01-1.0)
- 割引率 γ (0.1-1.0)
- 探索率 ε (0.0-1.0)

**エージェントタイプ:**
- 競争型 / 協調型
- 報酬分配率 (協調型のみ)
- 情報共有率 (協調型のみ)

### 2. シミュレーション実行
- **開始ボタン**: シミュレーションを開始
- **一時停止ボタン**: 実行中のシミュレーションを一時停止
- **リセットボタン**: 環境と学習データをリセット

### 3. 結果分析
4つのタブで結果を分析できます：

- **🌍 環境**: 現在のグリッド状態とエージェント統計
- **📊 報酬推移**: エピソードごとの報酬の変化
- **🧠 学習メトリクス**: 学習進捗の詳細分析
- **🤝 協調分析**: 協調型での協調行動の分析

## 🧠 アルゴリズム

### Q学習 (Q-Learning)
各エージェントはQ学習アルゴリズムを使用して学習します：

```
Q(s,a) = Q(s,a) + α[r + γ*max(Q(s',a')) - Q(s,a)]
```

- `s`: 現在の状態
- `a`: 行動
- `r`: 報酬
- `α`: 学習率
- `γ`: 割引率

### ε-グリーディ法
行動選択には ε-グリーディ法を使用：
- 確率 ε で探索（ランダム行動）
- 確率 (1-ε) で活用（最適行動）

### 協調メカニズム
協調型エージェントの特徴：
- **知識共有**: Q-tableの情報を相互に共有
- **報酬分配**: 近くにいる際の報酬分配
- **協調行動**: 他のエージェントに近づく傾向

## 📈 可視化機能

### グリッド環境
- **白**: 空のセル
- **灰色**: 障害物
- **金色**: 報酬
- **青色**: Agent 1
- **赤色**: Agent 2

### グラフ表示
- **報酬推移**: 各エージェントの学習曲線
- **学習メトリクス**: 平均報酬、Q値範囲、学習済み状態数
- **協調分析**: 協調成功数の推移

## 🔧 カスタマイズ

### 新しいエージェントタイプの追加
1. `src/agents/agent.py`の`select_action`メソッドを拡張
2. `src/multiagent_rl.py`に新しいモードのロジックを追加
3. `app.py`のUIに新しい選択肢を追加

### 環境の拡張
1. `src/environment/environment.py`に新しい要素を追加
2. `src/visualization/plots.py`で新しい可視化を実装

## 🎯 学習目的

このアプリケーションを通じて以下を学習できます：

- **強化学習の基礎**: Q学習アルゴリズムの動作
- **マルチエージェント学習**: 複数のエージェントが同時に学習する環境
- **協調と競争**: 異なるエージェントタイプの比較
- **Pythonプログラミング**: オブジェクト指向設計とクラス構造
- **データ可視化**: Streamlit、Plotly、Matplotlibの使用
- **Webアプリケーション**: インタラクティブなWebアプリの開発

## 🐛 トラブルシューティング

### よくある問題

**1. インポートエラー**
```bash
# パッケージが不足している場合
pip install -r requirements.txt
```

**2. アプリが起動しない**
```bash
# ポートが使用中の場合
streamlit run app.py --server.port 8502
```

**3. グラフが表示されない**
- ブラウザを更新してください
- 10エピソード以上実行してからメトリクスを確認してください

## 📚 参考資料

- [Streamlit Documentation](https://docs.streamlit.io/)
- [強化学習入門](https://www.oreilly.co.jp/books/9784873119465/)
- [マルチエージェント強化学習](https://www.jstage.jst.go.jp/browse/tjsai)

## 🤝 貢献

プルリクエストや課題報告を歓迎します。以下の方法で貢献できます：

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👥 作成者

- **Claude** - AI アシスタント by Anthropic

---

**注意**: このアプリケーションは教育目的で作成されており、研究や商用利用の前に適切な検証を行ってください。
=======
# sample_multiagent_rl
claudeでマルチエージェント強化学習のシミュレーションを実装。
>>>>>>> 3e3b1df5a11513a6ce0d4919fc96459b8d6eb2f6
