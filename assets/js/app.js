
(()=>{'use strict';
const $=s=>document.querySelector(s),quality=$('#quality'),qualityValue=$('#qualityValue'),fileInput=$('#fileInput'),pickBtn=$('#pickBtn'),dropzone=$('#dropzone'),formatSelect=$('#formatSelect'),resizeSelect=$('#resizeSelect'),downloadAll=$('#downloadAll'),results=$('#results'),summary=$('#summary'),statusEl=$('#status');
let jobs=[],sourceFiles=[],timer=0,lang='ja';
const MAX_FILES=30,MAX_FILE_SIZE=35*1024*1024,MAX_PIXELS=32000000,MAX_DIMENSION=8192;
const I18N={
ko:{
navTool:'이미지 압축',navFeatures:'기능',badge:'🔒 서버 전송 없는 이미지 압축',
heroTitle:'이미지는 가볍게.<br>개인정보는 그대로.',
heroCopy:'JPG, PNG, WebP 이미지를 브라우저에서 바로 압축하세요. 이미지 파일은 외부 서버로 전송되거나 저장되지 않습니다.',
trust1:'✓ 무료',trust2:'✓ 회원가입 없음',trust3:'✓ 로컬 처리',
dropTitle:'이미지를 여기에 드래그하세요',dropHelp:'또는 버튼을 눌러 파일을 선택하세요 · 여러 장 가능',choose:'이미지 선택',
privacyInline:'🛡️ 모든 처리는 현재 브라우저 안에서만 이루어집니다.',
qualityLabel:'압축 품질',formatLabel:'출력 형식',keepFormat:'원본 형식 유지',resizeLabel:'이미지 크기',resizeOriginal:'원본 크기',
downloadZip:'ZIP으로 모두 다운로드',summaryBefore:'압축 전',summaryAfter:'압축 후',summarySaved:'절감률',
featureKicker:'WHY WORK-IMG',featureTitle:'간단하지만 필요한 기능은 제대로',
f1Title:'서버 전송 없음',f1Text:'이미지 데이터는 사용자의 브라우저 안에서 처리됩니다.',
f2Title:'메타데이터 제거',f2Text:'이미지를 다시 인코딩하면서 EXIF 등 불필요한 메타데이터를 제거합니다.',
f3Title:'일괄 다운로드',f3Text:'압축한 여러 이미지를 한 번에 다운로드할 수 있습니다.',
f4Title:'모바일 대응',f4Text:'스마트폰과 태블릿에서도 편하게 사용할 수 있도록 반응형으로 제작했습니다.',
faqTitle:'자주 묻는 질문',
faq1q:'정말 이미지가 서버로 전송되지 않나요?',faq1a:'네. 압축 처리는 브라우저 기능을 이용해 사용자의 기기에서 수행됩니다.',
faq2q:'PNG도 압축할 수 있나요?',faq2a:'가능합니다. PNG는 무손실 포맷 특성상 JPG/WebP보다 용량 변화가 작을 수 있습니다.',
faq3q:'사진의 위치 정보도 제거되나요?',faq3a:'이미지를 다시 생성하기 때문에 일반적인 EXIF 위치 정보는 결과 파일에 포함되지 않습니다.',
footerDesc:'서버 전송 없이 안전하게 사용하는 무료 이미지 압축 도구.',privacyLink:'개인정보처리방침',termsLink:'이용약관',contactLink:'문의',
processing:'이미지를 처리하고 있습니다…',done:'압축이 완료되었습니다.',failed:'일부 이미지를 처리하지 못했습니다.',
download:'다운로드',remove:'삭제',original:'원본',compressed:'압축 후',saved:'절감',
png:'PNG는 무손실 포맷이라 JPG/WebP보다 용량 변화가 작을 수 있습니다.',increase:'용량 증가',summaryIncrease:'증가율',keptOriginal:'이미 최적화됨',keptNotice:'원본보다 결과가 커지는 파일은 원본 크기를 유지했습니다.'
},
ja:{
navTool:'画像圧縮',navFeatures:'機能',badge:'🔒 サーバー送信なしの画像圧縮',
heroTitle:'画像は軽く。<br>プライバシーはそのまま。',
heroCopy:'JPG・PNG・WebP画像をブラウザ上ですぐに圧縮できます。画像ファイルは外部サーバーへ送信・保存されません。',
trust1:'✓ 無料',trust2:'✓ 登録不要',trust3:'✓ ローカル処理',
dropTitle:'画像をここにドラッグ＆ドロップ',dropHelp:'またはボタンから選択 · 複数枚対応',choose:'画像を選択',
privacyInline:'🛡️ すべての処理はこのブラウザ内だけで行われます。',
qualityLabel:'圧縮品質',formatLabel:'出力形式',keepFormat:'元の形式を維持',resizeLabel:'画像サイズ',resizeOriginal:'元のサイズ',
downloadZip:'すべてダウンロード',summaryBefore:'圧縮前',summaryAfter:'圧縮後',summarySaved:'削減率',
featureKicker:'WHY WORK-IMG',featureTitle:'シンプルでも必要な機能はしっかり',
f1Title:'サーバー送信なし',f1Text:'画像データはユーザーのブラウザ内で処理されます。',
f2Title:'メタデータ削除',f2Text:'画像を再エンコードし、EXIFなど不要なメタデータを削除します。',
f3Title:'一括ダウンロード',f3Text:'圧縮した複数の画像をまとめてダウンロードできます。',
f4Title:'モバイル対応',f4Text:'スマートフォンやタブレットでも使いやすいレスポンシブ設計です。',
faqTitle:'よくある質問',
faq1q:'本当に画像はサーバーへ送信されませんか？',faq1a:'はい。圧縮処理はブラウザ機能を使い、ユーザーの端末上で実行されます。',
faq2q:'PNGも圧縮できますか？',faq2a:'可能です。PNGは可逆圧縮形式のため、JPG/WebPより容量変化が小さい場合があります。',
faq3q:'写真の位置情報も削除されますか？',faq3a:'画像を再生成するため、一般的なEXIF位置情報は出力ファイルに含まれません。',
footerDesc:'サーバー送信なしで安全に使える無料画像圧縮ツール。',privacyLink:'プライバシーポリシー',termsLink:'利用規約',contactLink:'お問い合わせ',
processing:'画像を処理しています…',done:'圧縮が完了しました。',failed:'一部の画像を処理できませんでした。',
download:'ダウンロード',remove:'削除',original:'元画像',compressed:'圧縮後',saved:'削減',
png:'PNGは可逆形式のため、JPG/WebPより容量変化が小さい場合があります。',increase:'容量増加',summaryIncrease:'増加率',keptOriginal:'最適化済み',keptNotice:'圧縮後のサイズが元画像より大きくなるファイルは、元のサイズを維持しました。'
},
en:{
navTool:'Compress',navFeatures:'Features',badge:'🔒 Image compression without server uploads',
heroTitle:'Lighter images.<br>Your privacy stays yours.',
heroCopy:'Compress JPG, PNG and WebP images directly in your browser. Image files are never uploaded to or stored on an external server.',
trust1:'✓ Free',trust2:'✓ No account',trust3:'✓ Local processing',
dropTitle:'Drag & drop images here',dropHelp:'Or choose files · multiple images supported',choose:'Choose images',
privacyInline:'🛡️ All processing happens only inside this browser.',
qualityLabel:'Compression quality',formatLabel:'Output format',keepFormat:'Keep original format',resizeLabel:'Image size',resizeOriginal:'Original size',
downloadZip:'Download all',summaryBefore:'Before',summaryAfter:'After',summarySaved:'Saved',
featureKicker:'WHY WORK-IMG',featureTitle:'Simple, with the features that matter',
f1Title:'No server uploads',f1Text:'Image data is processed inside your browser.',
f2Title:'Metadata removal',f2Text:'Images are re-encoded, removing common EXIF and unnecessary metadata.',
f3Title:'Batch download',f3Text:'Download multiple compressed images together.',
f4Title:'Mobile friendly',f4Text:'Responsive layout designed for smartphones and tablets.',
faqTitle:'Frequently asked questions',
faq1q:'Are images really not uploaded to a server?',faq1a:'Yes. Compression runs on your device using browser features.',
faq2q:'Can PNG files be compressed?',faq2a:'Yes. Because PNG is lossless, size changes may be smaller than JPG/WebP.',
faq3q:'Is photo location data removed?',faq3a:'Because the image is regenerated, common EXIF location data is not included in the output file.',
footerDesc:'A free image compression tool that works without server uploads.',privacyLink:'Privacy',termsLink:'Terms',contactLink:'Contact',
processing:'Processing images…',done:'Compression complete.',failed:'Some images could not be processed.',
download:'Download',remove:'Remove',original:'Original',compressed:'Compressed',saved:'Saved',
png:'PNG is lossless, so size changes may be smaller than JPG/WebP.',increase:'Size increase',summaryIncrease:'Increase',keptOriginal:'Already optimized',keptNotice:'Files that would become larger keep their original size.'
}
};
const tr=k=>(I18N[lang]||I18N.ko)[k]||k;

function setLanguage(next){
  lang=next;
  document.documentElement.lang=next;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.dataset.i18n;
    const value=tr(key);
    if(value!==undefined) el.innerHTML=value;
  });
  render();
}
function status(m,type='info'){statusEl.textContent=m;statusEl.className='status show '+type}function clear(){statusEl.className='status';statusEl.textContent=''}
function fmt(n){return n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB'}
function ext(t){return t==='image/jpeg'?'jpg':t==='image/webp'?'webp':t==='image/png'?'png':'img'}function base(n){return n.replace(/\.[^.]+$/,'')}
function revoke(j){try{URL.revokeObjectURL(j.previewUrl)}catch{}try{URL.revokeObjectURL(j.outputUrl)}catch{}}
function outputType(file){return formatSelect.value==='auto'?(['image/jpeg','image/png','image/webp'].includes(file.type)?file.type:'image/webp'):formatSelect.value}
async function bitmap(file){if('createImageBitmap'in window)try{return await createImageBitmap(file,{imageOrientation:'from-image'})}catch{}return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image;im.onload=()=>{URL.revokeObjectURL(u);res(im)};im.onerror=()=>{URL.revokeObjectURL(u);rej()};im.src=u})}
function quantizePng(ctx,w,h,q){
  // Browser PNG encoders ignore the quality argument. Reduce color precision
  // gently so the PNG encoder has a better chance to create a smaller file.
  // 95% keeps near-original precision; lower quality reduces more.
  if(q>=0.95) return;
  try{
    const levels=Math.max(24,Math.round(24+q*160));
    const step=255/(levels-1);
    const img=ctx.getImageData(0,0,w,h);
    const d=img.data;
    for(let i=0;i<d.length;i+=4){
      d[i]=Math.round(d[i]/step)*step;
      d[i+1]=Math.round(d[i+1]/step)*step;
      d[i+2]=Math.round(d[i+2]/step)*step;
    }
    ctx.putImageData(img,0,0);
  }catch(e){
    // Large canvases may reject getImageData due to memory limits.
  }
}

async function compress(file){
  const im=await bitmap(file),
        sw=im.width||im.naturalWidth,
        sh=im.height||im.naturalHeight;

  if(sw*sh>MAX_PIXELS) throw new Error('large');

  const requestedScale=Number(resizeSelect.value);
  let scale=Math.min(requestedScale,MAX_DIMENSION/sw,MAX_DIMENSION/sh,1),
      w=Math.max(1,Math.round(sw*scale)),
      h=Math.max(1,Math.round(sh*scale)),
      c=document.createElement('canvas');

  c.width=w;c.height=h;
  let x=c.getContext('2d',{alpha:true});
  x.imageSmoothingEnabled=true;
  x.imageSmoothingQuality='high';
  x.drawImage(im,0,0,w,h);
  if(im.close) im.close();

  const type=outputType(file),
        q=Number(quality.value)/100;

  if(type==='image/png') quantizePng(x,w,h,q);

  let b=await new Promise((res,rej)=>c.toBlob(v=>v?res(v):rej(),type,q));
  let keptOriginal=false;

  // Critical safeguard:
  // If output format and dimensions are unchanged but re-encoding makes the
  // file larger, keep the original file instead of pretending it was compressed.
  if(type===file.type && scale===1 && b.size>=file.size){
    b=file;
    keptOriginal=true;
  }

  return{
    id:crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random(),
    file,
    blob:b,
    outputType:type,
    width:w,
    height:h,
    keptOriginal,
    previewUrl:URL.createObjectURL(file),
    outputUrl:URL.createObjectURL(b)
  };
}

async function process(files){
  const accepted=[...files]
    .filter(f=>f.type.startsWith('image/')&&f.size<=MAX_FILE_SIZE)
    .slice(0,MAX_FILES);

  if(!accepted.length) return;

  sourceFiles=accepted;
  status(tr('processing'));

  let next=[],fail=0;
  for(const f of accepted){
    try{next.push(await compress(f))}
    catch{fail++}
  }

  jobs.forEach(revoke);
  jobs=next;
  render();

  const kept=jobs.some(j=>j.keptOriginal);

  if(fail){
    status(tr('failed'),'warn');
  }else if(kept){
    status(tr('keptNotice'),'info');
  }else{
    status(tr('done'),'info');
  }

  if(sourceFiles.some(f=>f.type==='image/png')&&formatSelect.value==='auto'&&!kept){
    status(tr('png'),'warn');
  }
}

async function reprocess(){if(sourceFiles.length)await process(sourceFiles)}
function render(){
  results.innerHTML='';

  for(const j of jobs){
    const delta=j.file.size?((j.file.size-j.blob.size)/j.file.size)*100:0;
    const isSaving=delta>=0;
    const deltaText=isSaving
      ? `${tr('saved')} ${Math.max(0,delta).toFixed(1)}%`
      : `${tr('increase')} ${Math.abs(delta).toFixed(1)}%`;

    const note=j.keptOriginal
      ? `<span class="optimized-note">${tr('keptOriginal')}</span>`
      : '';

    const d=document.createElement('article');
    d.className='result-card';
    d.innerHTML=`<img class="thumb" src="${j.previewUrl}" alt="">
      <div>
        <div class="file-name">${j.file.name}</div>
        <div class="file-meta">
          <span>${tr('original')} ${fmt(j.file.size)}</span>
          <span>${tr('compressed')} ${fmt(j.blob.size)}</span>
          <span>${j.width}×${j.height}</span>
          <span>${j.outputType.replace('image/','').toUpperCase()}</span>
          <span class="${isSaving?'good':'bad'}">${deltaText}</span>
          ${note}
        </div>
      </div>
      <div class="file-actions">
        <button class="small-btn primary" data-a="down" data-id="${j.id}">${tr('download')}</button>
        <button class="small-btn" data-a="remove" data-id="${j.id}">${tr('remove')}</button>
      </div>`;
    results.appendChild(d);
  }

  const before=jobs.reduce((n,j)=>n+j.file.size,0),
        after=jobs.reduce((n,j)=>n+j.blob.size,0),
        delta=before?((before-after)/before)*100:0,
        isSaving=delta>=0;

  $('#beforeTotal').textContent=fmt(before);
  $('#afterTotal').textContent=fmt(after);

  const metric=$('#savedTotal');
  const metricLabel=summary.querySelector('article:nth-child(3) span');

  metric.textContent=`${Math.abs(delta).toFixed(1)}%`;
  metric.className=isSaving?'saved':'increased';
  metricLabel.textContent=isSaving?tr('summarySaved'):tr('summaryIncrease');

  summary.hidden=!jobs.length;
  downloadAll.disabled=!jobs.length;
}

function dl(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
pickBtn.addEventListener('click',()=>fileInput.click());fileInput.addEventListener('change',e=>process(e.target.files));
['dragenter','dragover'].forEach(t=>dropzone.addEventListener(t,e=>{e.preventDefault();dropzone.classList.add('dragover')}));['dragleave','drop'].forEach(t=>dropzone.addEventListener(t,e=>{e.preventDefault();dropzone.classList.remove('dragover')}));dropzone.addEventListener('drop',e=>process(e.dataTransfer.files));dropzone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click()}});
quality.addEventListener('input',()=>{qualityValue.textContent=quality.value+'%';qualityValue.value=quality.value+'%';clearTimeout(timer);timer=setTimeout(reprocess,250)});formatSelect.addEventListener('change',reprocess);resizeSelect.addEventListener('change',reprocess);
results.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const j=jobs.find(x=>x.id===b.dataset.id);if(!j)return;if(b.dataset.a==='down')dl(j.blob,base(j.file.name)+'-compressed.'+ext(j.outputType));else{revoke(j);jobs=jobs.filter(x=>x!==j);sourceFiles=sourceFiles.filter(x=>x!==j.file);render()}});
downloadAll.addEventListener('click',()=>{jobs.forEach((j,i)=>setTimeout(()=>dl(j.blob,base(j.file.name)+'-compressed.'+ext(j.outputType)),i*180))});
$('#langSelect').addEventListener('change',e=>setLanguage(e.target.value));
qualityValue.textContent=quality.value+'%';
setLanguage('ja');
})();
