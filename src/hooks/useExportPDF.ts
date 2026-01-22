import { useState, useCallback, RefObject } from 'react';
import { exportDashboard, ExportOptions, ExportResult } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface UseExportPDFReturn {
  isExporting: boolean;
  exportPDF: (options?: ExportOptions) => Promise<ExportResult>;
  exportPNG: (options?: ExportOptions) => Promise<ExportResult>;
  exportBoth: (options?: ExportOptions) => Promise<ExportResult>;
}

export function useExportPDF(
  containerRef: RefObject<HTMLElement | null>
): UseExportPDFReturn {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const doExport = useCallback(
    async (options: ExportOptions = {}): Promise<ExportResult> => {
      if (!containerRef.current) {
        return { success: false, error: 'Export container not found' };
      }

      setIsExporting(true);

      try {
        const result = await exportDashboard(containerRef.current, options);

        if (result.success) {
          toast({
            title: 'Export Complete',
            description: `Your report has been downloaded as ${options.format === 'both' ? 'PDF and PNG' : options.format?.toUpperCase() || 'PDF'}.`,
          });
        } else {
          toast({
            title: 'Export Failed',
            description: result.error || 'An error occurred during export.',
            variant: 'destructive',
          });
        }

        return result;
      } finally {
        setIsExporting(false);
      }
    },
    [containerRef, toast]
  );

  const exportPDF = useCallback(
    (options?: ExportOptions) => doExport({ ...options, format: 'pdf' }),
    [doExport]
  );

  const exportPNG = useCallback(
    (options?: ExportOptions) => doExport({ ...options, format: 'png' }),
    [doExport]
  );

  const exportBoth = useCallback(
    (options?: ExportOptions) => doExport({ ...options, format: 'both' }),
    [doExport]
  );

  return {
    isExporting,
    exportPDF,
    exportPNG,
    exportBoth,
  };
}
