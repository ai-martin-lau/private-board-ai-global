<p align="center">
  <a href="README_ZH.md">简体中文</a> · <a href="README.md">English</a> · <a href="README_JA.md">日本語</a> · <a href="README_KO.md">한국어</a> · <a href="README_ES.md">Español</a>
</p>

# Private Board AI

> Your private boardroom for hard decisions.

Private Board AI turns a messy personal or strategic question into a structured boardroom debate. Instead of asking one AI for one smooth answer, you invite a panel of sharp minds to challenge each other, disagree, revise, and help you see the decision from multiple angles.

It is not a fortune teller. It is not a life coach. It is a thinking room.

## Why This Exists

Most important decisions are not blocked by lack of advice. They are blocked by unclear tradeoffs.

Should I quit my job? Start a company? Move countries? Take the safer path? Double down on a risky idea? Choose money, freedom, status, family, curiosity, or long-term optionality?

Private Board AI helps by simulating the kind of conversation you wish you could have before making the call:

- one person argues from downside protection
- another pushes for ambition and leverage
- another asks what game you are really playing
- another challenges the hidden assumption
- and you decide whether the board should keep debating

## What It Does

- **Personal board selection**: answer a short profile, ask a question, and DeepSeek recommends a board for your situation.
- **Adjustable lineup**: keep the recommended board, remove people, or choose your own panel.
- **Real multi-round debate**: the board debates in separate rounds, not one fake monologue.
- **Human-in-the-loop continuation**: after two rounds, you decide whether they continue. Your feedback becomes part of the next round.
- **Chinese and English modes**: localized UI, prompts, examples, advisor names, and disclaimers.
- **Local persistence**: profile, question, board selection, and debate progress are saved in browser storage.
- **Bring your own DeepSeek key**: the app supports a user-provided API key stored only in the browser.

## How It Feels

Ask:

> I am considering leaving my stable job to build a small AI product. I have savings for 12 months, but my family expects me to stay on a predictable path. What should I do?

Private Board AI does not simply answer. It convenes a board, lets them argue, then asks you:

> Should they continue? What should they consider next?

You can add:

> Continue, but focus more on downside risk and what I should validate before quitting.

The next debate round responds to that context.

## 中文简介

Private Board AI 是一个“私人董事会”实验：你填写轻量用户画像，提出一个真实困惑，系统会推荐一组适合这个问题的董事成员，让他们围绕你的问题进行多轮辩论。

它不是让 AI 直接告诉你答案，而是帮你把重大选择拆成更清晰的取舍、风险、机会和盲点。

适合这些问题：

- 要不要换工作、创业、转行、出国
- 要不要做一个高风险但高上限的选择
- 如何在钱、自由、家庭、成长、声誉之间取舍
- 一个商业、产品、职业或人生决策是否值得继续投入

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| LLM | DeepSeek via OpenAI-compatible API |
| Selection model | `deepseek-v4-flash` |
| Debate model | `deepseek-v4-flash` |
| Streaming | Server-Sent Events |
| Storage | Browser `localStorage` + `sessionStorage` |
| Tests | Vitest |

## Getting Started

```bash
cp .env.local.example .env.local
```

Add your DeepSeek API key:

```env
DEEPSEEK_API_KEY=sk-xxx
```

Install dependencies and run locally:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev          # start local dev server
npm run build        # production build
npm run lint         # eslint
npm test             # run tests
npm run test:watch   # watch tests
```

## Privacy And Safety

- `.env.local` is ignored by Git and should never be committed.
- User-provided API keys are stored in the browser, not in the repository.
- Board members are AI simulations based on public-facing ideas and writing styles.
- Generated debate is for reflection and decision support only. It is not legal, medical, financial, or professional advice.

## Status

This is an experimental decision-support interface. The core experience is working:

- profile onboarding
- board recommendation
- board adjustment
- bilingual interface
- real multi-round debate
- user-guided continuation
- persisted debate state
- DeepSeek integration

## Built For

People who do not want a single answer.

People who want their assumptions challenged before a consequential decision.

People who think better when strong perspectives collide.
