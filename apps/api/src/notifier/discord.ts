import type { TipEvent } from '@tipagent/shared'

export async function notifyDiscord(event: TipEvent, amountUsdt: number, txHash: string, token: string): Promise<void> {
  const channelId = event.context.discordChannelId
  if (!channelId) return

  const content = `✅ **TipAgent** sent **${amountUsdt.toFixed(2)} USDT** → <@${event.recipient.id}> 🎉\n` +
                  `🔗 [View on Basescan](https://basescan.org/tx/${txHash})\n` +
                  `_Powered by TipAgent — autonomous USDT tipping bot_`

  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  })
}
