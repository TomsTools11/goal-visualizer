import { useState } from 'react';
import GoalLogo from '@/components/GoalLogo';
import FileUpload from '@/components/FileUpload';
import KPISelector, { CalculatedMetrics } from '@/components/KPISelector';
import Dashboard from '@/components/Dashboard';

type AppState = 'upload' | 'configure' | 'dashboard';

const Index = () => {
  const [state, setState] = useState<AppState>('upload');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [objective, setObjective] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics | null>(null);

  const handleFileUpload = (data: any[], name: string) => {
    setCsvData(data);
    setFileName(name);
    setState('configure');
  };

  const handleColumnSelection = (obj: string, columns: string[], metrics: CalculatedMetrics | null) => {
    setObjective(obj);
    setSelectedColumns(columns);
    setCalculatedMetrics(metrics);
    setState('dashboard');
  };

  const handleReset = () => {
    setState('upload');
    setCsvData([]);
    setFileName('');
    setObjective('');
    setSelectedColumns([]);
    setCalculatedMetrics(null);
  };

  if (state === 'dashboard') {
    return (
      <div>
        <Dashboard
          objective={objective}
          selectedColumns={selectedColumns}
          data={csvData}
          calculatedMetrics={calculatedMetrics}
        />
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-card border border-border rounded-lg shadow-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const columns = csvData.length > 0 ? Object.keys(csvData[0]) : [];

  const handleDemoMode = () => {
    setCsvData([{ demo: true }]);
    setObjective('Sample Dashboard');
    setSelectedColumns(['cpa', 'lead_to_sale', 'lead_to_quote', 'quote_to_sale']);
    setCalculatedMetrics({
      cpa: 21.24,
      leadToSale: 2.6,
      leadToQuote: 24.31,
      quoteToSale: 10.84,
      totalSpend: 42480,
      totalLeads: 2000,
      totalQuoted: 486,
      totalSold: 52,
    });
    setState('dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-6 py-4">
          <GoalLogo className="h-10 w-auto" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Data Visualizer
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform your client data into presentation-ready insights
            </p>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className={`flex items-center gap-2 ${state === 'upload' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                state === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                1
              </div>
              <span className="font-medium hidden sm:inline">Upload</span>
            </div>

            <div className="w-12 h-px bg-border" />

            <div className={`flex items-center gap-2 ${state === 'configure' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                state === 'configure' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                2
              </div>
              <span className="font-medium hidden sm:inline">Configure</span>
            </div>

            <div className="w-12 h-px bg-border" />

            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="font-medium hidden sm:inline">Visualize</span>
            </div>
          </div>

          {/* Content */}
          {state === 'upload' && (
            <div className="space-y-6">
              <FileUpload onFileUpload={handleFileUpload} />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Or try the demo</p>
                <button
                  onClick={handleDemoMode}
                  className="text-primary font-medium hover:underline"
                >
                  View sample dashboard →
                </button>
              </div>
            </div>
          )}

          {state === 'configure' && (
            <KPISelector columns={columns} data={csvData} onComplete={handleColumnSelection} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card/80 backdrop-blur-sm py-4">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>GOAL Data Visualizer • On-brand insights, every time</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
