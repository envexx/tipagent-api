interface Tip {
  id: number
  event_id: string
  source: string
  event_type: string
  recipient_id: string
  recipient_addr: string
  amount_usdt: string
  reasoning: string | null
  tx_hash: string | null
  chain: string
  status: string
  created_at: number
}

const SOURCE_COLORS: Record<string, string> = {
  github: '#238636', discord: '#5865f2', webhook: '#f59e0b',
}
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e', failed: '#ef4444', processing: '#f59e0b', pending: '#6b7280',
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString()
}

export function TipFeed({ tips }: { tips: Tip[] }) {
  if (!tips.length)
    return <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No tips yet.</p>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
            {['Time', 'Source', 'Event', 'Recipient', 'Amount', 'Status', 'Tx'].map(h => (
              <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tips.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #1e1e1e' }}>
              <td style={{ padding: '0.6rem 0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatDate(t.created_at)}</td>
              <td style={{ padding: '0.6rem 0.75rem' }}>
                <span style={{ background: SOURCE_COLORS[t.source] ?? '#374151', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>
                  {t.source}
                </span>
              </td>
              <td style={{ padding: '0.6rem 0.75rem', color: '#d1d5db' }}>{t.event_type}</td>
              <td style={{ padding: '0.6rem 0.75rem', color: '#d1d5db', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {t.recipient_id}
              </td>
              <td style={{ padding: '0.6rem 0.75rem', color: '#4ade80', fontWeight: 600 }}>
                ${parseFloat(t.amount_usdt).toFixed(2)}
              </td>
              <td style={{ padding: '0.6rem 0.75rem' }}>
                <span style={{ color: STATUS_COLORS[t.status] ?? '#6b7280', fontWeight: 500 }}>
                  {t.status}
                </span>
              </td>
              <td style={{ padding: '0.6rem 0.75rem' }}>
                {t.tx_hash ? (
                  <a href={`https://basescan.org/tx/${t.tx_hash}`} target="_blank" rel="noreferrer"
                     style={{ color: '#7c3aed', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {t.tx_hash.slice(0, 10)}…
                  </a>
                ) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
