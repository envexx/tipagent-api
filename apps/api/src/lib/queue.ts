/**
 * Simple in-memory queue for tip processing
 * Replaces Cloudflare Queues for Node.js runtime
 */
import type { TipEvent } from '@tipagent/shared'

export interface QueueMessage {
  type: 'tip_event'
  event: TipEvent
}

type QueueHandler = (msg: QueueMessage) => Promise<void>

class SimpleQueue {
  private queue: QueueMessage[] = []
  private processing = false
  private handler: QueueHandler | null = null
  private maxRetries = 3

  setHandler(handler: QueueHandler) {
    this.handler = handler
  }

  async send(message: QueueMessage) {
    this.queue.push(message)
    console.log(`[Queue] Message added, queue size: ${this.queue.length}`)
    this.processNext()
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0 || !this.handler) return

    this.processing = true
    const msg = this.queue.shift()!

    let retries = 0
    while (retries < this.maxRetries) {
      try {
        await this.handler(msg)
        console.log(`[Queue] Message processed successfully`)
        break
      } catch (e) {
        retries++
        console.error(`[Queue] Error processing message (attempt ${retries}/${this.maxRetries}):`, e)
        if (retries >= this.maxRetries) {
          console.error(`[Queue] Message failed after ${this.maxRetries} retries, moving to DLQ`)
          // In production, you'd want to persist failed messages
        }
      }
    }

    this.processing = false
    // Process next message if any
    if (this.queue.length > 0) {
      setImmediate(() => this.processNext())
    }
  }

  getQueueSize(): number {
    return this.queue.length
  }
}

// Singleton queue instance
export const tipQueue = new SimpleQueue()
