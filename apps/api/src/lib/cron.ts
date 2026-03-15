/**
 * Cron scheduler using node-cron
 * Replaces Cloudflare scheduled triggers
 */
import cron from 'node-cron'

type CronHandler = () => Promise<void>

const scheduledTasks: cron.ScheduledTask[] = []

export function scheduleCron(expression: string, handler: CronHandler, name: string) {
  const task = cron.schedule(expression, async () => {
    console.log(`[Cron] Running: ${name}`)
    try {
      await handler()
      console.log(`[Cron] Completed: ${name}`)
    } catch (e) {
      console.error(`[Cron] Error in ${name}:`, e)
    }
  })
  scheduledTasks.push(task)
  console.log(`[Cron] Scheduled: ${name} (${expression})`)
}

export function stopAllCrons() {
  scheduledTasks.forEach(task => task.stop())
  console.log('[Cron] All tasks stopped')
}
