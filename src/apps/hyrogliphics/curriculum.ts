export type Track = 'initiate' | 'practitioner' | 'adept'

export type Practice = {
  title: string
  description: string
  kind: 'try-prompt' | 'reflect' | 'build' | 'read'
  prompt?: string
}

export type ModuleContent = {
  read: string[]
  practice: Practice
  outcome: string
}

export type Chapter = {
  id: string
  glyph: string
  name: string
  subtitle: string
  modules: Record<Track, ModuleContent>
}

export const TRACK_META: Record<
  Track,
  { glyph: string; name: string; subtitle: string }
> = {
  initiate: { glyph: '𓋹', name: 'Initiate', subtitle: 'First contact' },
  practitioner: {
    glyph: '𓊽',
    name: 'Practitioner',
    subtitle: 'Daily fluency',
  },
  adept: { glyph: '𓂀', name: 'Adept', subtitle: 'Build with it' },
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'tablet',
    glyph: '𓇳',
    name: 'The Tablet',
    subtitle: 'Foundations & first principles',
    modules: {
      initiate: {
        read: [
          'An AI model is not a thinking being. It is a pattern-matcher trained on vast amounts of human text. When you ask it something, it predicts the most likely next words. That is the entirety of the mechanism — astonishing, but not magical.',
          'Models hallucinate because their job is to sound right, not to be right. They have no internal sense of truth, only a sense of fluency. The skill of working with AI begins here: learning to trust the shape of its response, not its confidence.',
          'You will encounter tokens, context windows, training versus inference. These are the alphabet. Everything else is built from them.',
        ],
        practice: {
          title: 'The hallucination hunt',
          description:
            'Have a five-turn conversation with any model. Ask it for facts you can verify. Find at least three instances where it states something confidently that is wrong. Notice the tone — it never says "I am not sure" unless asked.',
          kind: 'try-prompt',
          prompt:
            "Tell me about three famous books by the author Maria Konnikova, with publication years and one-sentence summaries.",
        },
        outcome:
          'You stop being fooled by AI confidence and stop being scared of AI capability.',
      },
      practitioner: {
        read: [
          'Different models are good at different things. GPT-class models lead at coding and reasoning. Claude leads at long-form writing and careful work. Open-weight Llama is best when you control the runtime. Gemini is fast and cheap.',
          'Context window matters more than you think. Most failures at scale are not "the model is dumb" but "the model lost half of what you gave it." Know your window. Use retrieval when you exceed it.',
          'Cost is real once you ship. A token is fractions of a cent until you multiply by users. Track it from day one or pay the price later.',
        ],
        practice: {
          title: 'Triangulate the model',
          description:
            'Take one of your real tasks — a recurring email, a code snippet, a piece of analysis. Run it through three models. Note which got it right, which got it stylish, which got it fast. Choose your default for that kind of work.',
          kind: 'try-prompt',
          prompt:
            "Rewrite this sentence for clarity without losing its character: 'In the absence of evidence to the contrary, one might reasonably surmise that the principal contributor to the observed pattern is, in fact, the most parsimonious explanation.'",
        },
        outcome:
          'You pick the right model for the job in under a second.',
      },
      adept: {
        read: [
          'A transformer is layers of attention plus feedforward. Attention is the mechanism by which a token looks at every other token and decides what matters. This single operation, repeated and scaled, produces what we see as intelligence.',
          'Training is three phases: pre-training on the open web, supervised fine-tuning on curated examples, reinforcement learning from human feedback. Each phase shapes the model differently — pre-training gives it the world, SFT gives it manners, RLHF gives it preferences.',
          'Scale works because of emergent capabilities. Below a certain parameter count, models do not do arithmetic. Above it, they do. We do not fully know why. This is the frontier.',
        ],
        practice: {
          title: 'Read the originals',
          description:
            'Read "Attention Is All You Need" (2017) and the GPT-4 or Llama 3 technical report. For each: identify three claims that, if true, change how you build. Write them down. Verify against your experience.',
          kind: 'read',
        },
        outcome:
          'You can explain the mechanism to someone who matters — an investor, a teammate, a skeptic — without hand-waving.',
      },
    },
  },
  {
    id: 'eye',
    glyph: '𓂀',
    name: 'The Eye',
    subtitle: 'How models actually see',
    modules: {
      initiate: {
        read: [
          'Modern models can take in text, images, audio. But they do not see like you. They convert pixels and waveforms into embeddings — high-dimensional vectors — and reason over those.',
          'This has implications: a model can describe an image but may miss the obvious thing a child would see. It can transcribe audio but lose tone. It "perceives" in a fundamentally different geometry than human senses.',
        ],
        practice: {
          title: 'Test the eye',
          description:
            'Take a screenshot of something visually busy — a messy desk, a packed scene, a UI. Ask a vision-capable model to describe it. Note what it gets right, what it invents, what it misses entirely.',
          kind: 'reflect',
        },
        outcome:
          'You know when to trust a model with media and when to caption it yourself.',
      },
      practitioner: {
        read: [
          'Multimodal prompting unlocks workflows that text alone cannot reach. Screenshot a design, ask for the implementation. Photograph a whiteboard, ask for structured notes. Record a voice memo, get a draft.',
          'Vision adds latency and cost. Use it when the image carries irreducible information. Caption-then-text is often cheaper and equally good for simple cases.',
        ],
        practice: {
          title: 'A vision workflow',
          description:
            'Build a single-purpose tool that uses vision: a screenshot-to-component generator, a receipt-to-spreadsheet pipeline, a photo-to-poem maker. Use it for real for one week.',
          kind: 'build',
        },
        outcome:
          'You integrate vision where it earns its place in your stack.',
      },
      adept: {
        read: [
          'Vision transformers split images into patches and treat each patch as a token. CLIP-style models learn a joint embedding space where text and images live together — "a photo of a dog" and a literal photo of a dog map to nearby vectors.',
          'Multimodal alignment is the active research frontier. The gap between unimodal and truly cross-modal reasoning is where the next leaps will come from.',
        ],
        practice: {
          title: 'Fine-tune an embedding',
          description:
            'Take a domain you know — your industry, your hobby, your codebase. Train or fine-tune a sentence-embedding model on your domain. Compare retrieval quality before and after.',
          kind: 'build',
        },
        outcome:
          'You understand where multimodal seams break and can extend them deliberately.',
      },
    },
  },
  {
    id: 'voice',
    glyph: '𓋹',
    name: 'The Voice',
    subtitle: 'Prompting as craft',
    modules: {
      initiate: {
        read: [
          "Models respond to shape, not just facts. A well-shaped prompt — clear instruction, relevant context, an example of the form you want — gets you what you need. A poorly-shaped one gets you the model's average guess at what you might mean.",
          'Three habits to build immediately: (1) Be specific about format. (2) Give context the model could not infer. (3) Show, do not just tell.',
          'You are not "tricking" the model. You are removing ambiguity from your request.',
        ],
        practice: {
          title: 'Five shapes of the same ask',
          description:
            'Pick one thing you want. Write the prompt five different ways — terse, detailed, with an example, with a persona, with a constraint. Compare. Note which one got you closest. That is your default for that shape of request.',
          kind: 'try-prompt',
          prompt:
            "Help me write a follow-up email after a job interview with a senior engineer, where I want to mention a specific topic we discussed (caching strategies) without sounding like I'm trying too hard.",
        },
        outcome:
          'You stop typing into AI like it is Google.',
      },
      practitioner: {
        read: [
          'Few-shot prompting: give the model 2–5 examples of input/output pairs before asking for the real one. Often more effective than detailed instruction.',
          'Chain-of-thought: ask the model to think step by step. Trades latency for accuracy on reasoning-heavy tasks.',
          'Structured output: when you need JSON, demand JSON. Use response_format or schema enforcement. Loose output is a bug, not a feature.',
          'System vs. user message: system is the role, user is the situation. Drift the wrong one and the model loses voice.',
        ],
        practice: {
          title: 'One reusable prompt',
          description:
            'Take a task you do at least once a week. Turn it into a single prompt that does it in one tap. Save it. Use it daily. Adjust it weekly. The prompt is now part of your tool belt.',
          kind: 'try-prompt',
          prompt:
            "I'm going to paste my rough meeting notes below. Return: (1) a 2-sentence summary, (2) 3 bullet decisions made, (3) 3 bullet action items with owners and rough deadlines. Use this exact format. Notes: ...",
        },
        outcome:
          'You carry five reusable prompts that you do not have to rewrite each time.',
      },
      adept: {
        read: [
          "Prompts are programs. They have inputs, outputs, intermediate state, and modes of failure. Treat them with the same rigor you would treat code: version them, test them, evaluate them, refactor them.",
          'DSPy, prompt compilation, automatic optimization — these treat the prompt as a parameter to be learned, not a string to be hand-crafted. Useful when you have enough data to define "good."',
          'Eval-driven iteration: the best prompt is the one that wins on your eval set. Build the eval before the prompt.',
        ],
        practice: {
          title: 'A prompt with evals',
          description:
            'Pick a real task. Define what "good" means with 20 labeled examples. Write a prompt. Run it against the 20. Iterate until you hit your bar. Now you can defend the prompt with numbers.',
          kind: 'build',
        },
        outcome:
          'You can claim a prompt is good and back the claim.',
      },
    },
  },
  {
    id: 'pillar',
    glyph: '𓊽',
    name: 'The Pillar',
    subtitle: 'Agents, tools, memory',
    modules: {
      initiate: {
        read: [
          'An agent is not magic. It is a model that can call tools — read a file, search the web, write to a database — and use the results to decide what to do next. The "loop" is: think, act, observe, repeat.',
          'You have used agents already: Cursor when it makes edits, Claude Code when it runs commands, ChatGPT when it browses. They feel autonomous because they take actions you would have taken.',
        ],
        practice: {
          title: 'Watch an agent work',
          description:
            'Use a coding agent (Cursor, Claude Code) for an hour on something real. Notice when it nails the task and when it loops or fumbles. The pattern of its failures teaches you the shape of agent design.',
          kind: 'reflect',
        },
        outcome:
          'You stop being mystified. An agent is just a model with hands.',
      },
      practitioner: {
        read: [
          'Building a useful agent is mostly: clear tools, clear stopping conditions, clear state. Most failures are not "the model was dumb" but "the agent had ten ways to do the same thing and got confused."',
          'Tool definitions are prompts in disguise. Their names, descriptions, and parameter schemas shape how the model uses them. A vague tool description produces vague tool use.',
          'Memory is hard. Most "agent memory" is just RAG over a transcript. That is fine. Pretending otherwise builds nothing.',
        ],
        practice: {
          title: 'Build a small agent',
          description:
            'Build an agent that uses exactly two tools — say, web search and file write — to research a topic and produce a short brief. Constrain it to ten steps. Run it on three topics. Watch where it gets lost.',
          kind: 'build',
        },
        outcome:
          'You can build agents that finish what you ask of them.',
      },
      adept: {
        read: [
          'Agent architectures: ReAct, plan-and-execute, multi-agent debate, hierarchical decomposition. Each is a tradeoff between latency, cost, and reliability.',
          'Multi-agent systems work when roles are crisp and the handoff protocol is explicit. They fail when agents argue about what to do instead of doing it.',
          'Memory hierarchies — working memory, episodic memory, semantic memory — borrow from cognitive science. Useful as a design vocabulary, dangerous as a recipe.',
        ],
        practice: {
          title: 'Eval an agent',
          description:
            'Pick an agent that exists in production (yours or open-source). Build an evaluation harness that measures: success rate, average steps to finish, hallucinated tool calls, average cost. Run it on 50 tasks. The eval is your real artifact.',
          kind: 'build',
        },
        outcome:
          'You ship agents that survive Monday morning.',
      },
    },
  },
  {
    id: 'forge',
    glyph: '𓆣',
    name: 'The Forge',
    subtitle: 'Building & shipping',
    modules: {
      initiate: {
        read: [
          'The fastest path from idea to working AI app today: Vite + React + Vercel + one model API. Same stack a major SaaS uses. Free to start, hours to deploy.',
          'You do not need to "be technical." You need a clear idea, the patience to debug for an hour, and the willingness to ship something rough.',
          'The first version is not the goal. The first version is the artifact you learn from.',
        ],
        practice: {
          title: 'Ship the smallest thing',
          description:
            'Pick the smallest AI-powered idea you have ever sat on. Build it in one weekend. Push it to Vercel. Use it for a week. The size of the idea matters less than the act of shipping.',
          kind: 'build',
        },
        outcome:
          'You have shipped one thing. The wall between "user" and "builder" has fallen.',
      },
      practitioner: {
        read: [
          "Production-ready means a few specific things: streaming responses for UX, error handling that does not leak keys, rate limiting, basic observability, cost monitoring.",
          'The tools that matter today: Vercel for hosting, Cursor or Claude Code for writing it, OpenRouter or direct APIs for models, Posthog or Plausible for analytics, Sentry for errors.',
          'User feedback loops separate hobby projects from real ones. Build them in from day one — a thumbs up/down on every output is the floor.',
        ],
        practice: {
          title: 'Build the tool you wish existed',
          description:
            'Find one internal task you wish was automated — for your work, your hobby, your household. Build that exact tool. Use it daily for a month. Iterate based on the friction.',
          kind: 'build',
        },
        outcome:
          'You have one AI tool that someone — including possibly you — uses every day.',
      },
      adept: {
        read: [
          'Production AI is observability-first. Latency P99. Cost per request. Token consumption per user. Failure rate by prompt version. If you cannot see it, you cannot improve it.',
          'Caching is your friend. Prompt caching at the model level (Anthropic, OpenAI), output caching at the app level (Redis, edge KV), CDN caching for static AI outputs.',
          'Streaming changes UX, not just performance. A response that streams in feels twice as fast even when it is the same speed.',
          'Cost optimization at scale: use cheaper models for prefilters, route to expensive models only when needed, batch where you can, cache aggressively.',
        ],
        practice: {
          title: 'Half it',
          description:
            'Take a system you have shipped. Cut its P50 latency in half or its cost per request in half. Document what you did, what worked, what did not. The artifact is the write-up, not the optimization.',
          kind: 'build',
        },
        outcome:
          'You run AI in production with cost, latency, and reliability you can defend.',
      },
    },
  },
  {
    id: 'watchers',
    glyph: '𓁹',
    name: 'The Watchers',
    subtitle: 'Safety, evals, alignment',
    modules: {
      initiate: {
        read: [
          'Alignment, in plain English: getting AI systems to do what you actually want, not just what you literally asked for. A famous example: a model that "wins" a video game by exploiting a bug instead of playing the game.',
          'The risks worth understanding are mundane before they are dramatic: leaking secrets, fabricating citations, reinforcing biases, recommending the wrong dose, producing convincing nonsense.',
          'Safety is not a separate department. It is a property of the system you build.',
        ],
        practice: {
          title: 'Spot one failure',
          description:
            'Find one real example of an AI system doing something it should not have — in the news, in a friend\'s use, in your own usage. Articulate exactly why it failed and what would have prevented it.',
          kind: 'reflect',
        },
        outcome:
          'You see risks that others miss because you trained your eye for them.',
      },
      practitioner: {
        read: [
          'Evals you can ship today: golden dataset comparison, LLM-as-judge with a strict rubric, regex/format checks for structured output, semantic similarity for free-form output, human review for the edges.',
          'Guardrails: output filtering, prompt-injection detection, content moderation, sensitive-data redaction. Build them in early — retrofitting them later is twice the work.',
          "Logging without redaction is a data leak waiting to happen. Mask anything that looks like a key, an email, or a name by default.",
        ],
        practice: {
          title: 'Add an eval suite',
          description:
            'Take a prompt or agent you have in production. Build an eval suite of 20–50 cases. Run it. Find the failure modes. Fix the worst three. Re-run. This is the work.',
          kind: 'build',
        },
        outcome:
          'You ship things you trust because you have measured them.',
      },
      adept: {
        read: [
          'Red-teaming: deliberately attacking your own system to find where it breaks. The opposite of vibe-checking. Crucial for anything user-facing.',
          'RLHF mechanics: a reward model trained on human preference data, then PPO to optimize the language model against the reward. Constitutional AI replaces the human-preference step with self-critique against principles.',
          "The frontier of alignment is mechanistic interpretability — understanding what specific circuits in a model do. It is genuinely early. Read Anthropic's interpretability work, and OpenAI's eval frameworks. You are at the edge of the field.",
        ],
        practice: {
          title: 'Red-team yourself',
          description:
            'Spend a focused hour trying to break your own AI system. Get it to produce something embarrassing, leak something it should not, or behave in a way that would humiliate you publicly. Document each break. Then patch.',
          kind: 'build',
        },
        outcome:
          'You are part of the answer, not part of the problem.',
      },
    },
  },
]
