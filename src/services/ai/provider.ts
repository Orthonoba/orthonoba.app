import type { IAIProvider, AICompletionRequest, AICompletionResponse } from '@/src/types/automation'

// ─── Claude Provider (Anthropic) ─────────────────────────────────────────────
// Uses claude-sonnet-4-6 with prompt caching for repeated system prompts.
// Set ANTHROPIC_API_KEY to activate; falls back to RuleEngine when absent.

class ClaudeProvider implements IAIProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const messages: unknown[] = [{ role: 'user', content: req.prompt }]

    const body = {
      model: 'claude-sonnet-4-6',
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.3,
      system: [
        {
          type: 'text',
          text: req.system,
          // Prompt caching — system prompt cached after first call
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Anthropic API error ${res.status}: ${err}`)
    }

    const data = await res.json() as {
      content: Array<{ type: string; text: string }>
      usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number }
    }

    const content = data.content.find((b) => b.type === 'text')?.text ?? ''
    const tokensUsed = (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0)
    const cached = (data.usage.cache_read_input_tokens ?? 0) > 0

    let parsed: unknown = undefined
    if (req.responseSchema) {
      try {
        const jsonMatch = content.match(/```json\n?([\s\S]*?)```/) ?? content.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : content
        parsed = JSON.parse(jsonStr)
      } catch {
        // best-effort JSON parse
      }
    }

    return { content, parsed, modelUsed: 'claude-sonnet-4-6', tokensUsed, cached }
  }
}

// ─── Rule Engine Provider (no API key needed) ─────────────────────────────────
// Deterministic fallback — always available.

class RuleEngineProvider implements IAIProvider {
  isAvailable(): boolean { return true }

  async complete(_req: AICompletionRequest): Promise<AICompletionResponse> {
    return {
      content: 'rule-engine',
      modelUsed: 'rule-engine',
      tokensUsed: 0,
      cached: false,
    }
  }
}

// ─── Singleton resolution ─────────────────────────────────────────────────────

let _provider: IAIProvider | null = null

export function getAIProvider(): IAIProvider {
  if (_provider) return _provider
  const key = process.env.ANTHROPIC_API_KEY
  _provider = key ? new ClaudeProvider(key) : new RuleEngineProvider()
  return _provider
}

export function isAIEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}
