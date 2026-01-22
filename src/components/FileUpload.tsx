import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (data: any[], fileName: string) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string | number> = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to parse as number
        const numValue = parseFloat(value.replace(/[$%,]/g, ''));
        row[header] = isNaN(numValue) ? value : numValue;
      });
      
      return row;
    });
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          setError('No data found in CSV file');
          return;
        }

        setUploadedFile(file.name);
        onFileUpload(data, file.name);
      } catch (err) {
        setError('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  if (uploadedFile) {
    return (
      <div className="upload-zone flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{uploadedFile}</p>
            <p className="text-sm text-muted-foreground">File uploaded successfully</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={clearFile}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`upload-zone cursor-pointer ${isDragging ? 'upload-zone-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleInputChange}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <p className="text-lg font-semibold text-foreground">
            Drop your CSV file here
          </p>
          <p className="text-muted-foreground mt-1">
            or click to browse files
          </p>
        </div>

        {error && (
          <p className="text-destructive text-sm font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
