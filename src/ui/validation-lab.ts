export const VALIDATION_LAB_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Doubtsnap Validation Lab</title>
  <style>
    body{font-family:system-ui;background:#0b0d12;color:#eef2ff;margin:0}main{max-width:1280px;margin:auto;padding:24px}.grid{display:grid;grid-template-columns:360px 1fr;gap:16px}.card{background:#151923;border:1px solid #30384a;border-radius:12px;padding:14px}input,select,textarea,button{width:100%;box-sizing:border-box;margin:5px 0 10px;padding:9px;border-radius:8px}.runs button{text-align:left;background:#242b39;color:white;border:0}.badge{padding:3px 8px;border-radius:999px;background:#31394b}.images{display:grid;grid-template-columns:1fr 1fr;gap:10px}.image-panel{background:#090b10;border:1px solid #30384a;border-radius:8px;padding:8px;min-height:90px}.image-panel img{width:100%;max-height:360px;object-fit:contain}.regions{display:grid;gap:6px}.region{padding:7px;border-left:3px solid #fdb022;background:#201c13}pre{white-space:pre-wrap;max-height:55vh;overflow:auto;background:#090b10;padding:12px}@media(max-width:800px){.grid,.images{grid-template-columns:1fr}}
  </style>
</head>
<body><main>
  <h1>Validation Lab</h1>
  <p>Append-only human review, image inspection, and benchmark evidence. This is not an accuracy claim.</p>
  <div class="grid">
    <section class="card">
      <button onclick="loadRuns()">Refresh runs</button>
      <label>Status</label><select id="status"><option value="">All</option><option>complete</option><option>clarification_required</option><option>verification_failed</option><option>unsupported</option></select>
      <label>Topic</label><input id="topic" placeholder="net_force">
      <div id="runs" class="runs"></div>
    </section>
    <section class="card">
      <div id="head">Select a run</div>
      <div id="images" class="images"></div>
      <h3>Uncertainty regions</h3><div id="regions" class="regions"></div>
      <pre id="detail"></pre>
      <h3>Append evaluation</h3>
      <select id="stage"><option value="">Whole run</option><option>transcription</option><option>classification</option><option>solving</option><option>verification</option><option>diagnosis</option><option>teaching</option><option>transfer_generation</option></select>
      <select id="decision"><option>accept</option><option>reject</option><option>needs_clarification</option></select>
      <select id="severity"><option>S0</option><option>S1</option><option>S2</option><option>S3</option><option>S4</option></select>
      <input id="evaluator" value="internal-reviewer" placeholder="Evaluator">
      <textarea id="notes" placeholder="Evidence and notes"></textarea>
      <button onclick="evaluateRun()">Append evaluation event</button>
    </section>
  </div>
</main>
<script>
let selected=null;
const escapeHtml=(value)=>String(value).replace(/[&<>"']/g,(character)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[character]));
function imageMarkup(label,image){
  if(!image||!image.base64||String(image.base64).startsWith('[')) return '<div class="image-panel"><strong>'+label+'</strong><p>Image bytes are not retained.</p></div>';
  return '<div class="image-panel"><strong>'+label+'</strong><img alt="'+label+'" src="data:'+escapeHtml(image.mediaType)+';base64,'+image.base64+'"></div>';
}
async function loadRuns(){
  const params=new URLSearchParams();if(status.value)params.set('status',status.value);if(topic.value)params.set('topic',topic.value);
  const data=await fetch('/api/lab/runs?'+params).then(response=>response.json());
  runs.innerHTML=data.map(item=>'<button onclick="selectRun(\''+item.runId+'\')"><span class="badge">'+escapeHtml(item.run.status)+'</span> '+escapeHtml(item.runId)+'<br><small>'+escapeHtml(item.run.classification?.topic||'unclassified')+'</small></button>').join('');
}
async function selectRun(id){
  selected=id;const data=await fetch('/api/lab/runs/'+id).then(response=>response.json());head.textContent=id;
  images.innerHTML=imageMarkup('Source',data.run?.request?.image)+imageMarkup('Normalized',data.normalizedImage?.normalized);
  regions.innerHTML=(data.normalizedImage?.uncertaintyRegions||[]).map(region=>'<div class="region"><strong>'+escapeHtml(region.label)+'</strong><br><small>x '+region.x+', y '+region.y+', w '+region.width+', h '+region.height+'</small></div>').join('')||'<p>No coordinate regions recorded.</p>';
  detail.textContent=JSON.stringify(data,null,2);
}
async function evaluateRun(){
  if(!selected)return alert('Select a run');
  const body={runId:selected,evaluator:evaluator.value,stage:stage.value||null,decision:decision.value,severity:severity.value,corrections:[],notes:notes.value};
  const response=await fetch('/api/lab/evaluations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  alert(JSON.stringify(await response.json(),null,2));
}
loadRuns();
</script></body></html>`;
