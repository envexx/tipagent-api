interface Props {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export function StatsCard({ label, value, sub, color = '#7c3aed' }: Props) {
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '0.75rem',
      padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
    }}>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.75rem', fontWeight: 700, color }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{sub}</p>}
    </div>
  )
}
