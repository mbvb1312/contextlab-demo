"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let selected = null, ready = false, timer = null, lastTrace = null, local = false, recorded = false;
  const busyStates = ['queued','embedding','extracting'];
  function message(id,text,error=false){$(id).textContent=text;$(id).classList.toggle('error',error);}
  async function api(path,body){
    if(!local)throw Error('Start START_STORY_WORKSPACE.cmd and use the local workspace.');
    const response=await fetch('/api/stories'+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const result=await response.json();
    if(!response.ok){const detail=typeof result.detail==='string'?result.detail:JSON.stringify(result.detail);throw Error(detail||'Request failed');}
    return result;
  }
  async function shelf(){
    const result=await api('');const previous=selected?.id||localStorage.getItem('contextlabStoryId')||'';
    $('storySelect').innerHTML='<option value="">Choose a prepared story</option>'+result.stories.map(s=>`<option value="${esc(s.id)}">${esc(s.title)} · ${esc(s.status)}</option>`).join('');
    if(result.stories.some(s=>s.id===previous))$('storySelect').value=previous;
  }
  function graph(record){
    const facts=record.graph.facts,nodes=record.graph.nodes;
    if(!nodes.length){$('storyGraph').innerHTML='<p>No relationship proposals are available yet. Story passages remain searchable after preparation.</p>';return;}
    const shown=nodes.slice(0,24), columns=shown.length>8?4:3, height=Math.max(280,Math.ceil(shown.length/columns)*120);
    const positions=new Map(shown.map((n,i)=>[n.name.toLowerCase(),{x:100+(i%columns)*(700/(columns-1)),y:65+Math.floor(i/columns)*120}]));
    let svg=`<svg viewBox="0 0 900 ${height}" role="img" aria-label="Generated relationships for ${esc(record.title)}"><defs><marker id="storyArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#617a71"/></marker></defs>`;
    for(const fact of facts){const a=positions.get(fact.subject.toLowerCase()),b=positions.get(fact.object.toLowerCase());if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
      const vertical=Math.abs(dx)<30;
      svg+=`<line x1="${a.x+dx/len*38}" y1="${a.y+dy/len*38}" x2="${b.x-dx/len*42}" y2="${b.y-dy/len*42}" stroke="${fact.status==='approved'?'#56f0c7':'#617a71'}" stroke-width="1.8" ${fact.status==='pending'?'stroke-dasharray="5 4"':''} marker-end="url(#storyArrow)"/><text x="${(a.x+b.x)/2+(vertical?20:0)}" y="${(a.y+b.y)/2-(vertical?0:7)}" text-anchor="${vertical?'start':'middle'}" fill="#c5d9d0" font-size="9" paint-order="stroke" stroke="#07110f" stroke-width="4">${esc(fact.relation.replaceAll('_',' '))}</text>`;
    }
    for(const node of shown){const p=positions.get(node.name.toLowerCase());svg+=`<g><circle cx="${p.x}" cy="${p.y}" r="37" fill="${node.type==='Character'?'#244f65':'#4c3d66'}" stroke="#8ab6aa"/><text x="${p.x}" y="${p.y+4}" fill="#effbf6" text-anchor="middle" font-size="11">${esc(node.name.length>20?node.name.slice(0,18)+'…':node.name)}</text><text x="${p.x}" y="${p.y+54}" fill="#99ada5" text-anchor="middle" font-size="9">${esc(node.type)}</text></g>`;}
    $('storyGraph').innerHTML=svg+'</svg>'+(nodes.length>24?'<p>First 24 entities shown. All extracted facts are listed below.</p>':'');
  }
  function renderStory(record){
    if(!selected || selected.id!==record.id){$('storyTitle').value=record.title;$('storyText').value=record.text;$('storyGlossary').value=Object.entries(record.glossary||{}).map(([a,b])=>a+' => '+b).join('\n');}
    if(selected && selected.id!==record.id){lastTrace=null;$('sourceOnlyTamil').textContent='—';$('contextTamil').textContent='—';$('resolutionPanel').hidden=true;$('storyEvidence').innerHTML='';$('usedGraphFacts').innerHTML='';$('storyChecks').innerHTML='';$('translationDecision').textContent='No result yet';}
    selected=record;if(!recorded)localStorage.setItem('contextlabStoryId',record.id);
    ready=['ready','ready_with_warnings'].includes(record.status);
    const facts=record.graph.facts,approved=facts.filter(f=>f.status==='approved').length;
    $('storyStatus').innerHTML=`<span class="overline">${busyStates.includes(record.status)?'<i class="busy-dot"></i>':''}${esc(record.status.replaceAll('_',' '))}</span><h3>${esc(record.title)}</h3><p>${esc(record.progress)}</p>${record.error?`<p class="message error">${esc(record.error)}</p>`:''}<div class="status-stats"><div><b>${record.chunks.length}</b><small>passages</small></div><div><b>${facts.length}</b><small>fact proposals</small></div><div><b>${approved}</b><small>approved</small></div></div>`;
    $('factCount').textContent=`${approved} approved / ${facts.length} proposed`;
    $('graphFacts').innerHTML=facts.length?facts.map(f=>`<article class="fact-card ${esc(f.status)}"><label class="fact-title"><input type="checkbox" name="reviewFact" value="${esc(f.id)}" ${f.status!=='pending'?'disabled':''}><span>${esc(f.subject)}<span class="relation">${esc(f.relation.replaceAll('_',' '))} → ${esc(f.object)}</span></span></label><blockquote>“${esc(f.evidence_quote)}”</blockquote><small>${esc(f.evidence_chunk_id)} · ${esc(f.status)} · exact quote present</small></article>`).join(''):'<p class="empty">No fact proposals yet. Extracted quotes must contain both named entities.</p>';
    $('selectAllFacts').checked=false;graph(record);
    const canRun=ready&&local&&!recorded;
    $('translateStory').disabled=!canRun;$('retrieveStory').disabled=!canRun;
    $('approveFacts').disabled=!canRun;$('rejectFacts').disabled=!canRun;
    $('prepareButton').disabled=!local||recorded||busyStates.includes(record.status);
    if(recorded)document.querySelectorAll('input[name=reviewFact]').forEach(input=>input.disabled=true);
    if(record.graph.rejected.length)message('reviewMessage',`${record.graph.rejected.length} extraction proposals or responses failed validation and were excluded. Review the remaining relationships before approval.`);
  }
  async function load(id){
    clearTimeout(timer);if(!id){selected=null;ready=false;lastTrace=null;localStorage.removeItem('contextlabStoryId');$('storyStatus').textContent='Choose a prepared story or create a new one.';$('factCount').textContent='Waiting for a story';$('storyGraph').textContent='No story selected.';$('graphFacts').textContent='';$('translateStory').disabled=true;$('retrieveStory').disabled=true;$('approveFacts').disabled=true;$('rejectFacts').disabled=true;$('resolutionPanel').hidden=true;$('sourceOnlyTamil').textContent='—';$('contextTamil').textContent='—';$('translationDecision').textContent='No result yet';$('storyEvidence').textContent='';$('usedGraphFacts').textContent='';$('storyChecks').textContent='';return;}
    const record=await api('/'+encodeURIComponent(id));renderStory(record);
    if(busyStates.includes(record.status))timer=setTimeout(()=>load(id).catch(e=>message('prepareMessage',e.message,true)),2500);
    else await shelf();
  }
  $('loadStoryExample').addEventListener('click',()=>{
    clearTimeout(timer);recorded=false;$('recordedNotice').hidden=true;setRecordingFields(false);load('');
    $('storySelect').disabled=!local;$('refreshStories').disabled=!local;
    $('prepareButton').disabled=!local;$('selectAllFacts').disabled=!local;
    $('approveFacts').disabled=true;$('rejectFacts').disabled=true;
    $('connection').textContent=local?'Local API connected · CUDA':'Live cloud inference not connected';
    $('connection').className='status-pill '+(local?'complete':'warning');
    if(local)shelf().catch(e=>message('prepareMessage',e.message,true));
    $('storyTitle').value='Priya and Arjun';
    $('storyText').value="Arjun is Priya's elder brother. Priya lives in Chennai. Arjun works at Company X. Their family speaks informally at home. Priya is preparing to leave the house. Her mother asks her to call her brother before she leaves.";
    $('storyGlossary').value='elder brother => அண்ணன்\nChennai => சென்னை';
    $('storySentence').value='Priya, call your brother before leaving.';
    message('prepareMessage',local?'Sample loaded. Prepare it to generate fresh embeddings and relationship proposals.':'Sample loaded. Fresh preparation needs the model backend. Choose View recorded GPU run to explore an actual execution.');
  });
  $('storyFile').addEventListener('change',async()=>{try{const file=$('storyFile').files[0];if(!file)return;const text=await file.text();if(text.length>30000)throw Error('Text file exceeds 30,000 characters. Use a shorter background.');$('storyText').value=text;message('prepareMessage','Text file loaded. Choose Prepare story to build its memory.');}catch(e){message('prepareMessage',e.message,true);}});
  $('prepareForm').addEventListener('submit',async event=>{
    event.preventDefault();$('prepareButton').disabled=true;
    try{const glossary={};for(const line of $('storyGlossary').value.split('\n').filter(s=>s.trim())){const parts=line.split('=>');if(parts.length!==2||!parts.every(x=>x.trim()))throw Error('Use one glossary entry per line: English => Tamil');glossary[parts[0].trim()]=parts[1].trim();}
      message('prepareMessage','Saving the story. Embedding and graph generation will continue in the background…');
      const result=await api('',{title:$('storyTitle').value,text:$('storyText').value,glossary});await shelf();$('storySelect').value=result.id;await load(result.id);
      message('prepareMessage','Story saved. Follow the progress card; the first GPU request includes model loading.');
    }catch(e){message('prepareMessage',e.message,true);$('prepareButton').disabled=false;}
  });
  $('storySelect').addEventListener('change',()=>load($('storySelect').value).catch(e=>message('prepareMessage',e.message,true)));
  $('refreshStories').addEventListener('click',()=>shelf().catch(e=>message('prepareMessage',e.message,true)));
  $('selectAllFacts').addEventListener('change',()=>document.querySelectorAll('input[name=reviewFact]:not(:disabled)').forEach(x=>x.checked=$('selectAllFacts').checked));
  async function review(decision){try{if(!selected)throw Error('Choose a story first.');const ids=Array.from(document.querySelectorAll('input[name=reviewFact]:checked')).map(x=>x.value);if(!ids.length)throw Error('Select the relationship facts you have reviewed.');renderStory(await api('/'+selected.id+'/review',{fact_ids:ids,decision}));message('reviewMessage',`${ids.length} relationship facts ${decision}. Only approved facts are supplied to the resolver.`);}catch(e){message('reviewMessage',e.message,true);}}
  $('approveFacts').addEventListener('click',()=>review('approved'));$('rejectFacts').addEventListener('click',()=>review('rejected'));
  function renderEvidence(result){
    $('storyEvidence').innerHTML=result.results.length?result.results.map((r,i)=>`<article><b>${i+1}. ${esc(r.id)}</b><p>${esc(r.text)}</p><small>Cosine ${r.dense_score} · BM25 ${r.bm25_score} · RRF ${r.rrf_score}</small></article>`).join(''):'<p class="empty">Context disabled or no sufficiently relevant passage found.</p>';
    $('usedGraphFacts').innerHTML=result.graph_facts.length?result.graph_facts.map(f=>`<article><b>${esc(f.subject)} → ${esc(f.relation)} → ${esc(f.object)}</b><p>“${esc(f.evidence_quote)}”</p><small>${esc(f.id)} · ${esc(f.evidence_chunk_id)} · approved</small></article>`).join(''):'<p class="empty">No approved relevant relationships supplied. Passage context can still be used.</p>';
  }
  function setRecordingFields(value){
    for(const id of ['storyTitle','storyText','storyGlossary','storySentence'])$(id).readOnly=value;
    for(const id of ['storyFile','useStoryContext','useStoryGraph','selectAllFacts'])$(id).disabled=value;
  }
  function renderTranslation(result){
    renderEvidence(result.retrieval);
    $('resolutionPanel').hidden=false;$('resolvedSource').textContent=result.resolved_source;$('resolutionReason').textContent=result.resolution.explanation;
    $('sourceOnlyTamil').textContent=result.source_only_translation;$('contextTamil').textContent=result.translation;
    $('translationDecision').textContent=result.verification.decision==='HUMAN_REVIEW'?'Human review required':'Automatic gates passed';
    $('storyChecks').innerHTML=result.verification.final_checks.map(c=>`<article><b>${c.passed?'✓':'!'} ${esc(c.code)}</b><p>${esc(c.detail)}</p></article>`).join('')+`<article><b>${recorded?'Recorded execution · ':''}${esc(result.runtime.device)} · ${result.runtime.total_seconds} seconds total</b><p>${esc(result.verification.review_reasons.join('. ')||'Script and applicable glossary checks passed. Meaning and fluency still require review.')}</p><small>${result.context_used_by_generator?'Context supplied to the English resolver':'Source-only path'} · OPUS-MT translates English</small></article>`;
  }
  $('viewRecordedStory').addEventListener('click',async()=>{
    const button=$('viewRecordedStory');button.disabled=true;
    try{
      const response=await fetch('assets/story-recorded-run.json');if(!response.ok)throw Error('Recorded execution could not be loaded.');
      const demo=await response.json();if(demo.provenance.kind!=='recorded_execution')throw Error('Invalid recorded execution.');
      clearTimeout(timer);recorded=true;selected=null;renderStory(demo.story);lastTrace={...demo.translation,playback_provenance:demo.provenance};
      $('storySentence').value=demo.translation.source;$('useStoryContext').checked=true;$('useStoryGraph').checked=true;
      $('storySelect').innerHTML=`<option>${esc(demo.story.title)} · recorded</option>`;$('storySelect').disabled=true;$('refreshStories').disabled=true;
      setRecordingFields(true);renderTranslation(demo.translation);$('recordedNotice').hidden=false;
      $('connection').textContent='Recorded GPU execution';$('connection').className='status-pill warning';
      message('prepareMessage','Actual saved preparation from 28 October 2026. No new embedding or model generation is running.');
      message('reviewMessage','Approval statuses are from the recorded run. Load a sample background to leave the recording.');
      message('translateMessage','Actual saved output from the fixed sentence above. No live cloud inference. Grammar and name rendering still need human review.');
    }catch(e){message('prepareMessage',e.message,true);}finally{button.disabled=false;}
  });
  $('retrieveStory').addEventListener('click',async()=>{try{if(!ready)throw Error('Choose a ready story.');const query=$('storySentence').value.trim();if(!query)throw Error('Enter a sentence first.');const result=await api('/'+selected.id+'/retrieve',{query,use_graph:$('useStoryGraph').checked});renderEvidence(result);lastTrace=result;message('translateMessage',`Retrieved ${result.results.length} passages and ${result.graph_facts.length} approved relationships from this story.`);}catch(e){message('translateMessage',e.message,true);}});
  $('translateForm').addEventListener('submit',async event=>{
    event.preventDefault();if(!ready||!local||recorded)return;const storyId=selected.id;$('translateStory').disabled=true;$('retrieveStory').disabled=true;$('storySelect').disabled=true;$('prepareButton').disabled=true;
    message('translateMessage','Resolving English with retrieved context, then translating on CUDA. Models load sequentially; this can take a minute.');
    try{const result=await api('/'+storyId+'/localize',{source:$('storySentence').value,use_context:$('useStoryContext').checked,use_graph:$('useStoryGraph').checked});lastTrace=result;renderTranslation(result);
      message('translateMessage',`Complete on ${result.runtime.device}. ${result.resolution.changed?'English was revised using cited evidence; review the meaning.':'The English sentence was kept unchanged.'}`);
    }catch(e){message('translateMessage',e.message,true);}finally{$('translateStory').disabled=!ready;$('retrieveStory').disabled=!ready;$('storySelect').disabled=false;$('prepareButton').disabled=false;}
  });
  $('exportStoryTrace').addEventListener('click',()=>{if(!lastTrace){message('translateMessage','Retrieve context or translate first.');return;}const url=URL.createObjectURL(new Blob([JSON.stringify(lastTrace,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='contextlab-story-trace.json';a.click();URL.revokeObjectURL(url);});
  async function init(){
    $('translateStory').disabled=true;$('retrieveStory').disabled=true;$('approveFacts').disabled=true;$('rejectFacts').disabled=true;
    try{if(!['127.0.0.1','localhost'].includes(location.hostname))throw Error('Local workspace required');const response=await fetch('/health');const h=await response.json();local=!!h.story_workspace_enabled;if(!local)throw Error('Story runtime is not enabled');$('connection').textContent='Local API connected · CUDA';$('connection').className='status-pill complete';$('instructionModelLabel').textContent=(h.story_instruction_model||'Qwen/Qwen3-1.7B')+' · 4-bit · CUDA';await shelf();if($('storySelect').value)await load($('storySelect').value);}
    catch(e){local=false;$('connection').textContent='Live cloud inference not connected';$('runtimeNotice').hidden=false;$('prepareButton').disabled=true;$('storySelect').disabled=true;$('refreshStories').disabled=true;$('selectAllFacts').disabled=true;
      const onLaptop=['127.0.0.1','localhost'].includes(location.hostname);
      $('runtimeNotice').innerHTML=onLaptop?'The local model server is not enabled. Start <code>START_STORY_WORKSPACE.cmd</code> to prepare and translate your own story. You can explore the recorded GPU run below.':'This is the same story workspace used in the local GPU demonstration. The cloud model service is not connected yet. <strong>View recorded GPU run</strong> shows a real saved execution; new stories are not processed online yet.';
      message('prepareMessage','You can load sample text or open a .txt file. Fresh embeddings, graph extraction and translation require a model connection.');}
    if(local)$('modelRuntimeDescription').textContent='Connected to the local CUDA server. GPU models load sequentially to fit the RTX 3050; embeddings run on CPU.';
  }
  init();
})();
