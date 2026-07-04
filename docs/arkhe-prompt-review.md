# Arkhe prompt & configuration review (gpt-5.4-nano)

A review of Arkhe's prompt architecture and generation settings after the
migration from **GPT-4o mini** to **gpt-5.4-nano**, with the concrete rewrites
that ship alongside this doc.

## The core diagnosis

The symptoms — shorter, stiffer, more robotic, less engaging — are not the
model regressing. They're the result of running a prompt that was **tuned for
the wrong model**.

GPT-4o mini is a chatty, warm-by-default, slightly over-eager model. The
sensible way to tame it is with *constraints*: "keep responses concise",
"prefer short paragraphs", "avoid walls of text", a long banned-words list, and
"strictly enforced" copy rules. Those brakes produced balanced output on 4o
mini because the model was already pushing hard on the gas.

gpt-5.4-nano behaves differently. It is a small **reasoning** model that follows
instructions far more literally and defaults to terse, economical output. When
you hand it a prompt built almost entirely from prohibitions and "be concise"
directives, it doesn't need taming — it needs *encouragement*, and instead it
gets the brakes slammed. The result is exactly what you're seeing: clipped,
list-shaped, personality-free answers.

So the fix is not small edits. It's re-pointing the prompt architecture at how
gpt-5.4-nano actually behaves: **positive behavioural targets instead of
prohibitions, a proper system/developer split, a RAG frame that rewards
synthesis, richer few-shot anchors, and generation params that use the model's
real levers (`verbosity` and `reasoning_effort`) instead of a low
`temperature`.**

---

## 1. System prompt (`ARKHE_SYSTEM_PROMPT`)

### What was good

- **Clear identity and third-person guardrail.** "You are not Ahmad… do not
  speak in first person" is exactly right and worth keeping verbatim in spirit.
- **Strong privacy/safety/scope sections.** The confidentiality list and the
  prompt-safety section are thorough and appropriate for a public assistant.
- **The anchored career-start year.** Using a fixed `2021` instead of a rolling
  "N years" is a genuinely nice, maintenance-free touch.
- **Permanent facts block.** Good instinct to give the model stable, always-safe
  ground truth.

### What was wrong for gpt-5.4-nano

- **The voice section is almost all "don't".** "Never use exclamation marks",
  "avoid superlatives", "avoid clichés", plus "keep responses concise" and "lead
  with the direct answer". There is barely any positive instruction telling the
  model *how* to be warm, curious, or expressive. A literal-minded reasoning
  model reads a wall of prohibitions as "say as little as possible, safely" —
  which is the robotic register you're getting.
- **"Keep responses concise" is actively harmful here.** On 4o mini it was a
  counterweight. On nano it's redundant reinforcement of the model's own bias
  toward brevity. Combined with "prefer short paragraphs" and "avoid walls of
  text", the prompt is telling an already-terse model to be terser.
- **`## Response Formatting` says "Use bullet lists for skills, technologies,
  and projects."** This is the single line most responsible for the "sounds
  like bullet points" complaint. It instructs the exact behaviour your style
  guide wants to avoid.
- **The grounding rules are phrased as fear.** "Never invent, infer, speculate,
  or rely on assumptions" three times over pushes the model toward defensive,
  copy-the-document answers rather than confident synthesis. Faithfulness and
  synthesis aren't in tension, but this phrasing makes the model act like they
  are.
- **Mixed altitude.** Identity, voice, formatting, citation mechanics, and
  safety all live in one flat system message. Everything reads as equally
  immutable, which both bloats the "rules surface" (making nano more cautious)
  and wastes the model's instruction hierarchy.

### The rewrite

The new system prompt keeps every guardrail but re-frames the voice as a
**register to settle into**, with explicit positive targets: *warm and
conversational, professional but approachable, curious, considered, confident
not boastful*, and an instruction to **write in complete, natural paragraphs**.
The banned-words list survives, but demoted to "a few light habits… treat these
as a register, not rules to obsess over — and never let them push you toward
being terse or robotic." Grounding is reframed as "synthesize and connect in
your own words… but never invent," which keeps faithfulness while explicitly
licensing synthesis.

Crucially, the system prompt now carries **only stable identity and immutable
policy** — no formatting rules, no citation mechanics, no examples. Those moved
to the developer prompt.

### Why this works better for gpt-5.4-nano

A reasoning model optimizes toward the targets you give it. If the only targets
are "concise" and a list of forbidden words, it optimizes for silence.
Replacing prohibitions with positive behavioural goals gives it something to
*maximize* (warmth, synthesis, helpfulness) rather than only things to avoid.
And a shorter, purely-identity system message keeps the "you must never" surface
small, which makes nano less defensive and more willing to elaborate.

---

## 2. Developer prompt (new)

### What was there before

**Nothing.** Everything went into a single `system` message. That's a missed
opportunity on a GPT-5-class model, which respects a genuine instruction
hierarchy: `system` (identity/policy) outranks `developer` (task behaviour)
outranks `user`.

### The rewrite

A new `ARKHE_DEVELOPER_PROMPT` now owns everything task-shaped:

- **Answer shape** — natural paragraphs, synthesize don't restate, connect
  related projects, explain the why.
- **Length matched to the question** — a warm sentence or two for a simple
  factual question; a fuller, reasoned answer for a rich one. This replaces the
  flat "be concise" with *adaptive* length, which is what you actually asked
  for.
- **"Prose, not bullets — unless asked"** — directly overrides the old
  bullet-list instruction.
- **Curiosity** — invite the visitor one step deeper *when it feels natural*,
  with an explicit warning not to tack a reflexive "let me know if you have
  other questions" onto every turn.
- **Citation mechanics** — moved here from the system prompt, since they're task
  behaviour, not identity.
- **Few-shot examples** — moved and rewritten (see §4).

### Why this works better for gpt-5.4-nano

Separating stable identity from per-turn task instructions means the system
message can stay byte-for-byte identical across the whole conversation (good for
prompt caching and cost), while the developer message carries the volatile
knowledge and behaviour. It also lets the model weight instructions correctly:
safety/identity are immutable, but "how long should this answer be" is a task
decision it's free to adapt per question. This is the intended design of the
GPT-5 message roles, and using it reduces the "everything is a hard rule"
pressure that makes nano clam up.

---

## 3. RAG prompt (retrieved-knowledge block)

### What was good

- Excerpts are numbered and citation-tagged — a clean citation contract.
- Retrieved chunks are explicitly ranked above the static profile.
- Graceful degradation: retrieval failure falls back to the static knowledge
  base rather than breaking the chat.

### What was wrong for gpt-5.4-nano

- **"Prefer these when answering… Treat it as the highest-priority source"**,
  layered on top of the system prompt's triple "never invent/infer/speculate",
  nudges the model to **hug the source text** — lifting phrasing verbatim
  instead of digesting it. That reads as a search engine, not a guide.
- The block was appended to the *system* message, so the raw documents shared
  the highest-authority channel with identity and safety rules. Retrieved
  content is task input; it belongs in the developer channel.

### The rewrite

The retrieved block moved into the developer prompt and its framing changed from
"prefer / highest-priority source" to:

> Ground your answer in these and cite them inline as `[n]`. **Synthesize across
> them in your own words — explain and connect, don't copy them verbatim.**

The static profile is now labelled "Baseline facts… draw on these when the
retrieved excerpts don't cover the question, or to round out context. These are
not citable."

### Why this works better for gpt-5.4-nano

"Ground in, but synthesize" tells the model *what to do with* the documents
(digest and explain) rather than only *how much to trust* them. Faithfulness is
preserved by the explicit "never invent" in the system prompt and by the
citation contract; the RAG block no longer doubles down on caution at the
expense of voice. Moving raw retrieved text out of the system channel also keeps
the highest-authority message purely about who Arkhe is and what it must never
do.

---

## 4. Prompt structure & few-shot examples

### What was good

The few-shots existed at all (a strong lever on small models) and were factually
tight.

### What was wrong

- They were **short and dry**, and few-shots set the *ceiling* for output
  length and warmth. Nano matches the register of its examples closely, so
  clipped examples guarantee clipped answers.
- The "Is Ahmad familiar with backend development?" example modelled a slightly
  **defensive** tone ("not his primary focus or strength"), which is not the
  confident-guide register you want.
- They lived in the system prompt alongside policy.

### The rewrite

Four rewritten examples now live in the developer prompt. They are longer, flow
as paragraphs, **connect experiences** ("that view comes through in both his
OneUX Lab work and his ARKÆS system"), explain the *why*, and end some (not all)
turns with a light curious invitation. One example models a **graceful refusal**
of an out-of-scope coding question while still redirecting warmly. A header tells
the model to match the *feel*, not the wording.

### Why this works better for gpt-5.4-nano

Examples are the highest-leverage instruction for a small model — it will
imitate their length, structure, and tone more faithfully than it follows any
abstract adjective. Warm, synthesized, paragraph-shaped examples do more to fix
the "robotic" complaint than any single rule could.

---

## 5. Generation parameters

The previous config sent only `temperature: 0.4` on a `chat.completions` call.
That is a GPT-4o-era setup. Here is the assessment and the new defaults.

| Parameter | Before | Now | Reasoning for gpt-5.4-nano |
|---|---|---|---|
| `temperature` | `0.4` | **unset** | gpt-5.4-nano is a reasoning model that expects its fixed default (1). A low 0.4 flattens word choice and is a direct contributor to the stiff tone; on reasoning models a non-default value is often ignored or rejected outright. Removed from the default path; still overridable for models that honour it. |
| `verbosity` | — (not sent) | **`"medium"`** | The single most important change. `verbosity` is the GPT-5 lever that controls reply length/expansiveness. Not setting it let the model default to terse. `"medium"` restores warm, elaborated prose; `"low"` reproduces the robotic feel; `"high"` over-explains. |
| `reasoning_effort` | — (not sent) | **`"low"`** | A portfolio Q&A is lookup-and-explain, not a hard reasoning problem. `"low"` keeps replies snappy and avoids the latency and occasional over-thinking of `"medium"`/`"high"`, while still letting the model plan a well-shaped answer. `"minimal"` tends to come back too clipped. |
| `max_completion_tokens` | — (not sent) | **`800`** | `max_tokens` is deprecated for GPT-5-class models; `max_completion_tokens` is its replacement. 800 is generous enough to elaborate but caps a runaway reply. (Note: this budget is shared with reasoning tokens, which is another reason to keep `reasoning_effort` low.) |
| `top_p` | — (default 1) | default 1 | Leave at 1. Tune length via `verbosity`, not nucleus sampling — and never co-tune `top_p` and `temperature`. |
| `frequency_penalty` | — (default 0) | default 0 | Keep at 0. It's a blunt token-level penalty and the wrong tool for "avoid repetitive AI phrases" — that's handled in the prompt. On reasoning models the penalties are also poorly supported and can cause odd word-avoidance. |
| `presence_penalty` | — (default 0) | default 0 | Same as above. Leave off. |

### Why this combination

For gpt-5.4-nano the effective controls are **`verbosity` (how much it says)** and
**`reasoning_effort` (how hard it thinks)** — not `temperature`. Warmth and
length come from `verbosity: "medium"` plus the rewritten prompts; groundedness
comes from the RAG contract and `reasoning_effort: "low"` being enough to plan a
faithful answer without wandering. The old `temperature: 0.4` was solving a
problem this model doesn't have and creating one it does.

---

## 6. Conversation flow

### What was good

- `maxMessages: 12` and `maxMessageLength: 4000` are sensible windows.
- Rate limiting, origin checks, oversized-body rejection, and the streaming
  fallback message are all solid and untouched.
- RAG retrieval runs on the latest user turn with a graceful fallback.

### What could improve (and what changed)

- **The system prompt is now stable across turns**, so it's a good candidate for
  prompt caching — worth enabling if the provider/SDK supports it, since the
  identity block is large and identical every request.
- **Curiosity is now a flow behaviour, not just a trait.** The developer prompt
  asks Arkhe to occasionally offer a next thread — which turns a Q&A into a
  guided conversation — while explicitly forbidding the reflexive
  every-message sign-off that reads as robotic.
- **Refusals are now conversational.** The old prompt hard-coded canned refusal
  strings ("Arkhe is here to answer questions about Ahmad…"). Verbatim canned
  lines are the definition of robotic and repetitive. The rewrite gives the
  *intent* (decline warmly, point to Ahmad / arkaes.dev) and lets the model
  phrase it naturally each time, which is both warmer and less repetitive.

### Not changed, but worth a look later

- The 4000-char-per-message cap truncates mid-string; fine for a chat widget,
  but if visitors paste long job descriptions you may want to summarize rather
  than hard-cut.
- There's no explicit greeting/opening-turn guidance. If the widget shows a
  cold start, a short seeded assistant intro could set the tone before the first
  question.

---

## Summary of shipped changes

- `persona.ts` — split into `ARKHE_SYSTEM_PROMPT` (identity/policy, positive
  voice) and `ARKHE_DEVELOPER_PROMPT` (answer shape, citations, richer
  few-shots).
- `knowledge.ts` — `buildSystemPrompt()` now returns just the identity;
  new `buildDeveloperPrompt(knowledge, options)` carries per-request knowledge;
  RAG block reframed toward synthesis.
- `handler.ts` — sends `system` + `developer` messages; adds `reasoningEffort`
  (`"low"`), `verbosity` (`"medium"`), `maxOutputTokens` (800); `temperature`
  unset by default.

All three are configurable via `createChatHandler` options, so the defaults can
be tuned per deployment without touching the package.
