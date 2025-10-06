import React, { useRef, useState } from 'react';
import { useLeaseContext, SavedContract } from '../../context/LeaseContext';
import { Button } from '../UI/Button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelBulkUploadProps {
  onUploadComplete: () => void;
}

export function ExcelBulkUpload({ onUploadComplete }: ExcelBulkUploadProps) {
  const { dispatch } = useLeaseContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMode, setSelectedMode] = useState<'MINIMAL' | 'FULL'>('MINIMAL');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const mapExcelRowToLeaseData = (row: any) => {
    const mapping: { [key: string]: string } = {
      'Contract ID': 'ContractID',
      'ContractID': 'ContractID',
      'Lessee Entity': 'LesseeEntity',
      'LesseeEntity': 'LesseeEntity',
      'Lessor Name': 'LessorName',
      'LessorName': 'LessorName',
      'Asset Description': 'AssetDescription',
      'AssetDescription': 'AssetDescription',
      'Asset Class': 'AssetClass',
      'AssetClass': 'AssetClass',
      'Contract Date': 'ContractDate',
      'ContractDate': 'ContractDate',
      'Commencement Date': 'CommencementDate',
      'CommencementDate': 'CommencementDate',
      'End Date': 'EndDateOriginal',
      'EndDateOriginal': 'EndDateOriginal',
      'Non-cancellable Years': 'NonCancellableYears',
      'NonCancellableYears': 'NonCancellableYears',
      'Fixed Payment': 'FixedPaymentPerPeriod',
      'FixedPaymentPerPeriod': 'FixedPaymentPerPeriod',
      'Payment Frequency': 'PaymentFrequency',
      'PaymentFrequency': 'PaymentFrequency',
      'Payment Timing': 'PaymentTiming',
      'PaymentTiming': 'PaymentTiming',
      'Currency': 'Currency',
      'IBR Annual': 'IBR_Annual',
      'IBR_Annual': 'IBR_Annual',
      'Useful Life Years': 'UsefulLifeYears',
      'UsefulLifeYears': 'UsefulLifeYears',
    };

    const leaseData: any = {};
    Object.keys(row).forEach(excelKey => {
      const leaseKey = mapping[excelKey];
      if (leaseKey && row[excelKey] !== undefined && row[excelKey] !== null && row[excelKey] !== '') {
        let value = row[excelKey];

        if (['NonCancellableYears', 'FixedPaymentPerPeriod', 'IBR_Annual', 'UsefulLifeYears'].includes(leaseKey)) {
          value = parseFloat(value);
          if (leaseKey === 'IBR_Annual' && value > 1) {
            value = value / 100;
          }
        }

        if (['ContractDate', 'CommencementDate', 'EndDateOriginal'].includes(leaseKey)) {
          if (typeof value === 'number') {
            const date = XLSX.SSF.parse_date_code(value);
            value = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
          } else if (value instanceof Date) {
            value = value.toISOString().split('T')[0];
          }
        }

        leaseData[leaseKey] = value;
      }
    });

    return leaseData;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      setUploadStatus('error');
      setErrorMessage('Please select an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('No data found in the file');
      }

      const contracts: SavedContract[] = [];
      jsonData.forEach((row: any, index: number) => {
        const leaseData = mapExcelRowToLeaseData(row);

        if (!leaseData.ContractID) {
          console.warn(`Row ${index + 1}: Skipping - missing Contract ID`);
          return;
        }

        const rowMode = row.Mode || row.mode;
        const mode = rowMode ? (rowMode.toUpperCase() === 'FULL' ? 'FULL' : 'MINIMAL') : selectedMode;

        const contract: SavedContract = {
          id: Date.now().toString() + '-' + index,
          contractId: leaseData.ContractID,
          lessorName: leaseData.LessorName || '',
          lesseeName: leaseData.LesseeEntity || '',
          assetDescription: leaseData.AssetDescription || '',
          commencementDate: leaseData.CommencementDate || '',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          data: leaseData,
          mode: mode
        };

        contracts.push(contract);
      });

      if (contracts.length === 0) {
        throw new Error('No valid contracts found in the file');
      }

      contracts.forEach(contract => {
        dispatch({ type: 'SAVE_CONTRACT', payload: contract });
      });

      setUploadedCount(contracts.length);
      setUploadStatus('success');
      setTimeout(() => {
        onUploadComplete();
      }, 2000);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse Excel file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Bulk Import from Excel</h3>

      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h4 className="font-medium text-slate-900 mb-3">Select Default Mode</h4>
          <p className="text-sm text-slate-600 mb-3">
            Choose the default mode for imported contracts. This will be used unless a "Mode" column specifies otherwise.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedMode('MINIMAL')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedMode === 'MINIMAL'
                  ? 'border-blue-500 bg-blue-100 text-blue-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              <div className="font-semibold">MINIMAL</div>
              <div className="text-xs mt-1">Basic fields only</div>
            </button>
            <button
              onClick={() => setSelectedMode('FULL')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedMode === 'FULL'
                  ? 'border-blue-500 bg-blue-100 text-blue-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              <div className="font-semibold">FULL</div>
              <div className="text-xs mt-1">All fields including legal</div>
            </button>
          </div>
        </div>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>

            <div>
              <h4 className="text-lg font-medium text-slate-900">Upload Excel File</h4>
              <p className="text-sm text-slate-600 mt-1">
                Import multiple lease contracts from Excel (.xlsx, .xls) or CSV file
              </p>
            </div>

            <Button
              onClick={handleFileSelect}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Select Excel File
                </>
              )}
            </Button>
          </div>
        </div>

        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Successfully imported {uploadedCount} contract{uploadedCount !== 1 ? 's' : ''}!
            </span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="bg-slate-50 rounded-lg p-4">
          <h5 className="font-medium text-slate-900 mb-2">Expected Excel Format:</h5>
          <p className="text-sm text-slate-600 mb-3">
            Your Excel file should have column headers in the first row. Each subsequent row represents one contract.
            All contracts will use the selected default mode above, unless a "Mode" column is included with "MINIMAL" or "FULL" values.
          </p>
          <div className="bg-white rounded border border-slate-200 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-slate-700">Contract ID</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-700">Lessee Entity</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-700">Lessor Name</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-700">Asset Description</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-700">...</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-2 py-2 text-slate-600">LC-2024-001</td>
                  <td className="px-2 py-2 text-slate-600">ABC Corp</td>
                  <td className="px-2 py-2 text-slate-600">XYZ Leasing</td>
                  <td className="px-2 py-2 text-slate-600">Office Equipment</td>
                  <td className="px-2 py-2 text-slate-600">...</td>
                </tr>
                <tr className="border-t">
                  <td className="px-2 py-2 text-slate-600">LC-2024-002</td>
                  <td className="px-2 py-2 text-slate-600">DEF Ltd</td>
                  <td className="px-2 py-2 text-slate-600">XYZ Leasing</td>
                  <td className="px-2 py-2 text-slate-600">Warehouse Space</td>
                  <td className="px-2 py-2 text-slate-600">...</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            <strong>Required columns:</strong> Contract ID, Lessee Entity, Lessor Name, Asset Description,
            Commencement Date, Non-cancellable Years, Fixed Payment, Payment Frequency, Currency, IBR Annual
            <br />
            <strong>Optional:</strong> Mode (MINIMAL or FULL, overrides the default mode selected above)
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
