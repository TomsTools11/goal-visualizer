import { useRef } from 'react';
import GoalLogo from './GoalLogo';
import KPICard from './KPICard';
import ComparisonChart from './ComparisonChart';
import ExportButton from './ExportButton';
import { Trophy } from 'lucide-react';
import { useExportPDF } from '@/hooks/useExportPDF';

interface DashboardProps {
  objective: string;
  selectedKPIs: string[];
  data: any[];
}

const Dashboard = ({ objective, selectedKPIs, data }: DashboardProps) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { isExporting, exportPDF, exportPNG, exportBoth } = useExportPDF(dashboardRef);

  const getFilename = () => `goal-report-${new Date().toISOString().split('T')[0]}`;
  // Generate mock visualization data based on KPIs
  // In real app, this would process the actual CSV data
  const kpiData = {
    cpa: { value: '$21.24', label: 'Cost Per Lead' },
    lead_to_sale: { value: '2.6%', label: 'Lead → Sale Rate' },
    lead_to_quote: { value: '24.31%', label: 'Lead → Quote Rate' },
    quote_to_sale: { value: '10.84%', label: 'Quote → Sale Rate' },
  };

  const comparisonData = [
    {
      title: 'Contact Rate',
      subtitle: 'Leads successfully contacted',
      badge: '2.1x better',
      data: [
        { name: 'Goal Leads', value: 30.1, isHighlighted: true },
        { name: 'QuoteWizard', value: 21.7 },
        { name: 'QuoteNerds', value: 17.9 },
        { name: 'Smart Financial', value: 15.5 },
        { name: 'Everquote', value: 2.5 },
      ],
    },
    {
      title: 'Quote Rate',
      subtitle: 'Leads that received quotes',
      badge: '3.0x better',
      data: [
        { name: 'Goal Leads', value: 17.5, isHighlighted: true },
        { name: 'Smart Financial', value: 8.4 },
        { name: 'QuoteNerds', value: 6.5 },
        { name: 'QuoteWizard', value: 6.1 },
        { name: 'Everquote', value: 2.5 },
      ],
    },
    {
      title: 'Lead → Sale',
      subtitle: 'Overall conversion rate',
      badge: '2.5x better',
      data: [
        { name: 'Goal Leads', value: 2.6, isHighlighted: true },
        { name: 'Smart Financial', value: 1.8 },
        { name: 'QuoteNerds', value: 1.4 },
        { name: 'Everquote', value: 0.6 },
        { name: 'QuoteWizard', value: 0.4 },
      ],
    },
    {
      title: 'Total Sales',
      subtitle: 'Closed deals',
      badge: '2.1x better',
      formatValue: (v: number) => v.toString(),
      data: [
        { name: 'QuoteNerds', value: 56 },
        { name: 'Goal Leads', value: 52, isHighlighted: true },
        { name: 'Smart Financial', value: 33 },
        { name: 'Everquote', value: 6 },
        { name: 'QuoteWizard', value: 2 },
      ],
    },
  ];

  const summaryCards = [
    { value: '2.1x', label: 'Higher Contact Rate', variant: 'primary' as const },
    { value: '3.0x', label: 'Higher Quote Rate', variant: 'primary' as const },
    { value: '2.5x', label: 'Better Conversion', variant: 'primary' as const },
    { value: '52 vs 97', label: 'Sales (Us vs All 4)', variant: 'default' as const },
  ];

  return (
    <div ref={dashboardRef} data-export-container className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient border-b border-border/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <GoalLogo className="h-10 w-auto" />
            <div data-export-button>
              <ExportButton
                isExporting={isExporting}
                onExportPDF={() => exportPDF({ filename: getFilename() })}
                onExportPNG={() => exportPNG({ filename: getFilename(), quality: 3 })}
                onExportBoth={() => exportBoth({ filename: getFilename() })}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="header-gradient pb-8">
        <div className="container mx-auto px-6 pt-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-goal-success-light text-goal-success text-sm font-medium mb-4 opacity-0 animate-fade-in">
              <Trophy className="w-4 h-4" />
              Industry-Leading Performance
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
              {objective || 'Outperforming the Competition'}
            </h1>
            
            <p className="text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Comprehensive analysis based on {data.length} data points
            </p>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 bg-card rounded-2xl p-6 shadow-sm border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
            {summaryCards.map((card, index) => (
              <KPICard 
                key={card.label}
                value={card.value}
                label={card.label}
                variant={card.variant}
                delay={400 + index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Selected KPIs */}
        {selectedKPIs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {selectedKPIs.map((kpi, index) => {
              const kpiInfo = kpiData[kpi as keyof typeof kpiData];
              if (!kpiInfo) return null;
              return (
                <KPICard
                  key={kpi}
                  value={kpiInfo.value}
                  label={kpiInfo.label}
                  variant="primary"
                  delay={600 + index * 100}
                />
              );
            })}
          </div>
        )}

        {/* Comparison Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {comparisonData.map((chart, index) => (
            <ComparisonChart
              key={chart.title}
              title={chart.title}
              subtitle={chart.subtitle}
              badge={chart.badge}
              data={chart.data}
              formatValue={chart.formatValue}
              delay={800 + index * 150}
            />
          ))}
        </div>

        {/* Bottom Line Summary */}
        <div className="chart-card flex flex-col md:flex-row items-center justify-between gap-6 opacity-0 animate-fade-in" style={{ animationDelay: '1400ms' }}>
          <div>
            <h3 className="text-xl font-semibold mb-2">The Bottom Line</h3>
            <p className="text-muted-foreground">
              Goal Leads delivers <span className="text-primary font-semibold">2.6% lead-to-sale conversion</span> — 
              that's <span className="text-goal-success font-semibold">2.8x better</span> than the competitor average of 0.93%
            </p>
          </div>
          <div className="flex-shrink-0 text-center kpi-card">
            <p className="text-3xl font-bold text-primary">2.6%</p>
            <p className="text-xs text-primary uppercase tracking-wide font-semibold mt-1">Best Conversion</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Generated by GOAL Data Visualizer • Powered by accurate data insights</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
