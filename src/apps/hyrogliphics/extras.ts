export type Teacher = {
  name: string
  role: string
  opener: string
}

export type Practice = {
  title: string
  artifact: string
  brief: string
}

export type LessonExtras = {
  teacher: Teacher
  practice: Practice
}

export const extras: Record<string, LessonExtras> = {
  'tablet-01': {
    teacher: {
      name: 'Sefa',
      role: 'Demystifier of the machine',
      opener:
        "I teach the same first lesson to everyone — and almost no one starts in the same place. Tell me one thing before we begin: what's the first sentence that comes to mind when someone says 'AI'? Don't think about it. Just say it. We'll work from there.",
    },
    practice: {
      title: 'Explain it to one real person',
      artifact:
        '100–200 word explanation of what a language model is, written for a specific person in your life.',
      brief:
        'Pick someone who has asked you (or might ask you) what AI actually is — a parent, a sibling, a coworker. Write a short explanation in language they would actually use. No jargon. When you have it, paste it here and we will sharpen it together.',
    },
  },
  'tablet-02': {
    teacher: {
      name: 'Tahit',
      role: 'Shaper of vessels',
      opener:
        "Every prompt is a container. Some hold what you meant. Most hold what you typed, which is different. Tell me about something you asked an AI to do this week that didn't quite land. We'll dissect the vessel.",
    },
    practice: {
      title: 'Audit a real prompt',
      artifact:
        'One prompt you actually used recently, plus the answer it gave, plus a diagnosis of which parts of the prompt failed.',
      brief:
        'Find a real prompt from your history (any chat tool counts). Paste it here along with the response you got. Tell me what you were really trying to do. I will walk you through which slots in the prompt were empty and how the model filled them.',
    },
  },
  'tablet-03': {
    teacher: {
      name: 'Renpet',
      role: 'Keeper of seasons',
      opener:
        "Most confusion in this field comes from mixing training and running. So I want to start with you: tell me one thing you have seen an AI 'remember' that surprised you — or one thing it forgot that surprised you. We will figure out which machine that actually was.",
    },
    practice: {
      title: 'Find the seam in your own life',
      artifact:
        'A description of one place in your workflow where you assumed the model was learning from you when it was not — or vice versa.',
      brief:
        'Think back over the last month of using AI. Where did you say or think "it learned that from me" or "it remembered our last chat"? Describe one such moment. We will name what was actually happening and what could be built differently.',
    },
  },
  'eye-01': {
    teacher: {
      name: 'Bek',
      role: 'The tokenist',
      opener:
        "Models do not see what you see. They see tokens — and once you see tokens, you stop being surprised by half their failures. Before we start, tell me a recent question where a model gave you a strange answer about letters, counting, or spelling. There is almost always a token explanation.",
    },
    practice: {
      title: 'Tokenize a real sentence',
      artifact:
        'A screenshot or paste of one sentence from your own work, tokenized — with three observations about the cuts.',
      brief:
        "Open any model's tokenizer playground (OpenAI, Anthropic, and Google all have one). Paste in a sentence from something you actually wrote this week. Look where the cuts fall. Bring me three things you noticed — surprising splits, names that became multiple tokens, anything you would not have guessed.",
    },
  },
  'eye-02': {
    teacher: {
      name: 'Iuni',
      role: 'Reader of attention',
      opener:
        "Attention is the engine. You do not need the math to use it — you need to feel it in your prompting. Quick diagnostic: when you write a long prompt, where do you put the most important instruction? Top, middle, or end? There is no wrong answer; I just want to know your habit.",
    },
    practice: {
      title: 'A/B the same prompt',
      artifact:
        'The same instruction, written two ways — one with the key constraint at the top, one with it at the end. Two outputs to compare.',
      brief:
        'Take a real task. Write the prompt twice, identical except for where you place the most important instruction. Run both. Paste both outputs here. We will look together at what attention actually did.',
    },
  },
  'eye-03': {
    teacher: {
      name: 'Hau',
      role: 'Keeper of the unseen',
      opener:
        "Half of debugging an AI is asking: what could the model actually see at that moment? Tell me one task you have tried recently where the model behaved like it was missing information. We will trace what was in its prompt — and what wasn't.",
    },
    practice: {
      title: 'Map the prompt of an app you use',
      artifact:
        'A best-guess diagram of what is inside the prompt when you use ChatGPT, Claude, Cursor, or any other AI app you live in.',
      brief:
        'Pick one AI product you use daily. Sketch (in text or a doodle) everything that you think is in the prompt when you send a message. System instruction? Memory? Files? Tools? Bring me your guess. I will help you sharpen it.',
    },
  },
  'voice-01': {
    teacher: {
      name: 'Aya',
      role: 'Mother of the first instruction',
      opener:
        "Specificity is the single highest-leverage habit in prompting. Most people know that and still write vague prompts. So tell me — what is a task you ask an AI to do regularly, and what does your usual prompt look like? Be honest. We will make it sharper.",
    },
    practice: {
      title: 'Close the three blanks',
      artifact:
        'A real prompt you use, rewritten to explicitly answer: audience, form, constraint.',
      brief:
        'Take a prompt you use often. Rewrite it so it names — in one sentence each — who the output is for, what shape it should take, and what is off-limits. Paste both versions here. We will run them side by side in your head before you run them in the model.',
    },
  },
  'voice-02': {
    teacher: {
      name: 'Meri',
      role: 'Teacher by example',
      opener:
        "Examples are the cheat code most people skip because typing them feels like more work. It almost never is. What is one task where you keep having to explain the format to the model and it keeps missing? Show me. We will replace the words with examples.",
    },
    practice: {
      title: 'Convert words to examples',
      artifact:
        'A prompt rewritten from a paragraph of instructions into two or three concrete input → output pairs.',
      brief:
        'Find a prompt you have where you are describing the format in words. Rewrite it as 2–3 example pairs (input → output) and a short framing. Run both versions. Bring me both outputs. We will look at where the example-version held that the words-version drifted.',
    },
  },
  'voice-03': {
    teacher: {
      name: 'Senen',
      role: 'Rulemaker',
      opener:
        "Role, constraint, format — three levers, always available, almost always under-used. Tell me: when you write prompts, do you usually leave the role implicit, or do you set one? I am going to push you toward the lever you are not using yet.",
    },
    practice: {
      title: 'Run the same task three ways',
      artifact:
        'One task, run three times: once with only a role change, once with only a constraint added, once with only a format specified.',
      brief:
        'Pick a single real task. Write four versions of the prompt: baseline, +role, +constraint, +format. Run all four. Paste the results. We will see which lever moved the needle most for your task — it will not be the same for everyone.',
    },
  },
  'pillar-01': {
    teacher: {
      name: 'Khu',
      role: 'Builder of bridges',
      opener:
        "Tool calls are the door from talking AI to working AI. Once you understand them, half of agent-mystique evaporates. Quick check: have you ever built or used something where an AI did an action — sent something, fetched something, edited a file? Walk me through what you remember of how it worked.",
    },
    practice: {
      title: 'Sketch a one-tool agent',
      artifact:
        'A written spec for a small AI app that uses exactly one tool — what the tool does, what arguments it takes, when the model should call it.',
      brief:
        "Think of one task in your life that needs both 'thinking' and 'doing.' Sketch (in plain English) a tiny app: one tool definition, one prompt, what the loop looks like. Bring it here. I will poke holes and we will tighten it together.",
    },
  },
  'pillar-02': {
    teacher: {
      name: 'Sa',
      role: 'Keeper of memory',
      opener:
        "Most 'AI memory' confusion comes from treating it as one thing. It is at least three. Tell me what kind of memory you wish an AI tool had, in plain words — what you wish it knew about you the next time you opened it. We will figure out which flavor that actually is.",
    },
    practice: {
      title: 'Design a memory shape',
      artifact:
        'A description of what memory you would build into one AI tool you use — and which flavor (context / scratchpad / external) you would use, with one sentence of why.',
      brief:
        'Pick one AI product you use. Describe — concretely — what it should remember about you, where that should live, and when it should be put back into the prompt. No code required. Show me your shape.',
    },
  },
  'pillar-03': {
    teacher: {
      name: 'Wer',
      role: 'Tamer of agents',
      opener:
        "I have watched a lot of agents fail. The failures are not creative — they are the same four shapes, over and over. So: tell me about a time an AI loop went off the rails for you, or one you have seen in the wild. We will diagnose which of the four it was and what would have caught it.",
    },
    practice: {
      title: 'Add the guard you would have wanted',
      artifact:
        'A description of one agent failure (yours or one you have read about) plus the specific guard rail you would add to prevent it.',
      brief:
        "Pick a real or reported agent failure. Write what happened in two sentences. Then write the one constraint, check, or human-in-the-loop tool that would have caught it. Bring it here. I will challenge whether your guard is actually sufficient — that is part of the lesson.",
    },
  },
  'forge-01': {
    teacher: {
      name: 'Mes',
      role: 'Forger of the first app',
      opener:
        "Most people who want to build with AI never ship the four-part version. They architect instead. I want to make sure you do not. So — tell me one task you do every week that you would love to push a button on. We will scope it to its smallest, ugliest, most useful shape.",
    },
    practice: {
      title: 'Spec a v0 you can build this week',
      artifact:
        'A one-paragraph spec of an AI app you would build, naming all four parts: input, prompt, call, output.',
      brief:
        'Take the smallest version of an AI app you want to build. Describe it in one paragraph, hitting each of the four parts. Do not architect; do not over-design. Bring it to me. We will cut it down further if needed.',
    },
  },
  'forge-02': {
    teacher: {
      name: 'Tep',
      role: 'Eye of the eval',
      opener:
        "If you cannot tell whether your AI app got better or worse after a change, you do not have an engineering practice — you have a vibes practice. I will keep you honest. Tell me about an AI app or prompt you have improved (or tried to). How did you know it actually improved?",
    },
    practice: {
      title: 'Write ten honest evals',
      artifact:
        'A list of ten real test cases for an AI app or prompt you use — input, expected behavior, how you would check.',
      brief:
        'Pick one prompt or app you care about. Write ten test cases: ten inputs you would run it on, what you would want the model to do, and how you would check. Plain text is fine. Show me. I will challenge any case that is wishy-washy.',
    },
  },
  'forge-03': {
    teacher: {
      name: 'Userhat',
      role: 'Keeper of the budget',
      opener:
        "Cost, latency, quality — three coupled knobs, and the answer is never to maximize all three. I am here to make you fluent in the trade. To start: which one of the three are you most worried about in something you are building or using? Be specific.",
    },
    practice: {
      title: 'Profile a real AI flow',
      artifact:
        'A description of one AI flow you use, with rough estimates of: tokens in, tokens out, latency to first response, model used.',
      brief:
        'Pick one AI flow you actually run. Estimate the four numbers above (rough is fine). Bring it here. We will look at which knob you are spending most on and where you could shift the trade.',
    },
  },
  'watchers-01': {
    teacher: {
      name: "Ma'at",
      role: 'Truth-checker',
      opener:
        "Hallucination is the most-discussed and least-understood failure mode. Tell me one time an AI confidently told you something that turned out to be wrong — extra points if it was something you almost acted on. We will look at why the fluent-true gap opened there.",
    },
    practice: {
      title: 'Catch one in the wild',
      artifact:
        'A documented case of a hallucination you caught — what was claimed, what was true, what mitigation would have caught it before you did.',
      brief:
        'Use any AI tool for a real task this week. Watch for one specific claim — citation, number, API name — that you can verify. Try to catch a hallucination on purpose. Bring me what you found and which of the mitigations would have prevented it.',
    },
  },
  'watchers-02': {
    teacher: {
      name: 'Anuke',
      role: 'Watcher of doorways',
      opener:
        "Once a model reads untrusted text, the trust boundary moved. Most builders learn this the hard way. Tell me: have you built or used something where an AI reads outside text — emails, web pages, documents? That is the room where I want to take you.",
    },
    practice: {
      title: 'Draft an injection',
      artifact:
        'A fictional email or document you would write if you were the attacker — designed to subvert an AI assistant — and the defense you would put in place if you were the builder.',
      brief:
        "Pick a specific AI app that reads outside text. Write — as the attacker — what you'd put in a doc or email to try to hijack it. Then write — as the builder — what you would do to keep that from working. Bring me both. This is the cheapest security drill in AI.",
    },
  },
  'watchers-03': {
    teacher: {
      name: 'Heret',
      role: 'Holder of the keys',
      opener:
        "This is the last lesson. The point of it is to leave you with the only piece of this you can never offload to the model: judgment. So tell me — what is one AI-touched decision in your life or work where you want to be more deliberate about being the human in the loop?",
    },
    practice: {
      title: 'Build one guard, for real',
      artifact:
        'A concrete change you will make this week to a system, workflow, or habit — adding a confirmation, a dry run, an undo, or a visible reasoning step.',
      brief:
        'Choose one AI-touched flow in your life. Add one of the four safety habits we just covered. Make the change before the week is out. Tell me what you changed and what you would have lost without the guard. We will name what you have learned and what comes next.',
    },
  },
}

export function getExtras(lessonId: string): LessonExtras | null {
  return extras[lessonId] ?? null
}
