interface GradientTextProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function GradientText({ children, style }: GradientTextProps) {
  return (
    <span style={{
      background: 'linear-gradient(135deg, var(--web3-green), var(--web3-blue), var(--web3-purple))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      ...style,
    }}>
      {children}
    </span>
  );
}
