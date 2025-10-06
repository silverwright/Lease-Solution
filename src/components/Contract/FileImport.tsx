import React, { useRef, useState } from 'react';
import { useLeaseContext, SavedContract } from '../../context/LeaseContext';
import { Button } from '../UI/Button';
import { Upload, FileText, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FileImportProps {
  onUploadComplete: () => void;
  onModeRequired: () => void;
}

type ImportType = 'csv' | 'excel' | null;

export function FileImport({ onUploadComplete, onModeRequired }: FileImportProps) {
  const { dispatch } = useLeaseContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<ImportType>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleTypeSelect = (type: ImportType) => {
    setSelectedType(type);
    setUploadStatus('idle');
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataRow = lines[1].split(',').map(d => d.trim().replace(/"/g, ''));

    const csvData: any = {};
    headers.forEach((header, index) => {
      if (dataRow[index]) {
        csvData[header] = dataRow[index];
      }
    });

    return csvData;
  };

  const mapDataToLeaseData = (data: any) => {
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
    Object.keys(data).forEach(key => {
      const leaseKey = mapping[key];
      if (leaseKey && data[key] !== undefined && data[key] !== null && data[key] !== '') {
        let value = data[key];

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

  const handleCSVUpload = async (file: File) => {
    const text = await file.text();
    const csvData = parseCSV(text);
    const leaseData = mapDataToLeaseData(csvData);

    dispatch({ type: 'SET_LEASE_DATA', payload: leaseData });
    setUploadStatus('success');
    setTimeout(() => {
      onModeRequired();
      onUploadComplete();
    }, 1500);
  };

  const handleExcelUpload = async (file: File) => {
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
      const leaseData = mapDataToLeaseData(row);

      if (!leaseData.ContractID) {
        console.warn(`Row ${index + 1}: Skipping - missing Contract ID`);
        return;
      }

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
        mode: 'MINIMAL'
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
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('idle');

    try {
      if (selectedType === 'csv') {
        if (!file.name.toLowerCase().endsWith('.csv')) {
          throw new Error('Please select a CSV file');
        }
        await handleCSVUpload(file);
      } else if (selectedType === 'excel') {
        const fileExtension = file.name.toLowerCase().split('.').pop();
        if (!['xlsx', 'xls'].includes(fileExtension || '')) {
          throw new Error('Please select an Excel file (.xlsx or .xls)');
        }
        await handleExcelUpload(file);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!selectedType) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Import Contracts</h3>
        <p className="text-slate-600 mb-6">Choose how you would like to import your contract data</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleTypeSelect('csv')}
            className="group border-2 border-slate-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-slate-900 mb-1">CSV Import</h4>
                <p className="text-sm text-slate-600">
                  Import a single contract from a CSV file
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleTypeSelect('excel')}
            className="group border-2 border-slate-300 rounded-lg p-6 hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-slate-900 mb-1">Excel Import</h4>
                <p className="text-sm text-slate-600">
                  Import multiple contracts from an Excel file
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {selectedType === 'csv' ? 'CSV Import' : 'Excel Bulk Import'}
        </h3>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedType(null);
            setUploadStatus('idle');
          }}
          className="text-sm"
        >
          Change Import Type
        </Button>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              selectedType === 'csv' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {selectedType === 'csv' ? (
                <FileText className="w-6 h-6 text-blue-600" />
              ) : (
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              )}
            </div>

            <div>
              <h4 className="text-lg font-medium text-slate-900">
                Upload {selectedType === 'csv' ? 'CSV' : 'Excel'} File
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                {selectedType === 'csv'
                  ? 'Import lease data from a CSV file to automatically fill the form'
                  : 'Import multiple lease contracts from an Excel file (.xlsx or .xls)'}
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
                  Select {selectedType === 'csv' ? 'CSV' : 'Excel'} File
                </>
              )}
            </Button>
          </div>
        </div>

        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              {selectedType === 'csv'
                ? 'CSV imported successfully!'
                : `Successfully imported ${uploadedCount} contract${uploadedCount !== 1 ? 's' : ''}!`}
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
          <h5 className="font-medium text-slate-900 mb-2">Expected Format:</h5>
          {selectedType === 'csv' ? (
            <>
              <p className="text-sm text-slate-600 mb-2">
                Your CSV should include these column headers (first row):
              </p>
              <div className="text-xs text-slate-500 font-mono bg-white p-2 rounded border">
                Contract ID, Lessee Entity, Lessor Name, Asset Description, Asset Class,
                Commencement Date, Non-cancellable Years, Fixed Payment, Payment Frequency,
                Currency, IBR Annual
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-3">
                Your Excel file should have column headers in the first row. Each subsequent row represents one contract.
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
              </p>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={selectedType === 'csv' ? '.csv' : '.xlsx,.xls'}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
