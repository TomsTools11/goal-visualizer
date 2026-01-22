import { useEffect, useState } from 'react';

interface DataItem {
  name: string;
  value: number;
  isHighlighted?: boolean;
}

interface ComparisonChartProps {
  title: string;
  subtitle?: string;
  data: DataItem[];
  formatValue?: (value: number) => string;
  badge?: string;
  delay?: number;
}

const ComparisonChart = ({ 
  title, 
  subtitle, 
  data, 
  formatValue = (v) => `${v}%`,
  badge,
  delay = 0 
}: ComparisonChartProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const maxValue = Math.max(...data.map(d => d.value));

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className="chart-card opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {badge && (
          <span className="metric-badge">{badge}</span>
        )}
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const widthPercent = (item.value / maxValue) * 100;
          
          return (
            <div key={item.name} className="flex items-center gap-4">
              <div className="w-28 flex-shrink-0 text-right">
                <span className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                  {item.isHighlighted && <span className="text-primary">★</span>}
                  {item.name}
                </span>
              </div>
              
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-8 bg-muted/50 rounded-md overflow-hidden">
                  <div
                    className={`h-full rounded-md transition-all duration-700 ease-out ${
                      item.isHighlighted ? 'comparison-bar-primary' : 'comparison-bar-secondary'
                    }`}
                    style={{ 
                      width: isVisible ? `${widthPercent}%` : '0%',
                      transitionDelay: `${index * 100}ms`
                    }}
                  />
                </div>
                <span className={`text-sm font-semibold w-20 text-right ${
                  item.isHighlighted ? 'text-primary' : 'text-foreground'
                }`}>
                  {formatValue(item.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonChart;
