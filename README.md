# work-img v5 secure pre-release

日本語を基本言語とした公開前セキュリティ・安定性修正版です。

## 主な変更
- 元画像フォールバックを廃止し、常にCanvas再エンコード結果を使用
- ファイル名DOM XSS対策（textContent / DOM API）
- JPG / PNG / WebP / AVIFのホワイトリスト + 実ファイルシグネチャ確認
- 合計容量・総画素数・ZIP容量のメモリ安全上限
- モバイル向け保守的な上限
- CSS / JavaScriptを外部ファイル化
- 広告未導入時用の厳格CSP（connect-src 'none'）
- Privacy / Termsの公開前文言を整理
- AdSense導入時の注意事項をSECURITY.mdに記載

## 公開ファイル
- index.html
- assets/css/app.css
- assets/js/app.js
- assets/icons/*
- privacy.html
- terms.html
- contact.html
- _headers
- SECURITY.md

実際にAdSenseを導入する前に、SECURITY.mdの注意事項に沿ってCSPとCMP設定を更新してください。

## モバイル表示チェック（v5.1）
- 320px / 360px / 390px 幅を想定して調整
- 言語セレクターを右端へ固定
- モバイルではメインナビゲーションを非表示
- 圧縮品質のスライダーを可変幅にし、数値入力と同一行でオーバーフローしないよう調整
- 圧縮品質から出力形式までの縦間隔を縮小
- 広告枠、アップロードエリア、結果カード、寄付バナーの余白をモバイル向けに調整
- フッターは狭い画面で無理に横一列を維持せず、必要時のみ自然に折り返し

## v5.2 モバイル間隔調整
- モバイルでは圧縮品質下の 20% / 95% 補助目盛りを非表示
- 圧縮品質 → 出力形式の縦間隔を短縮
- デスクトップでは補助目盛りを維持
