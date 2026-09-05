# work-img 公開前セキュリティ設定

## 今回反映した内容

1. **EXIF / GPSメタデータ除去の整合性**
   - 圧縮結果が元画像より大きくても、元ファイルへフォールバックしません。
   - 常にCanvas再エンコード結果をダウンロード対象にします。
   - 「すでに最適化済み」は容量削減がないことを示す表示だけです。

2. **DOM XSS対策**
   - ユーザー由来のファイル名を `innerHTML` に入れません。
   - `textContent` / DOM APIで結果カードを生成します。

3. **画像形式のホワイトリスト + シグネチャ確認**
   - JPG / PNG / WebP / AVIFのみ許可します。
   - MIMEタイプに加え、先頭バイトの画像シグネチャも確認します。

4. **ブラウザメモリ保護**
   - デスクトップ: 最大30ファイル、1ファイル35MB、合計200MB、1画像32MP、総220MP。
   - モバイル: 最大30ファイル、1ファイル35MB、合計100MB、1画像20MP、総100MP。
   - ZIP一括生成にも別途上限を設定しています。

5. **CSP**
   - 現在は広告コード未導入を前提に `connect-src 'none'` を適用しています。
   - CSS / JSは外部ファイルへ分離し、`script-src 'self'`, `style-src 'self'` を使用しています。
   - `index.html` にはMeta CSP、`_headers` にはHTTPヘッダー用設定例を含めています。

## AdSenseを有効化するとき

現在のCSPはAdSenseをブロックします。AdSense導入時は、Googleの最新公式ドキュメントに基づいて必要な `script-src`, `frame-src`, `connect-src`, `img-src` 等のみを追加してください。

同時に以下を実施してください。
- プライバシーポリシーを実際の広告構成に合わせて確認
- Cookie / 広告識別子の説明
- EEA・英国・スイス等で必要な場合はGoogle要件に適合するCMPを設定
- 「外部通信を一切しない」等の表現は使用せず、「画像ファイルを圧縮処理のために当社サーバーへ送信しない」と表現

## GitHub Pagesについて

GitHub Pagesでは `_headers` がHTTPレスポンスヘッダーとして反映されません。Meta CSPは機能しますが、`frame-ancestors` 等はHTTPヘッダーでのみ十分に適用できます。より厳格なヘッダー制御が必要な場合は、Cloudflare Pages / Netlify等、カスタムセキュリティヘッダーを設定できる配信環境を検討してください。

- `Permissions-Policy` と `frame-ancestors` は `_headers` のHTTPレスポンスヘッダー側で適用する想定です。Metaタグだけに依存しません。
