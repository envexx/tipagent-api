import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import type { TipEvent, TipDecision }     from '@tipagent/shared'
import type { RuleResult }                from '../engine/types'
import { buildSystemPrompt, buildUserPrompt } from './prompts'

const SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    allowed:      { type: SchemaType.BOOLEAN, description: "Whether to send the tip" },
    amountUsdt:   { type: SchemaType.NUMBER,  description: "USDT amount" },
    reasoning:    { type: SchemaType.STRING,  description: "Why this amount" },
    rejectReason: { type: SchemaType.STRING,  description: "Reason if not allowed, else empty string" },
  },
  required: ["allowed", "amountUsdt", "reasoning"],
}

export async function evaluateWithGemini(
  event: TipEvent, 
  rule: RuleResult, 
  apiKey: string,
  ownerTasks?: string | null
): Promise<TipDecision> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.2, maxOutputTokens: 256 },
    systemInstruction: buildSystemPrompt(
      rule.minAmount, 
      rule.maxAmount, 
      rule.suggestedMin, 
      rule.suggestedMax,
      ownerTasks
    ),
  })
  const res = await model.generateContent(buildUserPrompt(event))
  try {
    const d = JSON.parse(res.response.text()) as TipDecision
    d.amountUsdt = Math.min(Math.max(d.amountUsdt ?? rule.suggestedMin, rule.minAmount), rule.maxAmount)
    return d
  } catch {
    return { allowed: true, amountUsdt: rule.suggestedMin, reasoning: "Fallback: parse error" }
  }
}
