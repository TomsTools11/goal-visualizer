import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Target, TrendingUp } from 'lucide-react';

interface KPISelectorProps {
  columns: string[];
  onComplete: (objective: string, selectedKPIs: string[]) => void;
}

const DEFAULT_KPIS = [
  { id: 'cpa', label: 'CPA (Cost Per Acquisition)', description: 'Track acquisition costs' },
  { id: 'lead_to_sale', label: 'Lead-to-Sale Conversion Rate', description: 'Overall conversion efficiency' },
  { id: 'lead_to_quote', label: 'Lead-to-Quote Conversion Rate', description: 'Quote generation rate' },
  { id: 'quote_to_sale', label: 'Quote-to-Sale Conversion Rate', description: 'Quote closing rate' },
];

const KPISelector = ({ columns, onComplete }: KPISelectorProps) => {
  const [objective, setObjective] = useState('');
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(DEFAULT_KPIS.map(k => k.id));
  const [step, setStep] = useState(1);

  const handleKPIToggle = (kpiId: string) => {
    setSelectedKPIs(prev => 
      prev.includes(kpiId)
        ? prev.filter(id => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  const handleComplete = () => {
    onComplete(objective || 'Performance Analysis', selectedKPIs);
  };

  return (
    <div className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 max-w-2xl mx-auto animate-fade-in">
      {step === 1 ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Define Your Objective</h2>
              <p className="text-sm text-muted-foreground">What's the goal of this report?</p>
            </div>
          </div>

          <Input
            placeholder="e.g., Monthly Performance Review, Competitor Analysis..."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="h-12 text-base"
          />

          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Detected columns:</strong>{' '}
              {columns.slice(0, 5).join(', ')}
              {columns.length > 5 && ` and ${columns.length - 5} more`}
            </p>
          </div>

          <Button onClick={() => setStep(2)} className="w-full h-12 text-base">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Select KPIs to Highlight</h2>
              <p className="text-sm text-muted-foreground">Choose the metrics for your dashboard</p>
            </div>
          </div>

          <div className="space-y-3">
            {DEFAULT_KPIS.map((kpi) => (
              <label
                key={kpi.id}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedKPIs.includes(kpi.id)
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Checkbox
                  checked={selectedKPIs.includes(kpi.id)}
                  onCheckedChange={() => handleKPIToggle(kpi.id)}
                />
                <div className="flex-1">
                  <p className="font-medium">{kpi.label}</p>
                  <p className="text-sm text-muted-foreground">{kpi.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
              Back
            </Button>
            <Button 
              onClick={handleComplete} 
              disabled={selectedKPIs.length === 0}
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
