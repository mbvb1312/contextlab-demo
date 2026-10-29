# ContextLab - Demo and Viva Guide

Prepared 26 October 2026 for the 27 October submission.

## Start and fallback

1. Plug in the laptop. Double-click START_CONTEXTLAB.cmd in the project folder.
2. Open http://127.0.0.1:8765/ . First GPU generation loads model weights.
3. Backup: the deployed website supports browser retrieval, verification and saved evidence, but requires your ChatGPT login.
4. Offline backup: unzip the website package and serve it with python -m http.server. It has no GPU backend.
5. Do not launch training during the presentation. The completed adapter and manifest are already saved.

## Six-minute demonstration

1. Problem, 30 sec: sentence translation can lose names, relationships and tone.
2. Architecture, 45 sec: retrieval, explicit memory, generation and verification.
3. GPU evidence, 45 sec: 995 steps, 3,980 rows, 2.979 GiB, validation loss 1.2441.
4. Workspace, 90 sec: retrieve White Rabbit context, inspect chapter IDs; load glossary example, verify, then show an English-only draft failing the script gate.
5. Fresh generation, 45 sec: local OPUS-MT translation on cuda:0; compare saved adapter evidence separately.
6. Evaluation, 45 sec: 50 frozen held-out sources, official chrF, paired interval and exact outputs.
7. Engineering, 30 sec: 48 tests, live container check, API docs and GitHub.
8. Limitations, 30 sec: human Tamil review, paired long-form corpus and stronger-model experiments remain.

## Questions and concise answers

1. What is localization? Translation that also preserves register, names, terminology and cultural intent. Those qualities need human review.
2. Which model is zero-shot? Qwen2.5-0.5B-Instruct. Few-shot and contextual modes use the same checkpoint with different prompts.
3. Which model is OPUS? Helsinki-NLP/opus-mt-en-dra, a Marian translation model, with the >>tam<< target prefix.
4. What is LoRA? A low-rank trainable update to frozen model weights. W is augmented by a scaled product B x A.
5. What is QLoRA? LoRA training over a quantized frozen base. This project uses 4-bit NF4 and FP16 compute.
6. Did you fine-tune the full model? All selected training rows were used for one epoch; only 1.3768% of parameters reported by the quantized PEFT model were trainable.
7. Why RTX 3050? It is the available 4 GB GPU. CUDA preflight prevents CPU fallback.
8. What does chrF mean? Character n-gram overlap summarized using F-beta. It is not percent translation accuracy.
9. Why chrF for Tamil? Character overlap can give partial credit across changing word endings. It still cannot judge meaning reliably.
10. How is the new test frozen? Deterministic SHA256 ID ordering over test rows without training/validation source overlap; no output-based selection.
11. What is data leakage? Test information entering training or selection. Pair/source overlap is checked here; unknown upstream model pretraining overlap cannot be excluded.
12. Why does OPUS sometimes win? Task-specific translation training can beat a small general instruction model.
13. What is RAG? Retrieve relevant evidence before or alongside generation. Here the QLoRA context mode consumes retrieved chunks and approved demo graph/glossary memory. OPUS-MT remains source-only. Context quality needs a separate long-form evaluation.
14. What is hybrid retrieval? BM25 word matching plus dense semantic embeddings, combined using reciprocal rank fusion.
15. Did hybrid beat BM25? No on the six-query fixture: both reach Recall@3=1.00. Hybrid beats dense retrieval only on that controlled comparison.
16. What is MRR? Mean reciprocal rank of the first relevant result; it rewards better ordering.
17. What does the 40-query chapter check prove? Verbatim source-excerpt lookup works. It is not a human-labelled semantic retrieval benchmark.
18. What is a knowledge graph? Typed nodes and explicit evidence-linked relations. New chapter mention candidates are not approved facts.
19. What does the verifier accept? Rule compliance for non-empty text, Tamil script and glossary markers. Human language quality remains separate.
20. Why only one repair? To bound execution, avoid uncontrolled loops and keep every change inspectable.
21. Is the site a live GPU model? The hosted site computes retrieval and verification in the browser and shows saved model evidence. New model inference runs in the local CUDA API.
22. Does Docker run the GPU? The slim container packages API/browser functions. The GPU model runs in the separate verified local Python runtime.
23. What happens if CUDA is unavailable? The local inference request fails with an explanatory error; it never silently runs on CPU.
24. What did you build personally? Data processing, training/evaluation orchestration, retrieval/graph/verifier components, API, UI and reproducibility workflow, using credited public datasets/models and development assistance.
25. Is it production-ready? It is an academic prototype with measured engineering evidence. Production requires authentication, load testing, operational monitoring and reviewed language-quality validation.

## Safe resume wording

Use the measured results with their evaluation sample size. Keep the six-example demonstration distinct from the 50-example held-out benchmark. Never relabel a chrF value or verifier acceptance rate as translation accuracy.
