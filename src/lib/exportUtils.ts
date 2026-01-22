import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  format?: 'pdf' | 'png' | 'both';
  quality?: number;
  paperSize?: 'a4' | 'letter';
}

export interface ExportResult {
  success: boolean;
  error?: string;
}

function prepareForExport(element: HTMLElement): () => void {
  const originalStyles: Map<HTMLElement, string> = new Map();

  // Force all animated elements to their final state
  const animatedElements = element.querySelectorAll('[class*="animate-"]');
  animatedElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    originalStyles.set(htmlEl, htmlEl.style.cssText);
    htmlEl.style.opacity = '1';
    htmlEl.style.transform = 'translateY(0) translateX(0)';
    htmlEl.style.animation = 'none';
  });

  // Ensure opacity-0 elements are visible
  const hiddenElements = element.querySelectorAll('[class*="opacity-0"]');
  hiddenElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (!originalStyles.has(htmlEl)) {
      originalStyles.set(htmlEl, htmlEl.style.cssText);
    }
    htmlEl.style.opacity = '1';
  });

  return () => {
    originalStyles.forEach((originalStyle, el) => {
      el.style.cssText = originalStyle;
    });
  };
}

function createPDF(canvas: HTMLCanvasElement, paperSize: 'a4' | 'letter'): jsPDF {
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const paperDimensions = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
  };

  const paper = paperDimensions[paperSize];
  const imgWidth = paper.width;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: paperSize,
  });

  let heightLeft = imgHeight;
  let position = 0;
  const pageHeight = paper.height;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf;
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportDashboard(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<ExportResult> {
  const {
    filename = 'goal-performance-report',
    format = 'pdf',
    quality = 2,
    paperSize = 'a4',
  } = options;

  try {
    const cleanup = prepareForExport(element);

    // Wait for fonts and styles to be ready
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f8fafc',
      logging: false,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        // Hide export button in cloned document
        const exportButton = clonedDoc.querySelector('[data-export-button]');
        if (exportButton) {
          (exportButton as HTMLElement).style.display = 'none';
        }

        // Ensure all animated elements are visible in clone
        const animatedElements = clonedDoc.querySelectorAll('[class*="animate-"], [class*="opacity-0"]');
        animatedElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.opacity = '1';
          htmlEl.style.transform = 'translateY(0) translateX(0)';
          htmlEl.style.animation = 'none';
        });

        // Remove min-h-screen that could cause extra whitespace
        const container = clonedDoc.querySelector('[data-export-container]');
        if (container) {
          (container as HTMLElement).style.minHeight = 'auto';
        }
      },
    });

    cleanup();

    if (format === 'png' || format === 'both') {
      const pngUrl = canvas.toDataURL('image/png');
      downloadDataUrl(pngUrl, `${filename}.png`);
    }

    if (format === 'pdf' || format === 'both') {
      const pdf = createPDF(canvas, paperSize);
      pdf.save(`${filename}.pdf`);
    }

    return { success: true };
  } catch (error) {
    console.error('Export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}
