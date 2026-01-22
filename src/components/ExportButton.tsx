import { Download, FileImage, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  isExporting: boolean;
  onExportPDF: () => void;
  onExportPNG: () => void;
  onExportBoth: () => void;
}

const ExportButton = ({
  isExporting,
  onExportPDF,
  onExportPNG,
  onExportBoth,
}: ExportButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPNG}>
          <FileImage className="w-4 h-4 mr-2" />
          Download as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportBoth}>
          <Download className="w-4 h-4 mr-2" />
          Download Both
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
