(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const qualityRange = $('#quality');
  const qualityInput = $('#qualityInput');
  const resizeInput = $('#resizeInput');
  const fileInput = $('#fileInput');
  const pickBtn = $('#pickBtn');
  const dropzone = $('#dropzone');
  const formatSelect = $('#formatSelect');
  const downloadAll = $('#downloadAll');
  const results = $('#results');
  const summary = $('#summary');
  const statusEl = $('#status');
  const deltaLabel = $('#summaryDeltaLabel');

  const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
  const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);

  const LIMITS = IS_MOBILE ? {
    maxFiles: 30,
    maxFileBytes: 35 * 1024 * 1024,
    maxTotalInputBytes: 100 * 1024 * 1024,
    maxPixelsPerFile: 20_000_000,
    maxTotalSourcePixels: 100_000_000,
    maxDimension: 7000,
    maxZipBytes: 80 * 1024 * 1024
  } : {
    maxFiles: 30,
    maxFileBytes: 35 * 1024 * 1024,
    maxTotalInputBytes: 200 * 1024 * 1024,
    maxPixelsPerFile: 32_000_000,
    maxTotalSourcePixels: 220_000_000,
    maxDimension: 8192,
    maxZipBytes: 180 * 1024 * 1024
  };

  let lang = 'ja';
  let sourceFiles = [];
  let jobs = [];
  let recompressTimer = 0;

  const I18N = {
    ja: {
      navTool:'画像圧縮', navFeatures:'機能', badge:'🔒 サーバー送信なしの画像圧縮',
      heroLine1:'画像は軽く。', heroLine2:'プライバシーはそのまま。',
      heroCopy:'JPG・PNG・WebP画像をブラウザ上ですぐに圧縮できます。画像ファイルは圧縮処理のために当社サーバーへ送信されません。',
      trust1:'✓ 無料', trust2:'✓ 登録不要', trust3:'✓ ローカル処理',
      dropTitle:'画像をここにドラッグ＆ドロップ', dropHelp:'またはボタンから選択 · 複数枚対応', choose:'画像を選択',
      privacyInline:'🛡️ 画像の圧縮処理はこのブラウザ内で行われます。',
      limitNote:'安全のため、ファイル数・合計容量・総画素数に上限があります。',
      qualityLabel:'圧縮品質', formatLabel:'出力形式', keepFormat:'元の形式を維持', resizeLabel:'画像サイズ',
      downloadZip:'ZIPですべてダウンロード', summaryBefore:'圧縮前', summaryAfter:'圧縮後', summarySaved:'削減率', summaryIncrease:'増加率',
      donationTitle:'work-img を応援してください', donationText:'このサービスは無料で提供しています。運営継続のため、ご支援いただけるととても嬉しいです。', donateBtn:'寄付する',
      featureKicker:'WHY WORK-IMG', featureTitle:'シンプルでも必要な機能はしっかり',
      f1Title:'サーバー送信なし', f1Text:'画像ファイルは圧縮処理のために当社サーバーへ送信されず、ユーザーのブラウザ内で処理されます。',
      f2Title:'メタデータ削除', f2Text:'出力画像は必ずCanvasで再エンコードし、一般的なEXIF・GPSなど元画像のメタデータを引き継がないようにします。',
      f3Title:'一括ダウンロード', f3Text:'圧縮した複数の画像をまとめてZIPでダウンロードできます。',
      f4Title:'モバイル対応', f4Text:'スマートフォンやタブレットではメモリ負荷を抑えるため、より保守的な処理上限を適用します。',
      faqTitle:'よくある質問',
      faq1q:'本当に画像はサーバーへ送信されませんか？', faq1a:'画像ファイルは圧縮処理のために当社サーバーへ送信されません。圧縮はブラウザ内で行います。広告など別機能を導入した場合は、それらのサービスとの通信が発生する場合があります。',
      faq2q:'PNGも圧縮できますか？', faq2a:'可能です。PNGは可逆形式のため、すでに最適化されている場合は容量が減らないことがあります。その場合でもメタデータ除去のため再エンコード結果を出力します。',
      faq3q:'写真の位置情報も削除されますか？', faq3a:'出力画像は必ずCanvasで再エンコードするため、元画像の一般的なEXIF・GPS位置情報は結果ファイルへ引き継がれません。',
      footerDesc:'サーバー送信なしで安全に使える無料画像圧縮ツール。', privacyLink:'プライバシーポリシー', termsLink:'利用規約', contactLink:'お問い合わせ',
      processing:'画像を処理しています…', done:'圧縮が完了しました。', failed:'一部の画像を処理できませんでした。',
      download:'ダウンロード', remove:'削除', original:'元画像', compressed:'圧縮後', saved:'削減', increase:'容量増加',
      optimizedBadge:'すでに最適化済み', optimizedStatus:'一部のファイルはすでに十分に最適化されており、容量削減がありません。メタデータ除去のため再エンコード結果を使用しています。',
      pngHint:'PNGは可逆形式のため、JPG / WebPより容量変化が小さい場合があります。',
      unsupported:'対応していない画像形式が含まれています。JPG / PNG / WebP / AVIFのみ利用できます。',
      signatureMismatch:'ファイル拡張子・MIMEタイプと実際の画像形式が一致しないファイルを除外しました。',
      tooMany:'一度に処理できるファイルは最大30個です。',
      fileTooLarge:'1ファイルの上限を超える画像があります。',
      totalTooLarge:'選択したファイルの合計容量が安全上限を超えています。',
      pixelsTooLarge:'画像の総画素数が安全上限を超えています。ファイル数または画像サイズを減らしてください。',
      zipTooLarge:'ZIP作成時のメモリ負荷を避けるため、一括ダウンロードできる合計容量を超えています。個別にダウンロードしてください。'
    },
    ko: {
      navTool:'이미지 압축', navFeatures:'기능', badge:'🔒 서버 전송 없는 이미지 압축',
      heroLine1:'이미지는 가볍게.', heroLine2:'개인정보는 그대로.',
      heroCopy:'JPG, PNG, WebP 이미지를 브라우저에서 바로 압축합니다. 이미지 파일은 압축 처리를 위해 당사 서버로 전송되지 않습니다.',
      trust1:'✓ 무료', trust2:'✓ 회원가입 없음', trust3:'✓ 로컬 처리',
      dropTitle:'이미지를 여기에 드래그하세요', dropHelp:'또는 버튼을 눌러 파일을 선택하세요 · 여러 장 가능', choose:'이미지 선택',
      privacyInline:'🛡️ 이미지 압축 처리는 현재 브라우저 안에서 이루어집니다.',
      limitNote:'안전을 위해 파일 수, 총 용량, 총 픽셀 수에 제한이 있습니다.',
      qualityLabel:'압축 품질', formatLabel:'출력 형식', keepFormat:'원본 형식 유지', resizeLabel:'이미지 크기',
      downloadZip:'ZIP으로 모두 다운로드', summaryBefore:'압축 전', summaryAfter:'압축 후', summarySaved:'절감률', summaryIncrease:'증가율',
      donationTitle:'work-img를 후원해 주세요', donationText:'이 서비스는 무료로 제공하고 있습니다. 운영을 계속할 수 있도록 도움을 주시면 정말 감사하겠습니다.', donateBtn:'기부하기',
      featureKicker:'WHY WORK-IMG', featureTitle:'간단하지만 필요한 기능은 제대로',
      f1Title:'서버 전송 없음', f1Text:'이미지 파일은 압축 처리를 위해 당사 서버로 전송되지 않으며 사용자의 브라우저 안에서 처리됩니다.',
      f2Title:'메타데이터 제거', f2Text:'결과 이미지는 항상 Canvas로 다시 인코딩하여 일반적인 EXIF·GPS 등 원본 메타데이터를 이어받지 않도록 합니다.',
      f3Title:'일괄 다운로드', f3Text:'압축한 여러 이미지를 ZIP으로 한 번에 다운로드할 수 있습니다.',
      f4Title:'모바일 대응', f4Text:'스마트폰과 태블릿에서는 메모리 부담을 줄이기 위해 더 보수적인 처리 한도를 적용합니다.',
      faqTitle:'자주 묻는 질문',
      faq1q:'정말 이미지가 서버로 전송되지 않나요?', faq1a:'이미지 파일은 압축 처리를 위해 당사 서버로 전송되지 않습니다. 압축은 브라우저 안에서 수행됩니다. 광고 등 별도 기능을 도입하면 해당 서비스와 통신할 수 있습니다.',
      faq2q:'PNG도 압축할 수 있나요?', faq2a:'가능합니다. 이미 최적화된 PNG는 용량이 줄지 않을 수 있습니다. 이 경우에도 메타데이터 제거를 위해 재인코딩 결과를 출력합니다.',
      faq3q:'사진의 위치 정보도 제거되나요?', faq3a:'결과 이미지는 항상 Canvas로 다시 인코딩하므로 원본의 일반적인 EXIF·GPS 위치 정보가 결과 파일에 이어지지 않습니다.',
      footerDesc:'서버 전송 없이 안전하게 사용하는 무료 이미지 압축 도구.', privacyLink:'개인정보처리방침', termsLink:'이용약관', contactLink:'문의',
      processing:'이미지를 처리하고 있습니다…', done:'압축이 완료되었습니다.', failed:'일부 이미지를 처리하지 못했습니다.',
      download:'다운로드', remove:'삭제', original:'원본', compressed:'압축 후', saved:'절감', increase:'용량 증가',
      optimizedBadge:'이미 최적화됨', optimizedStatus:'일부 파일은 이미 충분히 최적화되어 용량이 줄지 않습니다. 메타데이터 제거를 위해 재인코딩 결과를 사용합니다.',
      pngHint:'PNG는 무손실 형식이라 JPG / WebP보다 용량 변화가 작을 수 있습니다.',
      unsupported:'지원하지 않는 이미지 형식이 포함되어 있습니다. JPG / PNG / WebP / AVIF만 사용할 수 있습니다.',
      signatureMismatch:'파일의 MIME 타입과 실제 이미지 형식이 일치하지 않는 파일을 제외했습니다.',
      tooMany:'한 번에 처리할 수 있는 파일은 최대 30개입니다.',
      fileTooLarge:'개별 파일 용량 제한을 초과한 이미지가 있습니다.',
      totalTooLarge:'선택한 파일의 총 용량이 안전 한도를 초과했습니다.',
      pixelsTooLarge:'이미지의 총 픽셀 수가 안전 한도를 초과했습니다. 파일 수나 이미지 크기를 줄여주세요.',
      zipTooLarge:'ZIP 생성 시 메모리 부담을 피하기 위해 일괄 다운로드 한도를 초과했습니다. 개별 다운로드를 이용해 주세요.'
    },
    en: {
      navTool:'Compress', navFeatures:'Features', badge:'🔒 Image compression without server uploads',
      heroLine1:'Lighter images.', heroLine2:'Your privacy stays yours.',
      heroCopy:'Compress JPG, PNG and WebP images in your browser. Image files are not sent to our server for compression.',
      trust1:'✓ Free', trust2:'✓ No account', trust3:'✓ Local processing',
      dropTitle:'Drag & drop images here', dropHelp:'Or choose files · multiple images supported', choose:'Choose images',
      privacyInline:'🛡️ Image compression is performed inside this browser.',
      limitNote:'For stability, limits apply to file count, total size and total pixel count.',
      qualityLabel:'Compression quality', formatLabel:'Output format', keepFormat:'Keep original format', resizeLabel:'Image size',
      downloadZip:'Download all as ZIP', summaryBefore:'Before', summaryAfter:'After', summarySaved:'Saved', summaryIncrease:'Increase',
      donationTitle:'Support work-img', donationText:'This service is free. Your support helps us keep it running.', donateBtn:'Donate',
      featureKicker:'WHY WORK-IMG', featureTitle:'Simple, with the features that matter',
      f1Title:'No server uploads', f1Text:'Image files are not sent to our server for compression and are processed inside your browser.',
      f2Title:'Metadata removal', f2Text:'Every output image is re-encoded through Canvas so common source EXIF/GPS metadata is not carried over.',
      f3Title:'Batch download', f3Text:'Download multiple processed images together as a ZIP file.',
      f4Title:'Mobile friendly', f4Text:'More conservative processing limits are used on phones and tablets to reduce memory pressure.',
      faqTitle:'Frequently asked questions',
      faq1q:'Are images really not uploaded to a server?', faq1a:'Image files are not sent to our server for compression. Compression runs in your browser. If separate features such as advertising are added, those services may make their own network requests.',
      faq2q:'Can PNG files be compressed?', faq2a:'Yes. An already optimized PNG may not become smaller. Even then, the re-encoded result is used so source metadata is not carried over.',
      faq3q:'Is photo location data removed?', faq3a:'Every result is re-encoded through Canvas, so common source EXIF/GPS location metadata is not carried into the output.',
      footerDesc:'A free image compression tool that works without server uploads.', privacyLink:'Privacy', termsLink:'Terms', contactLink:'Contact',
      processing:'Processing images…', done:'Compression complete.', failed:'Some images could not be processed.',
      download:'Download', remove:'Remove', original:'Original', compressed:'Processed', saved:'Saved', increase:'Size increase',
      optimizedBadge:'Already optimized', optimizedStatus:'Some files are already sufficiently optimized and did not become smaller. The re-encoded result is still used to remove source metadata.',
      pngHint:'PNG is lossless, so size changes may be smaller than JPG / WebP.',
      unsupported:'Unsupported image types were found. Only JPG / PNG / WebP / AVIF are accepted.',
      signatureMismatch:'Files whose MIME type did not match the actual image signature were excluded.',
      tooMany:'A maximum of 30 files can be processed at once.',
      fileTooLarge:'One or more files exceed the per-file size limit.',
      totalTooLarge:'The total selected file size exceeds the safe processing limit.',
      pixelsTooLarge:'The total image pixel count exceeds the safe limit. Reduce the number or size of images.',
      zipTooLarge:'The batch download exceeds the safe ZIP memory limit. Please download files individually.'
    }
  };

  const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N.ja[key] || key;

  function setLanguage(next) {
    lang = next;
    document.documentElement.lang = next;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    render();
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function showStatus(message, type='info') {
    statusEl.textContent = message;
    statusEl.className = `status show ${type}`;
  }

  function clearStatus() {
    statusEl.textContent = '';
    statusEl.className = 'status';
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  function safeName(name) {
    return name.replace(/[^\w.\-가-힣ぁ-んァ-ヶ一-龯]+/g, '_');
  }

  function extension(type) {
    if (type === 'image/jpeg') return 'jpg';
    if (type === 'image/png') return 'png';
    if (type === 'image/webp') return 'webp';
    return 'img';
  }

  function basename(name) { return name.replace(/\.[^.]+$/, ''); }

  function outputType(file) {
    if (formatSelect.value !== 'auto') return formatSelect.value;
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file.type;
    return 'image/webp';
  }

  function updateQualityUI() {
    const q = clamp(parseInt(qualityRange.value || '80', 10), 20, 95);
    qualityRange.value = String(q);
    qualityInput.value = String(q);
  }

  function updateResizeUI() {
    const value = clamp(parseInt(resizeInput.value || '100', 10), 10, 100);
    resizeInput.value = String(value);
  }

  function revokeJob(job) {
    try { URL.revokeObjectURL(job.previewUrl); } catch (_) {}
    try { URL.revokeObjectURL(job.outputUrl); } catch (_) {}
  }

  async function sniffImageType(file) {
    const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png';
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP') return 'image/webp';
    if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(4,8)) === 'ftyp') {
      const brands = String.fromCharCode(...bytes.slice(8));
      if (brands.includes('avif') || brands.includes('avis')) return 'image/avif';
    }
    return null;
  }

  async function validateFiles(files) {
    const input = [...files];
    if (input.length > LIMITS.maxFiles) throw new Error('too-many');

    let totalBytes = 0;
    const accepted = [];
    let unsupported = false;
    let signatureMismatch = false;

    for (const file of input) {
      if (!ALLOWED_TYPES.has(file.type)) { unsupported = true; continue; }
      if (file.size > LIMITS.maxFileBytes) throw new Error('file-too-large');
      totalBytes += file.size;
      if (totalBytes > LIMITS.maxTotalInputBytes) throw new Error('total-too-large');

      const actualType = await sniffImageType(file);
      if (!actualType || actualType !== file.type) { signatureMismatch = true; continue; }
      accepted.push(file);
    }

    if (!accepted.length && unsupported) throw new Error('unsupported');
    if (!accepted.length && signatureMismatch) throw new Error('signature-mismatch');
    return { accepted, unsupported, signatureMismatch };
  }

  async function loadBitmap(file) {
    if ('createImageBitmap' in window) {
      try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (_) {}
    }
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }

  function quantizePng(ctx, width, height, q) {
    if (q >= 0.95) return;
    try {
      const levels = Math.max(24, Math.round(24 + q * 160));
      const step = 255 / (levels - 1);
      const image = ctx.getImageData(0, 0, width, height);
      const data = image.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round(data[i] / step) * step;
        data[i+1] = Math.round(data[i+1] / step) * step;
        data[i+2] = Math.round(data[i+2] / step) * step;
      }
      ctx.putImageData(image, 0, 0);
    } catch (_) {
      // Continue without palette-like reduction if memory pressure prevents getImageData.
    }
  }

  async function compressOne(file, remainingPixelBudget) {
    const bitmap = await loadBitmap(file);
    const srcW = bitmap.width || bitmap.naturalWidth;
    const srcH = bitmap.height || bitmap.naturalHeight;
    const sourcePixels = srcW * srcH;

    if (!srcW || !srcH || sourcePixels > LIMITS.maxPixelsPerFile || sourcePixels > remainingPixelBudget) {
      if (bitmap.close) bitmap.close();
      const err = new Error('pixels-too-large');
      err.code = 'pixels-too-large';
      throw err;
    }

    const requestedScale = clamp(parseInt(resizeInput.value || '100', 10), 10, 100) / 100;
    const scale = Math.min(requestedScale, LIMITS.maxDimension / srcW, LIMITS.maxDimension / srcH, 1);
    const width = Math.max(1, Math.round(srcW * scale));
    const height = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('canvas');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    if (bitmap.close) bitmap.close();

    const type = outputType(file);
    const q = clamp(parseInt(qualityRange.value || '80', 10), 20, 95) / 100;
    if (type === 'image/png') quantizePng(ctx, width, height, q);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error('encode')), type, q);
    });

    // Security/privacy guarantee: ALWAYS use the Canvas re-encoded result.
    // We never fall back to the source file, even when the result is larger.
    const optimized = type === file.type && scale === 1 && blob.size >= file.size;

    return {
      id: (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random()}`,
      file,
      blob,
      outputType: type,
      width,
      height,
      sourcePixels,
      optimized,
      previewUrl: URL.createObjectURL(file),
      outputUrl: URL.createObjectURL(blob)
    };
  }

  async function processFiles(files) {
    clearStatus();
    let validation;
    try {
      validation = await validateFiles(files);
    } catch (error) {
      const map = {
        'too-many':'tooMany', 'file-too-large':'fileTooLarge', 'total-too-large':'totalTooLarge',
        'unsupported':'unsupported', 'signature-mismatch':'signatureMismatch'
      };
      showStatus(t(map[error.message] || 'failed'), 'warn');
      return;
    }

    const accepted = validation.accepted;
    if (!accepted.length) return;

    sourceFiles = accepted;
    showStatus(t('processing'), 'info');

    const next = [];
    let remainingPixels = LIMITS.maxTotalSourcePixels;
    let failed = 0;
    let pixelLimitHit = false;

    for (const file of accepted) {
      try {
        const job = await compressOne(file, remainingPixels);
        remainingPixels -= job.sourcePixels;
        next.push(job);
      } catch (error) {
        if (error.code === 'pixels-too-large') pixelLimitHit = true;
        else failed++;
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    jobs.forEach(revokeJob);
    jobs = next;
    render();

    if (pixelLimitHit) showStatus(t('pixelsTooLarge'), 'warn');
    else if (failed) showStatus(t('failed'), 'warn');
    else if (validation.signatureMismatch) showStatus(t('signatureMismatch'), 'warn');
    else if (validation.unsupported) showStatus(t('unsupported'), 'warn');
    else if (jobs.some((job) => job.optimized)) showStatus(t('optimizedStatus'), 'info');
    else if (sourceFiles.some((file) => file.type === 'image/png') && formatSelect.value === 'auto') showStatus(t('pngHint'), 'warn');
    else showStatus(t('done'), 'info');
  }

  async function recompress() {
    if (sourceFiles.length) await processFiles(sourceFiles);
  }

  function appendText(parent, className, value, title) {
    const el = document.createElement('span');
    if (className) el.className = className;
    el.textContent = value;
    if (title) el.title = title;
    parent.appendChild(el);
    return el;
  }

  function render() {
    results.replaceChildren();

    for (const job of jobs) {
      const delta = job.file.size ? ((job.file.size - job.blob.size) / job.file.size) * 100 : 0;
      const isSaving = delta >= 0;

      const card = document.createElement('article');
      card.className = 'result-card';

      const thumb = document.createElement('img');
      thumb.className = 'thumb';
      thumb.src = job.previewUrl;
      thumb.alt = '';
      card.appendChild(thumb);

      const info = document.createElement('div');
      const fileName = document.createElement('div');
      fileName.className = 'file-name';
      fileName.textContent = job.file.name;
      fileName.title = job.file.name;
      info.appendChild(fileName);

      const meta = document.createElement('div');
      meta.className = 'file-meta';
      appendText(meta, '', `${t('original')} ${formatBytes(job.file.size)}`);
      appendText(meta, '', `${t('compressed')} ${formatBytes(job.blob.size)}`);
      appendText(meta, '', `${job.width}×${job.height}`);
      appendText(meta, '', job.outputType.replace('image/','').toUpperCase());
      appendText(meta, isSaving ? 'good' : 'bad', isSaving ? `${t('saved')} ${Math.max(0, delta).toFixed(1)}%` : `${t('increase')} ${Math.abs(delta).toFixed(1)}%`);
      if (job.optimized) appendText(meta, 'optimized-note', t('optimizedBadge'));
      info.appendChild(meta);
      card.appendChild(info);

      const actions = document.createElement('div');
      actions.className = 'file-actions';
      const down = document.createElement('button');
      down.type = 'button'; down.className = 'small-btn primary'; down.dataset.action = 'download'; down.dataset.id = job.id; down.textContent = t('download');
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'small-btn'; remove.dataset.action = 'remove'; remove.dataset.id = job.id; remove.textContent = t('remove');
      actions.append(down, remove);
      card.appendChild(actions);
      results.appendChild(card);
    }

    const before = jobs.reduce((sum, job) => sum + job.file.size, 0);
    const after = jobs.reduce((sum, job) => sum + job.blob.size, 0);
    const delta = before ? ((before - after) / before) * 100 : 0;
    const isSaving = delta >= 0;

    $('#beforeTotal').textContent = formatBytes(before);
    $('#afterTotal').textContent = formatBytes(after);
    $('#savedTotal').textContent = `${Math.abs(delta).toFixed(1)}%`;
    $('#savedTotal').className = isSaving ? 'saved' : 'increased';
    deltaLabel.textContent = isSaving ? t('summarySaved') : t('summaryIncrease');
    summary.hidden = jobs.length === 0;
    downloadAll.disabled = jobs.length === 0;
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  const u16 = (n) => [n & 255, (n >>> 8) & 255];
  const u32 = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];

  async function buildZip(items) {
    const encoder = new TextEncoder();
    const chunks = [];
    const central = [];
    let offset = 0;

    for (const item of items) {
      const nameBytes = encoder.encode(item.name);
      const data = new Uint8Array(await item.blob.arrayBuffer());
      const crc = crc32(data);
      const local = new Uint8Array([
        ...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0),
        ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0)
      ]);
      chunks.push(local, nameBytes, data);
      const cent = new Uint8Array([
        ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0),
        ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0), ...u16(0),
        ...u16(0), ...u16(0), ...u32(0), ...u32(offset)
      ]);
      central.push(cent, nameBytes);
      offset += local.length + nameBytes.length + data.length;
    }

    const centralSize = central.reduce((sum, item) => sum + item.length, 0);
    const end = new Uint8Array([
      ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(items.length), ...u16(items.length),
      ...u32(centralSize), ...u32(offset), ...u16(0)
    ]);
    return new Blob([...chunks, ...central, end], { type:'application/zip' });
  }

  async function downloadAllZip() {
    if (!jobs.length) return;
    const totalBytes = jobs.reduce((sum, job) => sum + job.blob.size, 0);
    if (totalBytes > LIMITS.maxZipBytes) {
      showStatus(t('zipTooLarge'), 'warn');
      return;
    }

    showStatus(t('processing'), 'info');
    const seen = new Map();
    const items = jobs.map((job) => {
      let name = `${safeName(basename(job.file.name))}-compressed.${extension(job.outputType)}`;
      const count = seen.get(name) || 0;
      seen.set(name, count + 1);
      if (count) name = `${safeName(basename(job.file.name))}-compressed-${count + 1}.${extension(job.outputType)}`;
      return { name, blob: job.blob };
    });

    try {
      const zip = await buildZip(items);
      downloadBlob(zip, 'work-img-compressed.zip');
      showStatus(t('done'), 'info');
    } catch (_) {
      showStatus(t('failed'), 'error');
    }
  }

  qualityRange.addEventListener('input', () => {
    updateQualityUI();
    clearTimeout(recompressTimer);
    recompressTimer = setTimeout(recompress, 250);
  });
  qualityInput.addEventListener('input', () => {
    qualityRange.value = String(clamp(parseInt(qualityInput.value || '80', 10), 20, 95));
    updateQualityUI();
    clearTimeout(recompressTimer);
    recompressTimer = setTimeout(recompress, 250);
  });
  resizeInput.addEventListener('input', () => {
    updateResizeUI();
    clearTimeout(recompressTimer);
    recompressTimer = setTimeout(recompress, 250);
  });
  formatSelect.addEventListener('change', recompress);

  pickBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => processFiles(event.target.files));

  ['dragenter','dragover'].forEach((type) => dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  }));
  ['dragleave','drop'].forEach((type) => dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
  }));
  dropzone.addEventListener('drop', (event) => processFiles(event.dataTransfer.files));
  dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });

  results.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const job = jobs.find((item) => item.id === button.dataset.id);
    if (!job) return;

    if (button.dataset.action === 'download') {
      downloadBlob(job.blob, `${safeName(basename(job.file.name))}-compressed.${extension(job.outputType)}`);
    } else if (button.dataset.action === 'remove') {
      revokeJob(job);
      jobs = jobs.filter((item) => item.id !== job.id);
      sourceFiles = sourceFiles.filter((file) => file !== job.file);
      render();
      if (!jobs.length) clearStatus();
    }
  });

  downloadAll.addEventListener('click', downloadAllZip);
  $('#langSelect').addEventListener('change', (event) => setLanguage(event.target.value));

  updateQualityUI();
  updateResizeUI();
  setLanguage('ja');
})();
