import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Target, BarChart3, Check } from 'lucide-react';

interface KPISelectorProps {
  columns: string[];
  data: any[];
  onComplete: (objective: string, selectedColumns: string[]) => void;
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

// Get display label for a column
const getColumnLabel = (column: string): string => {
  const normalized = column.toLowerCase().trim();
  if (COLUMN_LABELS[normalized]) {
    return COLUMN_LABELS[normalized];
  }
  const noSpaces = normalized.replace(/[-_\s]/g, '');
  if (COLUMN_LABELS[noSpaces]) {
    return COLUMN_LABELS[noSpaces];
  }
  // Fall back to title case
  return column
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Detect column type from data
const detectColumnType = (data: any[], column: string): 'numeric' | 'text' | 'mixed' => {
  const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');
  if (values.length === 0) return 'text';

  const numericCount = values.filter(v => typeof v === 'number').length;
  if (numericCount === values.length) return 'numeric';
  if (numericCount === 0) return 'text';
  return 'mixed';
};

// Get sample value for preview
const getSampleValue = (data: any[], column: string): string => {
  const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');
  if (values.length === 0) return 'No data';

  // For numeric columns, show a sample value
  if (typeof values[0] === 'number') {
    return values[0].toLocaleString();
  }
  return String(values[0]);
};

const KPISelector = ({ columns, data, onComplete }: KPISelectorProps) => {
  const [objective, setObjective] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  // Analyze columns
  const columnInfo = useMemo(() => {
    return columns.map(col => ({
      name: col,
      label: getColumnLabel(col),
      type: detectColumnType(data, col),
      sample: getSampleValue(data, col),
    }));
  }, [columns, data]);

  // Separate numeric and text columns
  const numericColumns = columnInfo.filter(c => c.type === 'numeric');
  const textColumns = columnInfo.filter(c => c.type === 'text' || c.type === 'mixed');

  const handleColumnToggle = (columnName: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnName)
        ? prev.filter(c => c !== columnName)
        : [...prev, columnName]
    );
  };

  const handleSelectAll = (columnList: typeof columnInfo) => {
    const allNames = columnList.map(c => c.name);
    const allSelected = allNames.every(name => selectedColumns.includes(name));

    if (allSelected) {
      setSelectedColumns(prev => prev.filter(c => !allNames.includes(c)));
    } else {
      setSelectedColumns(prev => [...new Set([...prev, ...allNames])]);
    }
  };

  const handleComplete = () => {
    onComplete(objective || 'Data Visualization', selectedColumns);
  };

  return (
    <div className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 max-w-3xl mx-auto animate-fade-in">
      {step === 1 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Define Your Report Title</h2>
              <p className="text-sm text-muted-foreground">Give your visualization a title</p>
            </div>
          </div>

          <Input
            placeholder="e.g., Monthly Performance Report, Q4 Results..."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="h-12 text-base"
          />

          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Detected {columns.length} columns</strong> from your uploaded data
              <br />
              <span className="text-xs">
                {numericColumns.length} numeric, {textColumns.length} text
              </span>
            </p>
          </div>

          <Button onClick={() => setStep(2)} className="w-full h-12 text-base">
            Select Columns to Display
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Select Columns to Visualize</h2>
              <p className="text-sm text-muted-foreground">Choose which data to include in your dashboard</p>
            </div>
          </div>

          {/* Numeric Columns */}
          {numericColumns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Numeric Columns ({numericColumns.length})
                </h3>
                <button
                  onClick={() => handleSelectAll(numericColumns)}
                  className="text-xs text-primary hover:underline"
                >
                  {numericColumns.every(c => selectedColumns.includes(c.name)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {numericColumns.map((col) => (
                  <label
                    key={col.name}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedColumns.includes(col.name)
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedColumns.includes(col.name)}
                      onCheckedChange={() => handleColumnToggle(col.name)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{col.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Sample: {col.sample}
                      </p>
                    </div>
                    {selectedColumns.includes(col.name) && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Text Columns */}
          {textColumns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Text/Category Columns ({textColumns.length})
                </h3>
                <button
                  onClick={() => handleSelectAll(textColumns)}
                  className="text-xs text-primary hover:underline"
                >
                  {textColumns.every(c => selectedColumns.includes(c.name)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {textColumns.map((col) => (
                  <label
                    key={col.name}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedColumns.includes(col.name)
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedColumns.includes(col.name)}
                      onCheckedChange={() => handleColumnToggle(col.name)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{col.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Sample: {col.sample}
                      </p>
                    </div>
                    {selectedColumns.includes(col.name) && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Selection summary */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm">
              <strong className="text-foreground">{selectedColumns.length} columns selected</strong>
              {selectedColumns.length > 0 && (
                <span className="text-muted-foreground">
                  : {selectedColumns.slice(0, 3).map(c => getColumnLabel(c)).join(', ')}
                  {selectedColumns.length > 3 && ` +${selectedColumns.length - 3} more`}
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
              Back
            </Button>
            <Button
              onClick={handleComplete}
              disabled={selectedColumns.length === 0}
              className="flex-1 h-12 text-base"
            >
              Generate Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPISelector;
