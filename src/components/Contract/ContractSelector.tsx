import React from 'react';
import { useLeaseContext, SavedContract } from '../../context/LeaseContext';
import { FileText, Calendar, Building2, Package } from 'lucide-react';

interface ContractSelectorProps {
  onSelect: (contract: SavedContract) => void;
}

export function ContractSelector({ onSelect }: ContractSelectorProps) {
  const { state } = useLeaseContext();
  const contracts = state.savedContracts || [];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  if (contracts.length === 0) {
    return (
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-6 flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <FileText className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h4 className="font-semibold text-amber-800 text-lg">No Contracts Available</h4>
          <p className="text-amber-700 mt-1">
            Please create or import contracts first from the Contract Initiation page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Select a Contract</h3>
      <p className="text-sm text-slate-600">
        Choose a contract to perform calculations and generate reports
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map((contract) => (
          <button
            key={contract.id}
            onClick={() => onSelect(contract)}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 truncate">{contract.contractId}</h4>
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                  contract.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {contract.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="truncate">{contract.lesseeName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                <span className="truncate">{contract.assetDescription}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(contract.commencementDate)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Mode: <span className="font-medium text-slate-700">{contract.mode}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
