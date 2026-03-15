import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, style, hover = true, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.015, y: -3 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 24,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ label, value, icon, color = "green" }: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "green" | "purple" | "blue" | "orange" | "pink";
}) {
  const c: Record<string, string> = {
    green: "var(--web3-green)", purple: "var(--web3-purple)",
    blue: "var(--web3-blue)", orange: "var(--web3-orange)", pink: "var(--web3-pink)",
  };
  return (
    <GlassCard hover={false}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: c[color] }}>{value}</p>
        </div>
        {icon && (
          <div style={{ padding: 10, borderRadius: 10, background: `color-mix(in srgb, ${c[color]} 15%, transparent)` }}>
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
