export const INTERNAL_UI_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Doubtsnap Truth Engine</title>
  <style>
    :root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color-scheme: light dark; }
    body { margin: 0; background: #0b0d12; color: #f4f6fb; }
    main { max-width: 1180px; margin: 0 auto; padding: 32px 20px 80px; }
    h1 { margin-bottom: 4px; }
    .lede { color: #aeb7ca; margin-top: 0; }
    .grid { display: grid; grid-template-columns: minmax(300px, .8fr) minmax(420px, 1.2fr); gap: 18px; align-items: start; }
    .card { background: #151923; border: 1px solid #2a3140; border-radius: 14px; padding: 18px; box-shadow: 0 12px 30px rgba(0,0,0,.18); }
    label { display: block; font-size: 13px; font-weight: 700; margin: 14px 0 6px; }
    textarea, input, select, button { width: 100%; box-sizing: border-box; font: inherit; }
    textarea, input, select { border-radius: 9px; border: 1px solid #3a4355; background: #0f131b; color: inherit; padding: 10px 12px; }
    textarea { min-height: 140px; resize: vertical; }
    button { margin-top: 16px; border: 0; border-radius: 10px; padding: 12px 16px; font-weight: 800; cursor: pointer; background: #e9eefb; color: #111827; }
    button:disabled { opacity: .55; cursor: wait; }
    .status { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 6px 10px; background: #242b39; font-size: 12px; font-weight: 800; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; background: #0d1118; border-radius: 10px; padding: 14px; max-height: 72vh; overflow: auto; font-size: 12px; line-height: 1.55; }
    .stages { display: grid; gap: 8px; margin: 14px 0; }
    .stage { border-left: 4px solid #667085; background: #10141c; padding: 10px 12px; border-radius: 7px; }
    .stage.completed { border-color: #54c58a; }
    .stage.blocked, .stage.failed { border-color: #f97066; }
    .stage.skipped { border-color: #fdb022; }
    .stage small { color: #9ba7bb; }
    .warning { background: #2a2111; border: 1px solid #6e5118; padding: 10px 12px; border-radius: 8px; color: #ffd98a; }
    @media (max-width: 850px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<main>
  <h1>Doubtsnap Truth Engine</h1>
  <p class="lede">Internal Phase 1 console. Every stage is visible; ambiguity and verification disagreement stop the pipeline.</p>
  <p class="warning">This is an engineering evaluation surface, not a student-facing product or an accuracy claim.</p>
  <div class="grid">
    <section class="card">
      <form id="run-form">
        <label for="problem">Problem text</label>
        <textarea id="problem" placeholder="Paste a Class 11 mechanics question...">A 5 kg block is pulled horizontally by a 20 N force. Friction opposing the motion is 5 N. Find the acceleration.</textarea>
        <label for="image">Optional problem image</label>
        <input id="image" type="file" accept="image/jpeg,image/png,image/gif,image/webp" />
        <label for="attempt">Optional student attempt</label>
        <textarea id="attempt" placeholder="Paste the student's working..."></textarea>
        <label for="stuck">Where does the student say they are stuck?</label>
        <input id="stuck" placeholder="For example: I do not know which force to use." />
        <label for="mode">Interaction mode</label>
        <select id="mode">
          <option value="guide_me">Guide Me</option>
          <option value="quick_hint">Quick Hint</option>
          <option value="check_my_work">Check My Work</option>
          <option value="explain_fully">Explain Fully</option>
          <option value="exam_revision">Exam Revision</option>
        </select>
        <label for="language">Teaching language</label>
        <select id="language">
          <option value="english">English</option>
          <option value="tamil">Tamil</option>
          <option value="tamil_english">Tamil-English</option>
        </select>
        <button id="submit" type="submit">Run truth engine</button>
      </form>
    </section>
    <section class="card">
      <div id="headline"><span class="status">Not run</span></div>
      <div id="stages" class="stages"></div>
      <pre id="output">The structured run trace will appear here.</pre>
    </section>
  </div>
</main>
<script>
const form = document.getElementById('run-form');
const button = document.getElementById('submit');
const output = document.getElementById('output');
const stages = document.getElementById('stages');
const headline = document.getElementById('headline');

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = String(reader.result);
      resolve({ mediaType: file.type, base64: result.split(',')[1] });
    };
    reader.readAsDataURL(file);
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  button.disabled = true;
  button.textContent = 'Running…';
  stages.innerHTML = '';
  output.textContent = 'Running pipeline…';
  try {
    const file = document.getElementById('image').files[0];
    const body = {
      problemText: document.getElementById('problem').value || undefined,
      image: file ? await fileToImage(file) : undefined,
      studentAttempt: document.getElementById('attempt').value || undefined,
      studentStuckPoint: document.getElementById('stuck').value || undefined,
      interactionMode: document.getElementById('mode').value,
      language: document.getElementById('language').value,
      context: { curriculum: 'tamil_nadu_state_board', grade: '11', subject: 'physics' }
    };
    const response = await fetch('/api/runs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    headline.innerHTML = '<span class="status">' + result.status + '</span> &nbsp; <small>' + (result.runId || '') + '</small>';
    stages.innerHTML = (result.trace || []).map((stage) =>
      '<div class="stage ' + stage.status + '"><strong>' + stage.stage + '</strong> — ' + stage.status +
      '<br><small>' + stage.provider + (stage.model ? ' / ' + stage.model : '') + ' · ' + Math.round(stage.durationMs) + ' ms</small></div>'
    ).join('');
    output.textContent = JSON.stringify(result, null, 2);
  } catch (error) {
    headline.innerHTML = '<span class="status">client error</span>';
    output.textContent = String(error && error.stack ? error.stack : error);
  } finally {
    button.disabled = false;
    button.textContent = 'Run truth engine';
  }
});
</script>
</body>
</html>`
