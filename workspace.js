"use strict";
(() => {
  const byId = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  let data, runtime = false, lastResult = null;
  const tokenize = text => (text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
  function rank(query, documents) {
    const tokens = documents.map(d => tokenize(d.text)), average = Math.max(1,tokens.reduce((n,t)=>n+t.length,0)/tokens.length);
    const terms = tokenize(query);
    return documents.map((doc,i) => {
      let score=0;
      for(const term of terms) {
        const count=tokens[i].filter(t=>t===term).length;
        if(!count)continue;
        const df=tokens.filter(t=>t.includes(term)).length;
        score+=Math.log(1+(tokens.length-df+.5)/(df+.5))*count*2.5/(count+1.5*(.25+.75*tokens[i].length/average));
      }
      return {...doc,score};
    }).sort((a,b)=>b.score-a.score || a.document_id.localeCompare(b.document_id)).slice(0,3);
  }
  const sourceHas = (source,term) => new RegExp('(^|[^\\p{L}\\p{N}_])'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^\\p{L}\\p{N}_])','iu').test(source);
  function verify(source,candidate) {
    const letters=Array.from(candidate).filter(c=>/\p{L}/u.test(c));
    const ratio=letters.length?letters.filter(c=>c>='\u0b80'&&c<='\u0bff').length/letters.length:0;
    const checks=[{code:'Non-empty output',passed:!!candidate.trim(),detail:candidate.trim()?'Output contains text':'Paste a Tamil draft first'},
      {code:'Tamil script',passed:ratio>=data.config.tamil_script_ratio_minimum,detail:`${(100*ratio).toFixed(1)}% Tamil letters; threshold 80%`}];
    for(const rule of data.config.term_rules.filter(r=>sourceHas(source,r.source_term)))checks.push({code:'Glossary: '+rule.source_term,passed:rule.required_tamil_markers.some(m=>candidate.includes(m)),detail:'Expected '+rule.required_tamil_markers.join(' / ')});
    const initial=checks.map(c=>({...c}));
    const changes=[];
    let revised=candidate;
    if(checks.some(c=>!c.passed)&&data.config.max_retries>0)for(const rule of data.config.revision_rules.filter(r=>sourceHas(source,r.source_term)))for(const [from,to] of Object.entries(rule.replacements))if(revised.includes(from)){revised=revised.split(from).join(to);changes.push({from,to});}
    if(changes.length){const final=verifyWithoutRepair(source,revised);return {decision:final.every(c=>c.passed)?'ACCEPT':'HUMAN_REVIEW',checks:final,initial_checks:initial,changes,final_candidate:revised,revision_count:1};}
    return {decision:checks.every(c=>c.passed)?'ACCEPT':'HUMAN_REVIEW',checks,initial_checks:initial,changes,final_candidate:revised,revision_count:0};
  }
  function verifyWithoutRepair(source,candidate){
    const letters=Array.from(candidate).filter(c=>/\p{L}/u.test(c));
    const ratio=letters.length?letters.filter(c=>c>='\u0b80'&&c<='\u0bff').length/letters.length:0;
    return [{code:'Non-empty output',passed:!!candidate.trim(),detail:'Output presence'}, {code:'Tamil script',passed:ratio>=data.config.tamil_script_ratio_minimum,detail:`${(ratio*100).toFixed(1)}% Tamil letters`}].concat(data.config.term_rules.filter(r=>sourceHas(source,r.source_term)).map(r=>({code:'Glossary: '+r.source_term,passed:r.required_tamil_markers.some(m=>candidate.includes(m)),detail:'Expected '+r.required_tamil_markers.join(' / ')})));
  }
  function render(result){
    lastResult=result;
    const v=result.verification;
    byId('workspaceDecision').textContent=v.decision==='ACCEPT'?'Automatic gates passed':'Human review required';
    byId('workspaceDecision').className='workspace-decision '+(v.decision==='ACCEPT'?'accept':'review');
    const checks=v.checks||v.final_checks;
    byId('workspaceChecks').innerHTML=checks.map(c=>`<div class="workspace-check ${c.passed?'':'fail'}"><b>${c.passed?'✓':'!'}</b><div>${escape(c.code)}<br><span>${escape(c.detail)}</span></div></div>`).join('')+(v.revision_count?`<p class="scope-note">One approved terminology repair applied; all gates checked again.<br>${escape(v.final_candidate)}</p>`:'');
    byId('workspaceEvidence').innerHTML=(result.context_used_by_generator?`<p class="scope-note">QLoRA prompt includes ${result.context_characters} context characters, ${result.approved_graph_facts.length} approved graph facts and the applicable glossary.</p>`:'')+result.retrieval.results.map((d,i)=>`<article><b>${i+1}. ${escape(d.metadata?.chapter_title||d.document_id)}</b><p>${escape(d.text)}</p><small>${escape(d.document_id)} · BM25 ${Number(d.score).toFixed(3)}</small></article>`).join('');
  }
  byId('workspaceForm').addEventListener('submit',event=>{
    event.preventDefault();
    if(!data){byId('workspaceMessage').textContent='Corpus is still loading. Try again shortly.';return;}
    const source=byId('workspaceSource').value.trim(), candidate=byId('workspaceCandidate').value;
    if(!source)return;
    const tick=performance.now();
    const ranked=rank(source,data.corpora[byId('workspaceCorpus').value]);
    render({mode:'browser-local computation',source,retrieval:{method:'bm25',results:ranked},verification:verify(source,candidate)});
    byId('workspaceMessage').textContent=`Computed locally in ${(performance.now()-tick).toFixed(1)} ms. Corpus: ${data.corpora[byId('workspaceCorpus').value].length} chunks. Export saves the trace.`;
  });
  byId('loadExample').addEventListener('click',()=>{
    byId('workspaceSource').value='The wedding will take place in Chennai next Friday.';
    byId('workspaceCandidate').value='அடுத்த வெள்ளிக்கிழமை கலியாணம் சென்னியில் நடைபெறும்.';
    byId('workspaceCorpus').value='demo';
    byId('workspaceMessage').textContent='Loaded a glossary-repair example. Choose Retrieve + verify.';
  });
  byId('generateButton').addEventListener('click',async()=>{
    if(!runtime){byId('workspaceMessage').textContent='Live generation runs on your RTX 3050. Start scripts/run_submission_demo.ps1 and open http://127.0.0.1:8765/ . This hosted page still supports real browser retrieval and draft verification.';return;}
    const button=byId('generateButton');button.disabled=true;byId('workspaceMessage').textContent='Loading the local CUDA model and generating… first request includes model loading.';
    try{
      const response=await fetch('/api/localize',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:byId('workspaceSource').value,corpus:byId('workspaceCorpus').value,engine:byId('workspaceEngine').value,use_context:byId('workspaceUseContext').checked})});
      const result=await response.json();if(!response.ok)throw Error(result.detail||'Inference request failed');
      byId('workspaceCandidate').value=result.verification.final_candidate;
      render(result);byId('workspaceMessage').textContent=`Generated on ${result.device} · ${result.generation_latency_seconds.toFixed(2)} s generation · ${result.total_latency_seconds.toFixed(2)} s total. ${result.context_used_by_generator?'QLoRA consumed retrieved context and approved memory.':'Source-only model mode; retrieved evidence shown for inspection.'}`;
    }catch(error){byId('workspaceMessage').textContent=error.message;}finally{button.disabled=false;}
  });
  byId('exportResult').addEventListener('click',()=>{
    if(!lastResult){byId('workspaceMessage').textContent='Run an inspection first, then export its result.';return;}
    const url=URL.createObjectURL(new Blob([JSON.stringify(lastResult,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='contextlab-trace.json';a.click();URL.revokeObjectURL(url);
  });
  fetch('assets/workspace_data.json').then(r=>{if(!r.ok)throw Error('Corpus could not be loaded');return r.json();}).then(value=>{data=value;}).catch(error=>{byId('workspaceMessage').textContent=error.message;});
  if(['127.0.0.1','localhost'].includes(location.hostname))fetch('/health').then(r=>r.ok?r.json():null).then(h=>{runtime=!!h?.local_gpu_enabled;if(runtime)byId('runtimeStatus').textContent='Local CUDA API connected';}).catch(()=>{});
  fetch('assets/submission_benchmark.json').then(r=>{if(!r.ok)throw Error('Benchmark unavailable');return r.json();}).then(s=>{
    const base=s.comparison.find(r=>r.system==='base_4bit'), adapter=s.comparison.find(r=>r.system==='qlora_adapter');
    const hero=document.querySelector('.console-result');
    hero.querySelector('span').textContent='HELD-OUT OFFICIAL chrF · n='+s.manifest.examples;
    hero.querySelector('strong').textContent=base.official_corpus_chrf.toFixed(2)+' → '+adapter.official_corpus_chrf.toFixed(2);
    hero.querySelector('b').textContent=(s.relative_delta_percent>=0?'+':'')+s.relative_delta_percent.toFixed(2)+'% relative';
    hero.querySelector('small').textContent='Frozen held-out mined references · native review pending';
    byId('submissionBenchmark').innerHTML=`<table><thead><tr><th>System</th><th>Official chrF</th><th>Mean latency</th></tr></thead><tbody>${s.comparison.map(r=>`<tr><td>${escape(r.system)}</td><td>${r.official_corpus_chrf.toFixed(2)}</td><td>${r.mean_latency_seconds.toFixed(2)} s</td></tr>`).join('')}</tbody></table><p class="delta">Adapter − base: ${s.paired_delta_chrf.toFixed(2)} chrF · paired bootstrap 95% interval [${s.paired_bootstrap_95_percent_interval.join(', ')}]</p><p>${s.manifest.examples} held-out examples · mined references · native review pending.</p><a href="assets/submission_benchmark.json" target="_blank">Open benchmark manifest ↗</a>`;
  }).catch(()=>{byId('submissionBenchmark').textContent='See the downloadable submission report for benchmark status.';});
})();
