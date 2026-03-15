import { apiFetch } from '../lib/api'

interface Treasury {
  liquidUsdt: number
  aaveUsdt: number
  totalUsdt: number
  aaveApy: string | null
}

export function TreasuryPanel({ treasury, onRefresh }: { treasury: Treasury; onRefresh?: () => void }) {
  const handleDeposit = async () => {
    try {
      await apiFetch('/api/tips/treasury', { method: 'POST' })
      onRefresh?.()
    } catch (e) {
      alert('Manual deposit triggered (check logs)')
    }
  }

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '0.75rem', padding: '1.25rem' }}>
      <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#e0e0e0' }}>Treasury</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Row label="Liquid USDT" value={`$${treasury.liquidUsdt.toFixed(2)}`} color="#4ade80" />
        <Row
          label={`Aave USDT${treasury.aaveApy ? ` (APY ${treasury.aaveApy}%)` : ''}`}
          value={`$${treasury.aaveUsdt.toFixed(2)}`}
          color="#a78bfa"
        />
        <div style={{ borderTop: '1px solid #333', paddingTop: '0.75rem' }}>
          <Row label="Total USDT" value={`$${treasury.totalUsdt.toFixed(2)}`} color="#f59e0b" bold />
        </div>
      </div>
      <button
        onClick={handleDeposit}
        style={{
          marginTop: '1rem', width: '100%', padding: '0.6rem',
          background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '0.5rem',
          cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
        }}
      >
        ⚡ Manual Deposit to Aave
      </button>
    </div>
  )
}

function Row({ label, value, color, bold }: { label: string; value: string; color: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{label}</span>
      <span style={{ color, fontWeight: bold ? 700 : 600, fontSize: bold ? '1.1rem' : '0.95rem' }}>{value}</span>
    </div>
  )
}
