import { useRef, useMemo } from 'react';
import GoalLogo from './GoalLogo';
import KPICard from './KPICard';
import ComparisonChart from './ComparisonChart';
import ExportButton from './ExportButton';
import { BarChart3 } from 'lucide-react';
import { useExportPDF } from '@/hooks/useExportPDF';

interface DashboardProps {
  objective: string;
  selectedColumns: string[];
  data: any[];
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
  // Fall back to first string column
  for (const col of columns) {
    if (typeof data[0][col] === 'string') return col;
  }
  return null;
};

const Dashboard = ({ objective, selectedColumns, data }: DashboardProps) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { isExporting, exportPDF, exportPNG, exportBoth } = useExportPDF(dashboardRef);

  const getFilename = () => `goal-report-${new Date().toISOString().split('T')[0]}`;

  // Process the uploaded data
  const processedData = useMemo(() => {
    const isDemo = !data || data.length === 0 || data[0]?.demo;

    if (isDemo) {
      return {
        isDemo: true,
        summaryCards: [
          { value: '$21.24', label: 'CPA' },
          { value: '2.6%', label: 'Lead to Sale' },
          { value: '24.31%', label: 'Lead to Quote' },
          { value: '10.84%', label: 'Quote to Sale' },
        ],
        dataRows: [
          { name: 'Goal Leads', values: { 'CPA': '$21.24', 'Lead to Sale': '2.6%', 'Lead to Quote': '24.31%', 'Quote to Sale': '10.84%' } },
          { name: 'QuoteWizard', values: { 'CPA': '$35.50', 'Lead to Sale': '0.4%', 'Lead to Quote': '6.1%', 'Quote to Sale': '6.56%' } },
          { name: 'QuoteNerds', values: { 'CPA': '$28.00', 'Lead to Sale': '1.4%', 'Lead to Quote': '6.5%', 'Quote to Sale': '21.54%' } },
        ],
        charts: [],
      };
    }

    const nameColumn = findNameColumn(data);

    // Get numeric columns from selected columns
    const numericColumns = selectedColumns.filter(col => {
      const sampleValue = data[0]?.[col];
      return typeof sampleValue === 'number';
    });

    // Calculate totals/averages for summary cards (show first 4 numeric columns)
    const summaryCards = numericColumns.slice(0, 4).map(col => {
      const values = data.map(row => row[col]).filter(v => typeof v === 'number');
      const total = values.reduce((a, b) => a + b, 0);

      // For rates/percentages, show average; for counts/currency, show total
      const displayValue = isPercentageColumn(col)
        ? total / values.length
        : total;

      return {
        value: formatValue(displayValue, col),
        label: formatColumnName(col),
      };
    });

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

    // Build bar charts for numeric columns (one chart per column showing all rows)
    const charts = numericColumns.slice(0, 6).map(col => {
      const chartData = data.map(row => ({
        name: nameColumn ? String(row[nameColumn]) : 'Data',
        value: typeof row[col] === 'number' ? row[col] : 0,
      })).sort((a, b) => b.value - a.value);

      return {
        title: formatColumnName(col),
        subtitle: `Values by ${nameColumn ? formatColumnName(nameColumn) : 'row'}`,
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
      summaryCards,
      dataRows,
      charts,
    };
  }, [data, selectedColumns]);

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
              <BarChart3 className="w-4 h-4" />
              {processedData.isDemo ? 'Demo Dashboard' : 'Data Visualization'}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
              {objective || 'Data Visualization'}
            </h1>

            <p className="text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
              {processedData.isDemo
                ? 'Sample data visualization'
                : `Showing ${data.length} rows, ${selectedColumns.length} columns`}
            </p>
          </div>

          {/* Summary KPI Cards - showing actual totals/averages */}
          {processedData.summaryCards.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 bg-card rounded-2xl p-6 shadow-sm border border-border/50 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
              {processedData.summaryCards.map((card, index) => (
                <KPICard
                  key={card.label}
                  value={card.value}
                  label={card.label}
                  variant="primary"
                  delay={400 + index * 100}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Data Charts */}
        {processedData.charts.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {processedData.charts.map((chart, index) => (
              <ComparisonChart
                key={chart.title}
                title={chart.title}
                subtitle={chart.subtitle}
                data={chart.data}
                formatValue={chart.formatValue}
                delay={600 + index * 150}
              />
            ))}
          </div>
        )}

        {/* Data Table */}
        {processedData.dataRows.length > 0 && !processedData.isDemo && (
          <div className="chart-card overflow-hidden opacity-0 animate-fade-in" style={{ animationDelay: '1200ms' }}>
            <h3 className="text-lg font-semibold mb-4">Data Details</h3>
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
          <p>Generated by GOAL Data Visualizer • Powered by your data</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
