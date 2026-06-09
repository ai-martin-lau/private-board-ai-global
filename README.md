<p align="center">
  <a href="README.md">简体中文</a> · <a href="README_EN.md">English</a> · <a href="README_JA.md">日本語</a> · <a href="README_KO.md">한국어</a> · <a href="README_ES.md">Español</a>
</p>

# Private Board AI

> 你处理艰难决策的私人董事会。

Private Board AI 把一个纷乱的个人或战略问题，转化为一场结构化的董事会辩论。你不再是向单个 AI 索取一个圆滑的答案，而是邀请一群犀利的头脑彼此交锋、争论、修正，帮你从多个角度看清这个决策。

它不是算命先生，也不是人生导师。它是一间思考的房间。

## 为什么要做这个

大多数重要决策的瓶颈，不是缺乏建议，而是取舍不清。

我该辞职吗？要不要创业？要不要移居别国？走更稳妥的路？还是在一个有风险的想法上加倍投入？究竟该选钱、自由、地位、家庭、好奇心，还是长期的可选择性？

Private Board AI 帮你模拟那种你希望在拍板之前能拥有的对话：

- 有人从下行风险防护的角度据理力争
- 有人推动你追求野心与杠杆
- 有人追问你真正在玩的是哪一场游戏
- 有人挑战你那个隐藏的假设
- 而由你来决定董事会是否继续辩论

## 它能做什么

- **个性化董事会推荐**：填写一份简短的画像，提出一个问题，DeepSeek 便会为你的处境推荐一组董事会成员。
- **可调整的阵容**：保留推荐的董事会、移除其中的人，或自行挑选你的专家组。
- **真正的多轮辩论**：董事会分多轮展开辩论，而非一段虚假的独白。
- **人在回路的续辩机制**：两轮之后，由你决定他们是否继续。你的反馈会成为下一轮辩论的一部分。
- **中英文双模式**：界面、提示词、示例、顾问姓名和免责声明均已本地化。
- **本地持久化**：画像、问题、董事会选择和辩论进度都保存在浏览器存储中。
- **自带 DeepSeek 密钥**：应用支持用户自行提供 API key，且仅存储在浏览器中。

## 它用起来是什么感觉

提问：

> 我正在考虑离开稳定的工作，去做一个小型 AI 产品。我有 12 个月的存款，但家人希望我走一条可预期的路。我该怎么办？

Private Board AI 不会直接给出答案。它会召集一个董事会，让他们辩论，然后反问你：

> 他们应该继续吗？接下来他们应该考虑什么？

你可以补充：

> 继续，但更聚焦于下行风险，以及我在辞职前应该验证些什么。

下一轮辩论便会回应这一上下文。

## 简介

Private Board AI 是一个“私人董事会”实验：你填写轻量用户画像，提出一个真实困惑，系统会推荐一组适合这个问题的董事成员，让他们围绕你的问题进行多轮辩论。

它不是让 AI 直接告诉你答案，而是帮你把重大选择拆成更清晰的取舍、风险、机会和盲点。

适合这些问题：

- 要不要换工作、创业、转行、出国
- 要不要做一个高风险但高上限的选择
- 如何在钱、自由、家庭、成长、声誉之间取舍
- 一个商业、产品、职业或人生决策是否值得继续投入

## 技术栈

| 层级 | 选型 |
|---|---|
| 框架 | Next.js 16 App Router + React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 大模型 | DeepSeek via OpenAI-compatible API |
| 推荐模型 | `deepseek-v4-flash` |
| 辩论模型 | `deepseek-v4-flash` |
| 流式传输 | Server-Sent Events |
| 存储 | Browser `localStorage` + `sessionStorage` |
| 测试 | Vitest |

## 快速开始

```bash
cp .env.local.example .env.local
```

填入你的 DeepSeek API key：

```env
DEEPSEEK_API_KEY=sk-xxx
```

安装依赖并在本地运行：

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

## 脚本命令

```bash
npm run dev          # 启动本地开发服务器
npm run build        # 生产环境构建
npm run lint         # eslint 检查
npm test             # 运行测试
npm run test:watch   # 监听模式运行测试
```

## 隐私与安全

- `.env.local` 已被 Git 忽略，绝不应提交。
- 用户提供的 API key 存储在浏览器中，而非仓库里。
- 董事会成员是基于公开的观点与写作风格所做的 AI 模拟。
- 生成的辩论仅供反思与决策支持之用，不构成法律、医疗、财务或专业建议。

## 当前状态

这是一个实验性的决策支持界面。核心体验已经可用：

- 画像引导填写
- 董事会推荐
- 董事会调整
- 双语界面
- 真正的多轮辩论
- 用户引导的续辩
- 持久化的辩论状态
- DeepSeek 集成

## 为谁而做

为那些不想要单一答案的人。

为那些希望在做出重大决策之前，让自己的假设受到挑战的人。

为那些在强烈观点的碰撞中能更好思考的人。

## Star 趋势

[![Star 趋势图](https://api.star-history.com/svg?repos=ai-martin-lau/private-board-ai-global&type=Date)](https://star-history.com/#ai-martin-lau/private-board-ai-global&Date)
