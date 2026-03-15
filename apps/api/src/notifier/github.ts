import type { TipEvent } from '@tipagent/shared'

export async function notifyGitHub(event: TipEvent, amountUsdt: number, txHash: string, token: string): Promise<void> {
  const { repoName, prNumber, issueNumber } = event.context
  if (!repoName) return
  const number = prNumber ?? issueNumber
  if (!number) return

  const body = `✅ **TipAgent** sent **${amountUsdt.toFixed(2)} USDT** → @${event.recipient.id} 🎉\n` +
               `🔗 [View on Basescan](https://basescan.org/tx/${txHash})\n` +
               `_Powered by TipAgent — autonomous USDT tipping bot_`

  await fetch(`https://api.github.com/repos/${repoName}/issues/${number}/comments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "TipAgent/1.0",
    },
    body: JSON.stringify({ body }),
  })
}
