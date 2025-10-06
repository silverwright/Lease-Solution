import React, { useEffect } from 'react';
import { useLeaseContext } from '../../context/LeaseContext';
import { Button } from '../UI/Button';
import { Download, FileText, Eye, ArrowLeft } from 'lucide-react';
import { generateContractHTML } from '../../utils/contractGenerator';
import { useRef } from 'react';
import jsPDF from 'jspdf';

export function ContractPreview() {
  const { state, dispatch } = useLeaseContext();
  const { leaseData, mode, contractHtml } = state;

  useEffect(() => {
    // Generate contract HTML when component mounts
    if (leaseData.ContractID) {
      const html = generateContractHTML(leaseData, mode);
      dispatch({ type: 'SET_CONTRACT_HTML', payload: html });
    }
  }, [leaseData, mode, dispatch]);

  const downloadContract = () => {
    if (!contractHtml) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contractHtml;

    // Helper to check if we need a new page
    const checkPageBreak = (increment: number) => {
      if (yPosition + increment > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Process all elements
    const processElement = (element: Element) => {
      const tagName = element.tagName.toLowerCase();
      const text = element.textContent?.trim() || '';

      if (!text) return;

      switch (tagName) {
        case 'h1':
          checkPageBreak(15);
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(text, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 12;
          break;

        case 'h2':
          checkPageBreak(12);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          const lines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 7 + 4;
          break;

        case 'h4':
        case 'h5':
          checkPageBreak(10);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(text, margin, yPosition);
          yPosition += 8;
          break;

        case 'p':
          checkPageBreak(10);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const pLines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(pLines, margin, yPosition);
          yPosition += pLines.length * 5 + 3;
          break;

        case 'table':
          checkPageBreak(20);
          pdf.setFontSize(9);
          const rows = Array.from(element.querySelectorAll('tr'));
          rows.forEach((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length === 2) {
              checkPageBreak(10);
              const label = cells[0].textContent?.trim() || '';
              const value = cells[1].textContent?.trim() || '';

              pdf.setFont('helvetica', 'bold');
              pdf.text(label, margin, yPosition);

              pdf.setFont('helvetica', 'normal');
              const valueLines = pdf.splitTextToSize(value, maxWidth - 50);
              pdf.text(valueLines, margin + 50, yPosition);

              yPosition += Math.max(valueLines.length * 4.5, 6);
            }
          });
          yPosition += 5;
          break;

        case 'li':
          checkPageBreak(8);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const liLines = pdf.splitTextToSize('• ' + text, maxWidth - 5);
          pdf.text(liLines, margin + 5, yPosition);
          yPosition += liLines.length * 5 + 2;
          break;

        case 'div':
          // Process child elements
          Array.from(element.children).forEach(child => processElement(child));
          break;
      }
    };

    // Process all children
    Array.from(tempDiv.children).forEach(child => processElement(child));

    // Save the PDF
    pdf.save(`LeaseContract_${mode.toLowerCase()}_${leaseData.ContractID}.pdf`);
  };

  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Contract Preview</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadContract}
            disabled={!contractHtml}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Contract Summary */}
      <div className="bg-slate-50 rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-slate-900">Contract Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Contract ID:</span>
            <span className="ml-2 font-medium">{leaseData.ContractID || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600">Mode:</span>
            <span className="ml-2 font-medium">{mode}</span>
          </div>
          <div>
            <span className="text-slate-600">Asset:</span>
            <span className="ml-2 font-medium">{leaseData.AssetDescription || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600">Term:</span>
            <span className="ml-2 font-medium">{leaseData.NonCancellableYears || 0} years</span>
          </div>
          <div>
            <span className="text-slate-600">Payment:</span>
            <span className="ml-2 font-medium">
              {leaseData.Currency} {(leaseData.FixedPaymentPerPeriod || 0).toLocaleString()} / {leaseData.PaymentFrequency}
            </span>
          </div>
          <div>
            <span className="text-slate-600">IBR:</span>
            <span className="ml-2 font-medium">{((leaseData.IBR_Annual || 0) * 100).toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Contract Preview */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Contract Preview</span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {contractHtml ? (
            <div 
              className="p-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: contractHtml }}
            />
          ) : (
            <div className="p-6 text-center text-slate-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>Complete the form to generate contract preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}