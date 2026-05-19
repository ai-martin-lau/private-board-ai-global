import { describe, it, expect } from "vitest";
import { extractPersonalitySections } from "../../../scripts/build-advisors";

const SAMPLE = `## 使用说明
This should be dropped.

## 角色扮演规则
Keep this — defines persona.

## 回答工作流（Agentic Protocol）
### Step 1: foo
Drop me.
### Step 2: bar
Drop me too.

## 核心心智模型
### 模型1: X
Keep.
### 模型2: Y
Keep.

## 表达DNA
### 句式
Keep.

## 价值观与反模式
### 追求
Keep.
`;

describe("extractPersonalitySections", () => {
  it("keeps personality sections", () => {
    const result = extractPersonalitySections(SAMPLE);
    expect(result).toContain("角色扮演规则");
    expect(result).toContain("核心心智模型");
    expect(result).toContain("表达DNA");
    expect(result).toContain("价值观与反模式");
  });

  it("drops agentic protocol and usage sections", () => {
    const result = extractPersonalitySections(SAMPLE);
    expect(result).not.toContain("使用说明");
    expect(result).not.toContain("回答工作流");
    expect(result).not.toContain("Step 1: foo");
    expect(result).not.toContain("Step 2: bar");
  });

  it("preserves section content under kept headings", () => {
    const result = extractPersonalitySections(SAMPLE);
    expect(result).toContain("Keep this — defines persona.");
  });
});
