"use strict";

const stageData = [
  ["Dataset engineering + EDA", "Implemented", "done"],
  ["Prompting baselines", "Implemented", "done"],
  ["4-bit QLoRA fine-tuning", "Full GPU epoch", "done"],
  ["Hybrid RAG", "Demo + real chapters", "done"],
  ["Knowledge graph memory", "Foundation", "partial"],
  ["Controlled verification", "Implemented", "done"],
  ["Evaluation + ablation", "Component + held-out", "done"],
  ["API, Docker + final demo", "Implemented", "done"]
];

const translations = [
  {
    id: "story-01", source: "Priya, call your elder brother before you leave.",
    reference: "பிரியா, நீ கிளம்புவதற்கு முன் உன் அண்ணனை அழைத்துவிடு.",
    context: "Arjun is Priya’s elder brother. Informal family register. Approved term: elder brother → அண்ணன்.",
    modes: {
      zero: ["தூர், போலி முடிவான இரண்டு பெரும் அவர்களை நிறுவனது.", 15.8837, 3.6635],
      few: ["இந்த போர் உலகம் குறிக்கிறது. பிரியா என்ற போர் அவரை அரசு காப்பகத்துக்கு அனுப்பி வைத்தனர்.", 23.663, 4.4256],
      contextual: ["இந்த குண்டுகளுடன் பெருந்தொகையான வயர்கள் மற்றும் வெடிக்க வைக்கும் கருவிகளையும் பொலிஸார் மீட்டெடுத்துள்ளனர்.", 18.596, 6.0339],
      opus: ["பிரீயா, நீங்கள் போகுமுன் உங்கள் அண்ணனை அழைத்துக்கொள்ளுங்கள்.", 44.9605, .5351]
    }
  },
  {
    id: "story-02", source: "I already gave the keys to Priya.",
    reference: "நான் ஏற்கனவே சாவிகளை பிரியாவிடம் கொடுத்துவிட்டேன்.",
    context: "Arjun is speaking to his mother. Approved term: keys → சாவிகள்.",
    modes: {
      zero: ["தூர் குறித்தான் பிரியா என் முக்கிய வடக்களை அழைக்கப்படுத்துவதை இருந்தான்.", 28.1504, 3.6091],
      few: ["இந்த குண்டுகளுடன் பெருந்தொகையான வயர்கள் மற்றும் வெடிக்க வைக்கும் கருவிகளையும் பொலிஸார் மீட்டெடுத்துள்ளனர்.", 23.8324, 5.6189],
      contextual: ["இந்த சாவிகளில் பெருந்தொகையான வயர்கள் மற்றும் வெடிக்க வைக்கும் கருவிகளையும் பொலிஸார் மீட்டெடுத்துள்ளனர்.", 27.8353, 5.7471],
      opus: ["நான் ஏற்கனவே ப்ரியா சாவிகளை கொடுத்துள்ளேன்.", 52.2912, .2644]
    }
  },
  {
    id: "story-03", source: "The wedding will take place in Chennai next Friday.",
    reference: "திருமணம் அடுத்த வெள்ளிக்கிழமை சென்னையில் நடைபெறும்.",
    context: "Formal announcement. Wedding location is Chennai. Approved terms: திருமணம் and சென்னை.",
    modes: {
      zero: ["தேவை முக்கிய போனது சென்றி அமைந்தது.", 16.1818, 1.947],
      few: ["இந்த போன்ற விரிவாக்கம் இல் சூத்திரை இருந்து இரவு மற்றும் போன்ற விரிவாக்கம் இல் சூத்திரை இருந்து இரவு மற்றும் போன்ற வ", 15.7648, 6.0321],
      contextual: ["முதல் திருமணம் சென்னை அழைக்கப்படுகிறது இலக்கிய போர்த்தொடர்கள் முதல் திருமணம் சென்னை அழைக்கப்படுகிறது.", 29.8419, 5.3054],
      opus: ["அடுத்த வெள்ளிக்கிழமை கலியாணம் சென்னியில் நடைபெறும்.", 70.711, .2844]
    }
  },
  {
    id: "story-04", source: "Don't tell Amma yet; I want it to be a surprise.",
    reference: "இப்போதே அம்மாவிடம் சொல்லாதே; அது ஒரு ஆச்சரியமாக இருக்க வேண்டும் என்று நினைக்கிறேன்.",
    context: "Informal family gift discussion. Approved terms: Amma → அம்மா; surprise → ஆச்சரியம்.",
    modes: {
      zero: ["தூர்: இன்னும் மாவட்டு அளித்து நிகழ்ச்சி வெற்றை தொடர்போது என்று உணவுக்கு விருதிய வழங்கப்படுகிறது.", 24.6939, 4.7935],
      few: ["இந்த குண்டுகளுடன் பெருந்தொகையான வயர்கள் மற்றும் வெடிக்க வைக்கும் கருவிகளையும் பொலிஸார் மீட்டெடுத்துள்ளனர்.", 19.8607, 5.5869],
      contextual: ["அந்த அம்மா உள்ள அழைக்கப்படுகிறது. ஆச்சரியம் அழைக்கப்படுகிறது.", 23.5896, 3.2119],
      opus: ["இன்னும் அமா சொல்லாதே. எனக்கு இது ஆச்சரியமாக இருக்க வேண்டும்.", 48.2273, .2854]
    }
  },
  {
    id: "story-05", source: "You're kidding me!", reference: "டேய், சும்மா கலாய்க்காத!",
    context: "Close childhood friends, informal playful tone. Approved term: kidding → கலாய்த்தல்.",
    modes: {
      zero: ["தூர் விரும்பு நான் கொண்டு முடியேன்!", 12.7616, 1.9193],
      few: ["இந்த உலகம் குறிக்கு நிகழ்ந்தது!", 12.4099, 1.5241],
      contextual: ["ஒரு கலாய்த்தல் உள்ள அதன் கலாய்த்தல் அதன் கலாய்த்தல் அதன் கலாய்த்தல் அதன் கலாய்த்தல் அதன் கலாய்த்தல்", 13.6748, 5.1892],
      opus: ["நீங்கள் என்னை கேலி செய்கிறீர்கள்!", 11.4587, .1804]
    }
  },
  {
    id: "story-06", source: "Priya joined Company X last year.",
    reference: "பிரியா கடந்த ஆண்டு கம்பெனி எக்ஸில் சேர்ந்தார்.",
    context: "Neutral employment-history narration. Approved term: Company X → கம்பெனி எக்ஸ்.",
    modes: {
      zero: ["தூர் பிரியா முக்கிய சண்டை நடைபெற்றது.", 21.2348, 2.0464],
      few: ["இந்த போர் இந்திய போர் இந்திய போர் இந்திய போர் இந்திய போர் இந்திய போர்", 11.7326, 3.9127],
      contextual: ["பிரிவான கம்பெனி எக்ஸ் மூன்று முதல் போனது.", 30.9596, 2.2776],
      opus: ["பிரீயா கம்பெனி X - ல் சேர்ந்தாள்.", 39.232, .2452]
    }
  }
];

const modeMeta = {
  zero: ["Zero-shot", "Qwen"], few: ["Few-shot", "Qwen"],
  contextual: ["Contextual", "Qwen"], opus: ["OPUS-MT", "Translation model"]
};

const retrievalQueries = [
  { query: translations[0].source, relevant: "story-01", rankings: { bm25: ["story-01","distractor-08","distractor-01"], dense: ["distractor-01","story-01","distractor-06"], hybrid: ["story-01","distractor-01","distractor-08"] }, latency: {bm25:.3276,dense:16.9878,hybrid:17.3615} },
  { query: translations[1].source, relevant: "story-02", rankings: { bm25: ["distractor-04","distractor-02","story-02"], dense: ["distractor-02","distractor-06","distractor-04"], hybrid: ["distractor-02","distractor-04","story-02"] }, latency: {bm25:.1826,dense:15.2201,hybrid:15.4406} },
  { query: translations[2].source, relevant: "story-03", rankings: { bm25: ["distractor-03","story-03","distractor-07"], dense: ["story-03","distractor-03","distractor-07"], hybrid: ["distractor-03","story-03","distractor-07"] }, latency: {bm25:.1529,dense:14.6181,hybrid:14.8071} },
  { query: translations[3].source, relevant: "story-04", rankings: { bm25: ["distractor-04","story-04","distractor-08"], dense: ["distractor-04","story-04","distractor-08"], hybrid: ["distractor-04","story-04","distractor-08"] }, latency: {bm25:.1567,dense:15.1452,hybrid:15.3396} },
  { query: translations[4].source, relevant: "story-05", rankings: { bm25: ["distractor-05","story-05","distractor-01"], dense: ["distractor-05","story-05","distractor-04"], hybrid: ["distractor-05","story-05","distractor-04"] }, latency: {bm25:.1293,dense:13.7948,hybrid:13.9456} },
  { query: translations[5].source, relevant: "story-06", rankings: { bm25: ["story-06","distractor-02","distractor-06"], dense: ["distractor-06","story-06","distractor-02"], hybrid: ["story-06","distractor-06","distractor-02"] }, latency: {bm25:.2286,dense:13.6411,hybrid:13.8915} }
];

const docs = {
  "story-01": "Arjun and Priya are siblings. Arjun is Priya's elder brother. The family speaks informally at home.",
  "story-02": "Arjun is speaking to his mother. Priya is waiting outside. Approved term: keys means சாவிகள்.",
  "story-03": "The family confirmed Chennai as the wedding location. This is a formal announcement.",
  "story-04": "Arjun speaks informally to Priya about a family gift. They call their mother Amma.",
  "story-05": "Arjun is speaking to a close childhood friend in an informal, playful tone.",
  "story-06": "A narrator summarizes Priya's employment history. Priya works at Company X.",
  "distractor-01": "Priya called her younger cousin after leaving the office. No elder brother was involved.",
  "distractor-02": "Priya returned spare keys to the Company X security desk yesterday.",
  "distractor-03": "The family will travel to Chennai next Friday for a conference, not a wedding.",
  "distractor-04": "Amma already knows about the surprise gift and told Priya not to discuss it.",
  "distractor-05": "Arjun's colleague said he was kidding during a formal company meeting.",
  "distractor-06": "Priya left Company X two years ago and now works elsewhere.",
  "distractor-07": "The Chennai office keeps duplicate keys for visitors and wedding contractors.",
  "distractor-08": "Arjun asked Amma to call Priya before Friday's family meeting."
};

const retrievalStats = {
  bm25: { title:"BM25 lexical", r1:.3333, r3:1, mrr:.6389, latency:.1963 },
  dense: { title:"Dense embedding", r1:.1667, r3:.8333, mrr:.5333, latency:14.9012 },
  hybrid: { title:"Hybrid RRF", r1:.3333, r3:1, mrr:.6389, latency:15.131 }
};

const graphNodes = [
  {id:"priya", name:"Priya", type:"Character", x:270, y:250}, {id:"arjun", name:"Arjun", type:"Character", x:540, y:250},
  {id:"amma", name:"Amma", type:"Character", x:405, y:410}, {id:"company", name:"Company X", type:"Organization", x:120, y:95},
  {id:"wedding", name:"Wedding", type:"Event", x:670, y:95}, {id:"chennai", name:"Chennai", type:"Location", x:820, y:250}
];
const graphEdges = [
  {s:"arjun",t:"priya",r:"OLDER BROTHER OF",e:"story-01"}, {s:"priya",t:"arjun",r:"YOUNGER SISTER OF",e:"story-01",hidden:true},
  {s:"priya",t:"company",r:"WORKS AT",e:"story-06"}, {s:"wedding",t:"chennai",r:"LOCATED IN",e:"story-03"},
  {s:"priya",t:"amma",r:"CHILD OF",e:"story-04"}, {s:"arjun",t:"amma",r:"CHILD OF",e:"story-04"}
];
const colors = {Character:"#3b6fa1", Organization:"#17856f", Event:"#8763a8", Location:"#e6a83c"};

const verificationItems = [
  {id:"story-01", source:translations[0].source, candidate:translations[0].modes.opus[0], decision:"ACCEPT", checks:[["non empty",true,"Candidate contains text"],["Tamil script ratio",true,"100.0% ≥ 80%"],["approved terminology",true,"elder brother → அண்ண… found"]]},
  {id:"story-02", source:translations[1].source, candidate:translations[1].modes.opus[0], decision:"ACCEPT", checks:[["non empty",true,"Candidate contains text"],["Tamil script ratio",true,"100.0% ≥ 80%"],["approved terminology",true,"keys → சாவி… found"]]},
  {id:"story-03", source:translations[2].source, candidate:translations[2].modes.opus[0], final:"அடுத்த வெள்ளிக்கிழமை திருமணம் சென்னையில் நடைபெறும்.", revised:true, decision:"ACCEPT", checks:[["non empty",true,"Candidate contains text"],["Tamil script ratio",true,"100.0% ≥ 80%"],["approved terminology",true,"wedding → திருமண… repaired"],["approved terminology",true,"Chennai → சென்னை… repaired"]]},
  {id:"story-04", source:translations[3].source, candidate:translations[3].modes.opus[0], final:"இன்னும் அம்மா சொல்லாதே. எனக்கு இது ஆச்சரியமாக இருக்க வேண்டும்.", revised:true, decision:"ACCEPT", checks:[["non empty",true,"Candidate contains text"],["Tamil script ratio",true,"100.0% ≥ 80%"],["approved terminology",true,"Amma → அம்மா repaired"],["approved terminology",true,"surprise → ஆச்சரிய… found"]]},
  {id:"story-05", source:translations[4].source, candidate:translations[4].modes.opus[0], final:"நீங்கள் என்னை கலாய்த்தல் செய்கிறீர்கள்!", revised:true, decision:"ACCEPT", checks:[["non empty",true,"Candidate contains text"],["Tamil script ratio",true,"100.0% ≥ 80%"],["approved terminology",true,"kidding → கலாய்… repaired"]]},
  {id:"story-06", source:translations[5].source, candidate:translations[5].modes.opus[0], final:"பிரீயா கம்பெனி எக்ஸ் - ல் சேர்ந்தாள்.", revised:true, decision:"ACCEPT", checks:[["non empty",true,"Candidate contains text"],["Tamil script ratio",true,"100.0% ≥ 80%"],["approved terminology",true,"Company X → கம்பெனி எக்ஸ் repaired"]]}
];

let activeMode = "opus", activeMethod = "hybrid", activeVerification = 0;

function showSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  document.querySelectorAll(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.section === id));
  target.scrollIntoView({behavior:"smooth", block:"start"});
}

document.querySelectorAll("[data-section]").forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.section)));
document.querySelectorAll("[data-jump]").forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.jump)));

document.getElementById("stageList").innerHTML = stageData.map((stage, i) => `<div class="stage"><span>${String(i+1).padStart(2,"0")}</span><b>${stage[0]}</b><em class="${stage[2]}">${stage[1]}</em></div>`).join("");

const sampleSelect = document.getElementById("sampleSelect");
sampleSelect.innerHTML = translations.map((item,i) => `<option value="${i}">${item.id} · ${item.source}</option>`).join("");
const modeTabs = document.getElementById("modeTabs");
modeTabs.innerHTML = Object.entries(modeMeta).map(([id, meta]) => `<button role="tab" data-mode="${id}" class="${id===activeMode?"active":""}">${meta[0]} <small>${meta[1]}</small></button>`).join("");
modeTabs.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { activeMode=btn.dataset.mode; modeTabs.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===btn)); renderTranslation(); }));
sampleSelect.addEventListener("change", renderTranslation);
function renderTranslation() {
  const item = translations[Number(sampleSelect.value) || 0];
  const output = item.modes[activeMode];
  document.getElementById("sourceText").textContent = item.source;
  document.getElementById("hypothesisText").textContent = output[0];
  document.getElementById("referenceText").textContent = item.reference;
  document.getElementById("sampleContext").textContent = item.context;
  document.getElementById("scoreValue").textContent = output[1].toFixed(2);
  document.getElementById("latencyValue").textContent = `${output[2].toFixed(2)} s`;
  document.getElementById("scoreFill").style.width = `${Math.min(output[1],100)}%`;
  const notes = activeMode === "opus" ? "A dedicated translation model is currently stronger and faster on average. Inspect the wording: an overlap score can be high while an approved term is still wrong." : "This tiny Qwen checkpoint demonstrates the GenAI prompting pipeline, but the visible output is often nonsensical. It is evidence for choosing a stronger Tamil-capable model.";
  document.getElementById("outputInterpretation").textContent = notes;
}

const retrievalQuery = document.getElementById("retrievalQuery");
retrievalQuery.innerHTML = retrievalQueries.map((item,i)=>`<option value="${i}">${item.query}</option>`).join("");
const methodSwitch = document.getElementById("methodSwitch");
methodSwitch.innerHTML = [["bm25","BM25"],["dense","Dense"],["hybrid","Hybrid RRF"]].map(([id,label])=>`<button role="tab" data-method="${id}" class="${id===activeMethod?"active":""}">${label}</button>`).join("");
methodSwitch.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{activeMethod=btn.dataset.method;methodSwitch.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===btn));renderRetrieval();}));
retrievalQuery.addEventListener("change",renderRetrieval);
function renderRetrieval() {
  const item = retrievalQueries[Number(retrievalQuery.value)||0], stat = retrievalStats[activeMethod];
  document.getElementById("retrievalLatency").textContent = `${item.latency[activeMethod].toFixed(2)} ms for this query`;
  document.getElementById("rankedResults").innerHTML = item.rankings[activeMethod].map((id,i)=>{const correct=id===item.relevant;return `<article class="rank-card ${correct?"correct":"distractor"}"><span class="rank">${i+1}</span><header><b>${id}</b><span>${correct?"relevant evidence":"hard distractor"}</span></header><p>${docs[id]}</p></article>`;}).join("");
  document.getElementById("retrievalMethodTitle").textContent = stat.title;
  document.getElementById("retrievalScores").innerHTML = `<div><span>Recall@1</span><strong>${stat.r1.toFixed(2)}</strong></div><div><span>Recall@3</span><strong>${stat.r3.toFixed(2)}</strong></div><div><span>MRR</span><strong>${stat.mrr.toFixed(2)}</strong></div><div><span>Mean latency</span><strong>${stat.latency.toFixed(1)} ms</strong></div>`;
  document.getElementById("retrievalVerdict").textContent = activeMethod === "dense" ? "Dense retrieval misses the correct top-three context once in this small test." : activeMethod === "hybrid" ? "Hybrid matches BM25 here; it does not yet improve it. Reranking is the next experiment." : "BM25 is the strongest simple baseline: perfect top-three recall, but only 2 of 6 correct at rank one.";
}

function renderGraph() {
  const svg = document.getElementById("graphCanvas");
  const byId = Object.fromEntries(graphNodes.map(n=>[n.id,n]));
  const edges = graphEdges.filter(e=>!e.hidden).map(e=>{const a=byId[e.s],b=byId[e.t],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;return `<g><line class="graph-edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><text class="graph-edge-label" x="${mx}" y="${my-8}">${e.r}</text></g>`;}).join("");
  const nodes = graphNodes.map(n=>`<g class="graph-node" data-node="${n.id}" transform="translate(${n.x} ${n.y})" tabindex="0" role="button" aria-label="Inspect ${n.name}"><circle r="50" fill="${colors[n.type]}"/><text y="4">${n.name}</text></g>`).join("");
  svg.innerHTML = edges + nodes;
  svg.querySelectorAll(".graph-node").forEach(el=>{el.addEventListener("click",()=>inspectNode(el.dataset.node));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")inspectNode(el.dataset.node);});});
  inspectNode("priya");
}
function inspectNode(id) {
  document.querySelectorAll(".graph-node").forEach(el=>el.classList.toggle("active",el.dataset.node===id));
  const n=graphNodes.find(node=>node.id===id), facts=graphEdges.filter(e=>e.s===id||e.t===id);
  document.getElementById("nodeInspector").innerHTML = `<span class="node-type">${n.type}</span><h3>${n.name}</h3><p>${facts.length} evidence-linked relationship${facts.length===1?"":"s"}. Graph validation found zero missing nodes, duplicate edges or contradictions.</p><div class="fact-list">${facts.map(e=>{const a=graphNodes.find(x=>x.id===e.s).name,b=graphNodes.find(x=>x.id===e.t).name;return `<div class="fact"><b>${a} — ${e.r.replaceAll("_"," ")} — ${b}</b><span>Evidence: ${e.e}</span></div>`;}).join("")||"<p>No relationship edges.</p>"}</div>`;
}

document.getElementById("verificationList").innerHTML = verificationItems.map((item,i)=>`<button data-verification="${i}" class="${i===0?"active":""}"><b>${item.source}</b><span class="${item.revised?"review":""}">${item.revised?"ACCEPT AFTER REPAIR":"ACCEPT"}</span></button>`).join("");
document.querySelectorAll("[data-verification]").forEach(btn=>btn.addEventListener("click",()=>{activeVerification=Number(btn.dataset.verification);document.querySelectorAll("[data-verification]").forEach(b=>b.classList.toggle("active",b===btn));renderVerification();}));
function renderVerification() {
  const item=verificationItems[activeVerification];
  document.getElementById("traceHeader").innerHTML=`<p class="kicker">${item.id} · ${item.revised?"ACCEPT AFTER ONE REPAIR":"ACCEPT"}</p><div class="trace-header-output"><span>${item.revised?"Original candidate":"Candidate output"}</span><p lang="ta">${item.candidate}</p>${item.revised?`<span>Revised candidate</span><p lang="ta">${item.final}</p>`:""}</div>`;
  document.getElementById("checkList").innerHTML=item.checks.map(c=>`<div class="check-row ${c[1]?"":"fail"}"><i>${c[1]?"✓":"!"}</i><b>${c[0]}</b><span>${c[2]}</span></div>`).join("");
  const states=item.revised?[["RETRIEVE_CONTEXT",`Load ${item.id}`],["DRAFT_LOADED","Load OPUS-MT candidate"],["VERIFY","Glossary issue detected"],["REVISE_TERMINOLOGY","Apply one approved repair"],["VERIFY_AGAIN",`${item.checks.length} checks · 0 failed`],["ACCEPT","All gates passed"]]:[["RETRIEVE_CONTEXT",`Load ${item.id}`],["DRAFT_LOADED","Load OPUS-MT candidate"],["VERIFY",`${item.checks.length} checks · 0 failed`],["ACCEPT","All gates passed"]];
  document.getElementById("traceSteps").innerHTML=states.map((s,i)=>`<div class="trace-step ${i===states.length-1?"final-accept":""}"><b>STATE ${i+1}</b><span>${s[0].replaceAll("_"," ")}</span><small>${s[1]}</small></div>`).join("");
}

document.getElementById("roadmapGrid").innerHTML=stageData.map((s,i)=>`<article class="roadmap-card"><span class="number">PART ${i+1}</span><h3>${s[0]}</h3><p>${["Complete 5.26M-row Tamil source plus a 4,974-pair reproducible research edition.","Four-system, six-example baseline with exact outputs.","One complete CUDA epoch over all 3,980 cleaned training rows, with a saved adapter and manifest.","14-document controlled comparison plus 152 chunks from 12 real chapters.","Typed graph, validation and Neo4j-ready export.","Auditable verify → repair once → recheck workflow.","Component matrix plus a frozen 50-example GPU benchmark and paired bootstrap interval.","FastAPI, verified Docker execution, 72 tests and custom-input interface."][i]}</p><span class="status ${s[2]}">${s[1]}</span></article>`).join("");

const dialog=document.getElementById("presenterDialog");
document.getElementById("presenterButton").addEventListener("click",()=>dialog.showModal());
dialog.querySelector('.primary-cta').addEventListener('click',()=>dialog.close());
document.getElementById("quickDemoButton").addEventListener("click",()=>{showSection("training");showToast("Demo started: show CUDA evidence, then Translation, RAG and Verification.");});
function showToast(message){const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),4200);}

const audienceCopy = {
  recruiter: "I engineered the complete system—from 5.26M-pair source processing and GPU QLoRA to hybrid RAG, graph memory, verification, API, tests and deployment.",
  researcher: "A frozen 50-source GPU comparison reports official chrF and a paired bootstrap interval. Earlier n=6 narrative experiments remain separate. Native-Tamil review and long-form validation are pending.",
  guide: "All eight modules run, with 72 tests, real Docker execution, local CUDA generation, a 50-example held-out benchmark and 12 real source chapters. Human Tamil review and final long-form ablation remain."
};
document.querySelectorAll("[data-audience]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-audience]").forEach(item => item.classList.toggle("active", item === button));
  document.getElementById("audienceSummary").textContent = audienceCopy[button.dataset.audience];
}));

document.querySelectorAll("[data-copy-target]").forEach(button => button.addEventListener("click", async () => {
  const target = document.getElementById(button.dataset.copyTarget);
  try {
    await navigator.clipboard.writeText(target.textContent.trim());
    button.textContent = "Copied";
    showToast("Resume bullet copied with its evidence boundary.");
    setTimeout(() => { button.textContent = "Copy"; }, 1800);
  } catch (_error) {
    showToast("Select the resume text and copy it manually.");
  }
}));

const observedSections = ["overview", "workspace", "system", "experiments", "evidence", "completion"]
  .map(id => document.getElementById(id)).filter(Boolean);
const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
  if (!visible) return;
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.section === visible.target.id));
}, {rootMargin:"-25% 0px -60% 0px", threshold:[0,.15,.35]});
observedSections.forEach(section => sectionObserver.observe(section));

renderTranslation(); renderRetrieval(); renderGraph(); renderVerification();
