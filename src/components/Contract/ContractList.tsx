import React, { useState } from 'react';
import { useLeaseContext, SavedContract } from '../../context/LeaseContext';
import { Button } from '../UI/Button';
import { 
  FileText, 
  Edit, 
  Eye, 
  Trash2, 
  Plus,
  Calendar,
  Building,
  User,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ContractListProps {
  onEditContract: (contract: SavedContract) => void;
  onNewContract: () => void;
}

export function ContractList({ onEditContract, onNewContract }: ContractListProps) {
  const { state, dispatch } = useLeaseContext();
  const { savedContracts } = state;
  const [selectedContract, setSelectedContract] = useState<SavedContract | null>(null);

  const handleDeleteContract = (contractId: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      dispatch({ type: 'DELETE_CONTRACT', payload: contractId });
    }
  };

  const handlePreviewContract = (contract: SavedContract) => {
    setSelectedContract(contract);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const getStatusBadge = (status: 'pending' | 'approved') => {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Saved Contracts</h3>
        <Button
          onClick={onNewContract}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Contract
        </Button>
      </div>

      {savedContracts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 mb-2">No contracts saved yet</h4>
          <p className="text-slate-600 mb-4">Create your first lease contract to get started</p>
          <Button onClick={onNewContract}>Create New Contract</Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Contract ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Lessor/Lessee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Commencement
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {savedContracts.map((contract, index) => (
                  <tr key={contract.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{contract.contractId}</div>
                          <div className="text-xs text-slate-500">{contract.mode} mode</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-slate-900">
                          <Building className="w-3 h-3 mr-1 text-slate-400" />
                          {contract.lessorName}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <User className="w-3 h-3 mr-1 text-slate-400" />
                          {contract.lesseeName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate" title={contract.assetDescription}>
                        {contract.assetDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {formatDate(contract.commencementDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreviewContract(contract)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditContract(contract)}
                          className="text-emerald-600 hover:text-emerald-900 p-1 hover:bg-emerald-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContract(contract.id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contract Preview Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Contract Preview - {selectedContract.contractId}
              </h3>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900">Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-slate-600">Contract ID:</span> <span className="font-medium">{selectedContract.contractId}</span></div>
                    <div><span className="text-slate-600">Lessor:</span> <span className="font-medium">{selectedContract.lessorName}</span></div>
                    <div><span className="text-slate-600">Lessee:</span> <span className="font-medium">{selectedContract.lesseeName}</span></div>
                    <div><span className="text-slate-600">Asset:</span> <span className="font-medium">{selectedContract.assetDescription}</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-slate-600">Commencement:</span> <span className="font-medium">{formatDate(selectedContract.commencementDate)}</span></div>
                    <div><span className="text-slate-600">Created:</span> <span className="font-medium">{formatDate(selectedContract.createdAt)}</span></div>
                    <div><span className="text-slate-600">Updated:</span> <span className="font-medium">{formatDate(selectedContract.updatedAt)}</span></div>
                    <div><span className="text-slate-600">Status:</span> {getStatusBadge(selectedContract.status)}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    onEditContract(selectedContract);
                    setSelectedContract(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Contract
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedContract(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}