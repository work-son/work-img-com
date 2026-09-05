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
