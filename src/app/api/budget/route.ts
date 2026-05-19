import { NextResponse } from "next/server";
import { getBudget } from "@/lib/server-helpers";

export const runtime = "edge";

const BUDGET_CNY = Number(process.env.BUDGET_CNY_PER_MONTH ?? 200);

export async function GET() {
  const budget = await getBudget(BUDGET_CNY);
  const state = await budget.read();
  return NextResponse.json(state);
}
