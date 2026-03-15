interface RegistryEntry {
  id: number
  source: string
  user_id: string
  display_name: string | null
  wallet_addr: string
  chain: string
  created_at: number
}

export function RegistryTable({ entries, onDelete }: {
  entries: RegistryEntry[]
  onDelete: (id: number) => void
}) {
  if (!entries.length)
    return <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No users registered yet.</p>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
            {['Source', 'User ID', 'Display Name', 'Wallet', 'Chain', 'Action'].map(h => (
              <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid #1e1e1e' }}>
              <td style={{ padding: '0.6rem 0.75rem', color: '#d1d5db' }}>{e.source}</td>
              <td style={{ padding: '0.6rem 0.75rem', color: '#a78bfa', fontFamily: 'monospace' }}>{e.user_id}</td>
              <td style={{ padding: '0.6rem 0.75rem', color: '#9ca3af' }}>{e.display_name ?? '—'}</td>
              <td style={{ padding: '0.6rem 0.75rem', color: '#d1d5db', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {e.wallet_addr.slice(0, 12)}…{e.wallet_addr.slice(-6)}
              </td>
              <td style={{ padding: '0.6rem 0.75rem', color: '#9ca3af' }}>{e.chain}</td>
              <td style={{ padding: '0.6rem 0.75rem' }}>
                <button
                  onClick={() => onDelete(e.id)}
                  style={{
                    background: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
                    padding: '0.25rem 0.6rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem',
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
