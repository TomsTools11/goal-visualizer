import { useRef, useMemo } from 'react';
import GoalLogo from './GoalLogo';
import KPICard from './KPICard';
import ComparisonChart from './ComparisonChart';
import ExportButton from './ExportButton';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useExportPDF } from '@/hooks/useExportPDF';
import { CalculatedMetrics } from './KPISelector';

interface DashboardProps {
  objective: string;
  selectedColumns: string[];
  data: any[];
  calculatedMetrics: CalculatedMetrics | null;
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

// Helper to get display label for a column
const formatColumnName = (name: string): string => {
  const normalizedName = name.toLowerCase().trim();
  if (COLUMN_LABELS[normalizedName]) {
    return COLUMN_LABELS[normalizedName];
  }
  const noSpaces = normalizedName.replace(/[-_\s]/g, '');
  if (COLUMN_LABELS[noSpaces]) {
    return COLUMN_LABELS[noSpaces];
  }
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

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

// Helper to format values for display
const formatValue = (value: number, columnName: string): string => {
  if (isCurrencyColumn(columnName)) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  }

  if (isPercentageColumn(columnName)) {
    return `${value.toFixed(2)}%`;
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }

  return value.toFixed(2);
};

// Find the name/identifier column
const findNameColumn = (data: any[]): string | null => {
  if (data.length === 0) return null;
  const columns = Object.keys(data[0]);
  const nameCol = columns.find(col => col.toLowerCase() === 'name');
  if (nameCol) return nameCol;
  for (const col of columns) {
    if (typeof data[0][col] === 'string') return col;
  }
  return null;
};

const Dashboard = ({ objective, selectedColumns, data, calculatedMetrics }: DashboardProps) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { isExporting, exportPDF, exportPNG, exportBoth } = useExportPDF(dashboardRef);

  const getFilename = () => `goal-report-${new Date().toISOString().split('T')[0]}`;

  // Process the uploaded data
  const processedData = useMemo(() => {
    const isDemo = !data || data.length === 0 || data[0]?.demo;

    if (isDemo) {
      return {
        isDemo: true,
        primaryKPIs: [
          { value: '$21.24', label: 'CPA' },
          { value: '2.60%', label: 'Lead to Sale' },
          { value: '24.31%', label: 'Lead to Quote' },
          { value: '10.84%', label: 'Quote to Sale' },
        ],
        summaryStats: [
          { value: '$42.5K', label: 'Total Spend' },
          { value: '2,000', label: 'Total Leads' },
          { value: '486', label: 'Total Quoted' },
          { value: '52', label: 'Total Sold' },
        ],
        dataRows: [],
        charts: [],
      };
    }

    const nameColumn = findNameColumn(data);

    // Get numeric columns from selected columns
    const numericColumns = selectedColumns.filter(col => {
      const sampleValue = data[0]?.[col];
      return typeof sampleValue === 'number';
    });

    // Build primary KPI cards from calculated metrics
    const primaryKPIs: { value: string; label: string }[] = [];
    if (calculatedMetrics) {
      if (calculatedMetrics.cpa !== null) {
        primaryKPIs.push({ value: `$${calculatedMetrics.cpa.toFixed(2)}`, label: 'CPA' });
      }
      if (calculatedMetrics.leadToSale !== null) {
        primaryKPIs.push({ value: `${calculatedMetrics.leadToSale.toFixed(2)}%`, label: 'Lead to Sale' });
      }
      if (calculatedMetrics.leadToQuote !== null) {
        primaryKPIs.push({ value: `${calculatedMetrics.leadToQuote.toFixed(2)}%`, label: 'Lead to Quote' });
      }
      if (calculatedMetrics.quoteToSale !== null) {
        primaryKPIs.push({ value: `${calculatedMetrics.quoteToSale.toFixed(2)}%`, label: 'Quote to Sale' });
      }
    }

    // If no calculated metrics, use first 4 numeric columns
    if (primaryKPIs.length === 0) {
      numericColumns.slice(0, 4).forEach(col => {
        const values = data.map(row => row[col]).filter(v => typeof v === 'number');
        const total = values.reduce((a, b) => a + b, 0);
        const displayValue = isPercentageColumn(col) ? total / values.length : total;
        primaryKPIs.push({
          value: formatValue(displayValue, col),
          label: formatColumnName(col),
        });
      });
    }

    // Build summary stats from totals
    const summaryStats: { value: string; label: string }[] = [];
    if (calculatedMetrics) {
      if (calculatedMetrics.totalSpend !== null) {
        summaryStats.push({ value: formatValue(calculatedMetrics.totalSpend, 'spend'), label: 'Total Spend' });
      }
      if (calculatedMetrics.totalLeads !== null) {
        summaryStats.push({ value: calculatedMetrics.totalLeads.toLocaleString(), label: 'Total Leads' });
      }
      if (calculatedMetrics.totalQuoted !== null) {
        summaryStats.push({ value: calculatedMetrics.totalQuoted.toLocaleString(), label: 'Total Quoted' });
      }
      if (calculatedMetrics.totalSold !== null) {
        summaryStats.push({ value: calculatedMetrics.totalSold.toLocaleString(), label: 'Total Sold' });
      }
    }

    // Build data rows for display
    const dataRows = data.map(row => {
      const name = nameColumn ? String(row[nameColumn]) : `Row`;
      const values: Record<string, string> = {};

      selectedColumns.forEach(col => {
        const rawValue = row[col];
        if (typeof rawValue === 'number') {
          values[formatColumnName(col)] = formatValue(rawValue, col);
        } else if (rawValue !== null && rawValue !== undefined) {
          values[formatColumnName(col)] = String(rawValue);
        }
      });

      return { name, values };
    });

    // Build bar charts for numeric columns (2x2 grid)
    const charts = numericColumns.slice(0, 4).map(col => {
      const chartData = data.map(row => ({
        name: nameColumn ? String(row[nameColumn]) : 'Data',
        value: typeof row[col] === 'number' ? row[col] : 0,
      })).sort((a, b) => b.value - a.value);

      return {
        title: formatColumnName(col),
        data: chartData,
        formatValue: isPercentageColumn(col)
          ? (v: number) => `${v.toFixed(2)}%`
          : isCurrencyColumn(col)
            ? (v: number) => `$${v.toFixed(2)}`
            : undefined,
      };
    });

    return {
      isDemo: false,
      primaryKPIs,
      summaryStats,
      dataRows,
      charts,
    };
  }, [data, selectedColumns, calculatedMetrics]);

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0074E5]/10 text-[#0074E5] text-sm font-medium mb-4 opacity-0 animate-fade-in">
              <BarChart3 className="w-4 h-4" />
              {processedData.isDemo ? 'Demo Dashboard' : 'KPI Dashboard'}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
              {objective || 'Performance Dashboard'}
            </h1>

            <p className="text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {processedData.isDemo
                ? 'Sample data visualization'
                : `Analyzing ${data.length} data points`}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - KPI Dashboard Layout */}
      <main className="container mx-auto px-6 py-8">
        {/* Top Row: 4 Large KPI Cards (Primary Metrics) */}
        {processedData.primaryKPIs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {processedData.primaryKPIs.map((kpi, index) => (
              <div
                key={kpi.label}
                className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 text-center opacity-0 animate-fade-in"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <p className="text-3xl md:text-4xl font-bold text-[#0074E5] mb-2">{kpi.value}</p>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats Row */}
        {processedData.summaryStats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {processedData.summaryStats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-muted/30 rounded-xl p-4 text-center opacity-0 animate-fade-in"
                style={{ animationDelay: `${500 + index * 100}ms` }}
              >
                <p className="text-xl font-semibold text-foreground mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Middle: 2x2 Grid of Horizontal Bar Charts */}
        {processedData.charts.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {processedData.charts.map((chart, index) => (
              <ComparisonChart
                key={chart.title}
                title={chart.title}
                data={chart.data}
                formatValue={chart.formatValue}
                delay={700 + index * 150}
              />
            ))}
          </div>
        )}

        {/* Bottom: Summary Callout */}
        {(calculatedMetrics || processedData.isDemo) && (
          <div
            className="bg-gradient-to-r from-[#0074E5]/5 to-[#0074E5]/10 border border-[#0074E5]/20 rounded-2xl p-6 md:p-8 opacity-0 animate-fade-in"
            style={{ animationDelay: '1200ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0074E5]/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-[#0074E5]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Performance Summary</h3>
                <p className="text-muted-foreground">
                  {processedData.isDemo ? (
                    <>
                      With a <span className="text-[#0074E5] font-semibold">$21.24 CPA</span> and{' '}
                      <span className="text-[#0074E5] font-semibold">2.6% lead-to-sale conversion</span>,
                      this campaign demonstrates strong acquisition efficiency.
                      Out of {calculatedMetrics?.totalLeads?.toLocaleString() || '2,000'} leads,{' '}
                      {calculatedMetrics?.totalSold || 52} converted to sales.
                    </>
                  ) : calculatedMetrics ? (
                    <>
                      {calculatedMetrics.cpa !== null && (
                        <>Achieving a <span className="text-[#0074E5] font-semibold">${calculatedMetrics.cpa.toFixed(2)} CPA</span>. </>
                      )}
                      {calculatedMetrics.leadToSale !== null && (
                        <>Lead-to-sale conversion rate: <span className="text-[#0074E5] font-semibold">{calculatedMetrics.leadToSale.toFixed(2)}%</span>. </>
                      )}
                      {calculatedMetrics.totalLeads !== null && calculatedMetrics.totalSold !== null && (
                        <>From {calculatedMetrics.totalLeads.toLocaleString()} leads, {calculatedMetrics.totalSold.toLocaleString()} converted to sales.</>
                      )}
                    </>
                  ) : (
                    <>Data analysis complete. Review the metrics above for detailed insights.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        {processedData.dataRows.length > 0 && !processedData.isDemo && (
          <div className="chart-card overflow-hidden mt-8 opacity-0 animate-fade-in" style={{ animationDelay: '1400ms' }}>
            <h3 className="text-lg font-semibold mb-4">Detailed Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                    {selectedColumns.slice(0, 8).map(col => (
                      <th key={col} className="text-right py-3 px-4 font-semibold text-muted-foreground">
                        {formatColumnName(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedData.dataRows.map((row, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{row.name}</td>
                      {selectedColumns.slice(0, 8).map(col => (
                        <td key={col} className="text-right py-3 px-4">
                          {row.values[formatColumnName(col)] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Generated by GOAL Data Visualizer</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
