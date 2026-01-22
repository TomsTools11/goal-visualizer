interface KPICardProps {
  value: string;
  label: string;
  variant?: 'primary' | 'success' | 'default';
  delay?: number;
}

const KPICard = ({ value, label, variant = 'primary', delay = 0 }: KPICardProps) => {
  const valueClasses = {
    primary: 'text-primary',
    success: 'text-goal-success',
    default: 'text-foreground',
  };

  return (
    <div 
      className="kpi-card text-center opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className={`kpi-value ${valueClasses[variant]}`}>{value}</p>
      <p className="kpi-label">{label}</p>
    </div>
  );
};

export default KPICard;
