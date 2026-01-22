import { useRef, useMemo } from 'react';
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

interface ChartDataItem {
  name: string;
  value: number;
  isHighlighted?: boolean;
}

interface ComparisonChartData {
  title: string;
  subtitle: string;
  badge: string;
  data: ChartDataItem[];
  formatValue?: (v: number) => string;
}

// Column label mappings for known columns
const COLUMN_LABELS: Record<string, string> = {
  'status': 'Status',
  'name': 'Name',
  'spend': 'Spend',
  'cpa': 'CPA',
  'lead-to-sale': 'Lead to Sale',
  'lead-to-quote': 'Lead to Quote',
  'quote-to-sale': 'Quote to Sale',
  'cpc': 'CPC',
  'daily limit': 'Daily Limit',
  'dailylimit': 'Daily Limit',
  'opportunities': 'Opportunities',
  'target rate': 'Target Rate',
  'targetrate': 'Target Rate',
  'bids': 'Bids',
  'bid rate': 'Bid Rate',
  'bidrate': 'Bid Rate',
  'impressions': 'Impressions',
  'clicks': 'Clicks',
  'leads': 'Leads',
  'calls': 'Calls',
  'quoted': 'Quoted',
  'sold': 'Sold',
  'sold cpa': 'Sold CPA',
  'soldcpa': 'Sold CPA',
  'sold rev': 'Sold Revenue',
  'soldrev': 'Sold Revenue',
  'sold cvr': 'Sold CVR',
  'soldcvr': 'Sold CVR',
  'quoted cpa': 'Quoted CPA',
  'quotedcpa': 'Quoted CPA',
  'quoted cvr': 'Quoted CVR',
  'quotedcvr': 'Quoted CVR',
  'ctr': 'CTR',
  'win rate': 'Win Rate',
  'winrate': 'Win Rate',
};

// Columns that should be formatted as currency
const CURRENCY_COLUMNS = ['spend', 'cpa', 'cpc', 'sold cpa', 'soldcpa', 'sold rev', 'soldrev', 'quoted cpa', 'quotedcpa'];

// Columns that should be formatted as percentages
const PERCENTAGE_COLUMNS = [
  'lead-to-sale', 'lead-to-quote', 'quote-to-sale',
  'target rate', 'targetrate', 'bid rate', 'bidrate',
  'sold cvr', 'soldcvr', 'quoted cvr', 'quotedcvr',
  'ctr', 'win rate', 'winrate'
];

// Helper to check if column is a currency column
const isCurrencyColumn = (columnName: string): boolean => {
  const normalized = columnName.toLowerCase().replace(/[-_\s]/g, '');
  const normalizedWithSpaces = columnName.toLowerCase().trim();
  return CURRENCY_COLUMNS.some(col =>
    col.replace(/[-_\s]/g, '') === normalized || col === normalizedWithSpaces
  ) || normalizedWithSpaces.includes('spend') || normalizedWithSpaces.includes('rev');
};

// Helper to check if column is a percentage column
const isPercentageColumn = (columnName: string): boolean => {
  const normalized = columnName.toLowerCase().replace(/[-_\s]/g, '');
  const normalizedWithSpaces = columnName.toLowerCase().trim();
  return PERCENTAGE_COLUMNS.some(col =>
    col.replace(/[-_\s]/g, '') === normalized || col === normalizedWithSpaces
  ) || normalizedWithSpaces.includes('rate') || normalizedWithSpaces.includes('cvr') || normalizedWithSpaces.includes('ctr');
};

// Helper to find the "source" or "vendor" column (first string column, or specific known names)
const findSourceColumn = (data: any[]): string | null => {
  if (data.length === 0) return null;
  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  // Look for "Name" column first (primary identifier in GOAL data)
  const nameCol = columns.find(col => col.toLowerCase() === 'name');
  if (nameCol) return nameCol;

  // Look for other common source column names
  const sourceNames = ['source', 'vendor', 'provider', 'company', 'lead_source', 'leadSource'];
  for (const name of sourceNames) {
    const found = columns.find(col => col.toLowerCase().replace(/[_\s]/g, '') === name.toLowerCase().replace(/[_\s]/g, ''));
    if (found) return found;
  }

  // Fall back to first string column
  for (const col of columns) {
    if (typeof firstRow[col] === 'string' && isNaN(parseFloat(firstRow[col]))) {
      return col;
    }
  }

  return columns[0];
};

// Helper to get numeric columns
const getNumericColumns = (data: any[]): string[] => {
  if (data.length === 0) return [];
  const firstRow = data[0];
  return Object.keys(firstRow).filter(key => typeof firstRow[key] === 'number');
};

// Helper to aggregate data by source
const aggregateBySource = (data: any[], sourceColumn: string): Record<string, Record<string, number>> => {
  const aggregated: Record<string, Record<string, number>> = {};
  const counts: Record<string, number> = {};

  for (const row of data) {
    const source = String(row[sourceColumn] || 'Unknown');
    if (!aggregated[source]) {
      aggregated[source] = {};
      counts[source] = 0;
    }
    counts[source]++;

    for (const [key, value] of Object.entries(row)) {
      if (key !== sourceColumn && typeof value === 'number') {
        aggregated[source][key] = (aggregated[source][key] || 0) + value;
      }
    }
  }

  // Calculate averages for rate/percentage columns (they should be averaged, not summed)
  for (const source of Object.keys(aggregated)) {
    for (const [key, value] of Object.entries(aggregated[source])) {
      if (isPercentageColumn(key)) {
        aggregated[source][key] = value / counts[source];
      }
    }
  }

  return aggregated;
};

// Helper to format column name for display
const formatColumnName = (name: string): string => {
  // Check for known column label first
  const normalizedName = name.toLowerCase().trim();
  if (COLUMN_LABELS[normalizedName]) {
    return COLUMN_LABELS[normalizedName];
  }

  // Also check without spaces/dashes
  const noSpaces = normalizedName.replace(/[-_\s]/g, '');
  if (COLUMN_LABELS[noSpaces]) {
    return COLUMN_LABELS[noSpaces];
  }

  // Fall back to generic formatting
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

// Helper to format values for display
const formatValue = (value: number, columnName: string): string => {
  // Check for known currency columns
  if (isCurrencyColumn(columnName)) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  }

  // Check for known percentage columns
  if (isPercentageColumn(columnName)) {
    return `${value.toFixed(2)}%`;
  }

  // Large numbers
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  // Integers
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }

  return value.toFixed(2);
};

// Identify "Goal" or primary source for highlighting
const findPrimarySource = (sources: string[]): string | null => {
  const goalPatterns = ['goal', 'our', 'us', 'primary', 'main'];
  for (const source of sources) {
    const lowerSource = source.toLowerCase();
    if (goalPatterns.some(pattern => lowerSource.includes(pattern))) {
      return source;
    }
  }
  return sources[0] || null;
};

// Calculate comparison badge
const calculateBadge = (primaryValue: number, otherValues: number[]): string => {
  if (otherValues.length === 0 || primaryValue === 0) return '';
  const avgOther = otherValues.reduce((a, b) => a + b, 0) / otherValues.length;
  if (avgOther === 0) return '';

  const ratio = primaryValue / avgOther;
  if (ratio >= 1) {
    return `${ratio.toFixed(1)}x better`;
  } else {
    return `${(1 / ratio).toFixed(1)}x behind`;
  }
};

const Dashboard = ({ objective, selectedKPIs, data }: DashboardProps) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { isExporting, exportPDF, exportPNG, exportBoth } = useExportPDF(dashboardRef);

  const getFilename = () => `goal-report-${new Date().toISOString().split('T')[0]}`;

  // Process the uploaded data
  const processedData = useMemo(() => {
    if (!data || data.length === 0 || data[0]?.demo) {
      // Return demo data if no real data
      return {
        isDemo: true,
        kpiCards: [
          { value: '$21.24', label: 'Cost Per Lead' },
          { value: '2.6%', label: 'Lead to Sale Rate' },
          { value: '24.31%', label: 'Lead to Quote Rate' },
          { value: '10.84%', label: 'Quote to Sale Rate' },
        ],
        summaryCards: [
          { value: '2.1x', label: 'Higher Contact Rate', variant: 'primary' as const },
          { value: '3.0x', label: 'Higher Quote Rate', variant: 'primary' as const },
          { value: '2.5x', label: 'Better Conversion', variant: 'primary' as const },
          { value: '52 vs 97', label: 'Sales (Us vs All 4)', variant: 'default' as const },
        ],
        comparisonCharts: [
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
            title: 'Lead to Sale',
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
        ],
        bottomLine: {
          metric: '2.6%',
          description: 'lead-to-sale conversion',
          comparison: '2.8x better',
          comparisonBase: 'the competitor average of 0.93%',
        },
      };
    }

    // Process real data
    const sourceColumn = findSourceColumn(data);
    const numericColumns = getNumericColumns(data);

    if (!sourceColumn || numericColumns.length === 0) {
      // If we can't find proper structure, show raw data summary
      const columns = Object.keys(data[0]);
      const kpiCards = columns.slice(0, 4).map(col => {
        const values = data.map(row => row[col]).filter(v => typeof v === 'number');
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = values.length > 0 ? sum / values.length : 0;
        return {
          value: formatValue(avg, col),
          label: formatColumnName(col),
        };
      });

      return {
        isDemo: false,
        kpiCards,
        summaryCards: [],
        comparisonCharts: [],
        bottomLine: null,
      };
    }

    const aggregated = aggregateBySource(data, sourceColumn);
    const sources = Object.keys(aggregated);
    const primarySource = findPrimarySource(sources);

    // Build KPI cards from primary source data
    const primaryData = primarySource ? aggregated[primarySource] : {};
    const kpiCards = numericColumns.slice(0, 4).map(col => ({
      value: formatValue(primaryData[col] || 0, col),
      label: formatColumnName(col),
    }));

    // Build comparison charts for each numeric column
    const comparisonCharts: ComparisonChartData[] = numericColumns.slice(0, 4).map(col => {
      const chartData: ChartDataItem[] = sources
        .map(source => ({
          name: source,
          value: aggregated[source][col] || 0,
          isHighlighted: source === primarySource,
        }))
        .sort((a, b) => b.value - a.value);

      const primaryValue = primarySource ? (aggregated[primarySource][col] || 0) : 0;
      const otherValues = sources
        .filter(s => s !== primarySource)
        .map(s => aggregated[s][col] || 0);

      return {
        title: formatColumnName(col),
        subtitle: `Comparison across sources`,
        badge: calculateBadge(primaryValue, otherValues),
        data: chartData,
      };
    });

    // Build summary cards
    const summaryCards = numericColumns.slice(0, 4).map(col => {
      const primaryValue = primarySource ? (aggregated[primarySource][col] || 0) : 0;
      const otherValues = sources
        .filter(s => s !== primarySource)
        .map(s => aggregated[s][col] || 0);
      const avgOther = otherValues.length > 0
        ? otherValues.reduce((a, b) => a + b, 0) / otherValues.length
        : 0;

      let ratio = avgOther > 0 ? primaryValue / avgOther : 0;
      const isBetter = ratio >= 1;
      if (!isBetter && ratio > 0) ratio = 1 / ratio;

      return {
        value: ratio > 0 ? `${ratio.toFixed(1)}x` : formatValue(primaryValue, col),
        label: formatColumnName(col),
        variant: (isBetter ? 'primary' : 'default') as 'primary' | 'default',
      };
    });

    // Calculate bottom line from first metric
    const firstMetric = numericColumns[0];
    const primaryValue = primarySource ? (aggregated[primarySource][firstMetric] || 0) : 0;
    const otherValues = sources
      .filter(s => s !== primarySource)
      .map(s => aggregated[s][firstMetric] || 0);
    const avgOther = otherValues.length > 0
      ? otherValues.reduce((a, b) => a + b, 0) / otherValues.length
      : 0;
    const ratio = avgOther > 0 ? primaryValue / avgOther : 0;

    return {
      isDemo: false,
      kpiCards,
      summaryCards,
      comparisonCharts,
      bottomLine: {
        metric: formatValue(primaryValue, firstMetric),
        description: formatColumnName(firstMetric).toLowerCase(),
        comparison: ratio > 0 ? `${ratio.toFixed(1)}x better` : '',
        comparisonBase: `the average of ${formatValue(avgOther, firstMetric)}`,
      },
    };
  }, [data]);

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
              {processedData.isDemo ? 'Demo Dashboard' : 'Data Analysis Complete'}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
              {objective || 'Performance Analysis'}
            </h1>

            <p className="text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {processedData.isDemo
                ? 'Sample data visualization'
                : `Analysis based on ${data.length} data points`}
            </p>
          </div>

          {/* Summary KPI Cards */}
          {processedData.summaryCards.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 bg-card rounded-2xl p-6 shadow-sm border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
              {processedData.summaryCards.map((card, index) => (
                <KPICard
                  key={card.label}
                  value={card.value}
                  label={card.label}
                  variant={card.variant}
                  delay={400 + index * 100}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        {processedData.kpiCards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {processedData.kpiCards.map((kpi, index) => (
              <KPICard
                key={kpi.label}
                value={kpi.value}
                label={kpi.label}
                variant="primary"
                delay={600 + index * 100}
              />
            ))}
          </div>
        )}

        {/* Comparison Charts */}
        {processedData.comparisonCharts.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {processedData.comparisonCharts.map((chart, index) => (
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
        )}

        {/* Bottom Line Summary */}
        {processedData.bottomLine && (
          <div className="chart-card flex flex-col md:flex-row items-center justify-between gap-6 opacity-0 animate-fade-in" style={{ animationDelay: '1400ms' }}>
            <div>
              <h3 className="text-xl font-semibold mb-2">The Bottom Line</h3>
              <p className="text-muted-foreground">
                {processedData.isDemo ? (
                  <>
                    Goal Leads delivers <span className="text-primary font-semibold">2.6% lead-to-sale conversion</span> —
                    that's <span className="text-goal-success font-semibold">2.8x better</span> than the competitor average of 0.93%
                  </>
                ) : (
                  <>
                    Primary source achieves <span className="text-primary font-semibold">{processedData.bottomLine.metric} {processedData.bottomLine.description}</span>
                    {processedData.bottomLine.comparison && (
                      <> — that's <span className="text-goal-success font-semibold">{processedData.bottomLine.comparison}</span> than {processedData.bottomLine.comparisonBase}</>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="flex-shrink-0 text-center kpi-card">
              <p className="text-3xl font-bold text-primary">{processedData.bottomLine.metric}</p>
              <p className="text-xs text-primary uppercase tracking-wide font-semibold mt-1">Top Performer</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Generated by GOAL Data Visualizer • Powered by your data</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
