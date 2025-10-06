import React, { useState } from 'react';
import { useLeaseContext, SavedContract } from '../context/LeaseContext';
import { FileText, Download, Calendar, DollarSign, BarChart3, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { ContractSelector } from '../components/Contract/ContractSelector';

export function DisclosureJournals() {
  const { state, dispatch } = useLeaseContext();
  const { calculations, leaseData } = state;
  const [activeTab, setActiveTab] = useState('journals');
  const [selectedContract, setSelectedContract] = useState<SavedContract | null>(null);

  const hasCalculations = !!calculations;

  const handleSelectContract = (contract: SavedContract) => {
    setSelectedContract(contract);
    dispatch({ type: 'LOAD_CONTRACT', payload: contract.data });
    dispatch({ type: 'SET_MODE', payload: contract.mode });
  };

  const handleBackToSelection = () => {
    setSelectedContract(null);
    dispatch({ type: 'RESET' });
  };

  const tabs = [
    { id: 'journals', name: 'Journal Entries', icon: FileText },
    { id: 'disclosures', name: 'Key Disclosures', icon: BarChart3 },
    { id: 'maturity', name: 'Maturity Analysis', icon: Calendar },
  ];

  const formatCurrency = (value: number) => {
    return `${leaseData.Currency || 'NGN'} ${value.toLocaleString()}`;
  };

  const generateMaturityAnalysis = () => {
    if (!calculations || !leaseData.NonCancellableYears) return [];
    
    const totalPayments = calculations.cashflowSchedule.reduce((sum, row) => sum + row.rent, 0);
    const year1Payments = calculations.cashflowSchedule.slice(0, 12).reduce((sum, row) => sum + row.rent, 0);
    const years2to5Payments = totalPayments - year1Payments;
    
    return [
      {
        period: 'Year 1',
        undiscountedCashflow: year1Payments,
        presentValue: calculations.initialLiability * 0.3,
      },
      {
        period: 'Years 2-5',
        undiscountedCashflow: years2to5Payments,
        presentValue: calculations.initialLiability * 0.7,
      },
      {
        period: 'Total',
        undiscountedCashflow: totalPayments,
        presentValue: calculations.initialLiability,
      }
    ];
  };

  const exportData = () => {
    console.log('Exporting disclosure data...');
  };

  return (
    <div className="w-full min-h-screen p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 flex items-center gap-3 shadow-sm">
        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Disclosure & Journal Entries</h1>
          <p className="text-slate-600">IFRS 16 compliant disclosures and accounting entries</p>
        </div>
        {selectedContract && (
          <Button
            variant="outline"
            onClick={handleBackToSelection}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contract Selection
          </Button>
        )}
      </div>

      {/* Contract Selector */}
      {!selectedContract && (
        <div className="bg-white rounded-lg border border-slate-200 shadow p-6">
          <ContractSelector onSelect={handleSelectContract} />
        </div>
      )}

      {/* Missing Calculations Warning */}
      {selectedContract && !hasCalculations && (
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-6 flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 text-lg">No Calculation Data Available</h4>
            <p className="text-amber-700 mt-1">
              Please complete the lease calculations first to generate journal entries and disclosures.
            </p>
          </div>
        </div>
      )}

      {selectedContract && hasCalculations && (
        <>
          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={exportData}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 bg-white rounded-t-lg px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-lg border border-slate-200 p-6 shadow-sm">
            {activeTab === 'journals' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Journal Entries</h3>
                
                <div className="overflow-x-auto border border-slate-200 rounded-lg shadow">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Account</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Debit</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Credit</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Memo</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {calculations.journalEntries.map((entry, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{entry.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-medium">{entry.account}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                            {entry.dr > 0 ? formatCurrency(entry.dr) : ''}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                            {entry.cr > 0 ? formatCurrency(entry.cr) : ''}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{entry.memo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'disclosures' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Key Disclosure Figures</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Lease Liabilities */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-blue-900">Lease Liabilities</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Current (within 1 year):</span>
                        <span className="font-bold text-blue-900">
                          {formatCurrency(calculations.initialLiability * 0.3)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Non-current:</span>
                        <span className="font-bold text-blue-900">
                          {formatCurrency(calculations.initialLiability * 0.7)}
                        </span>
                      </div>
                      <div className="border-t border-blue-300 pt-2">
                        <div className="flex justify-between">
                          <span className="text-blue-800 font-medium">Total:</span>
                          <span className="font-bold text-blue-900">
                            {formatCurrency(calculations.initialLiability)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROU Assets */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-emerald-900">ROU Assets</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Gross carrying amount:</span>
                        <span className="font-bold text-emerald-900">
                          {formatCurrency(calculations.initialROU)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Accumulated depreciation:</span>
                        <span className="font-bold text-emerald-900">
                          {formatCurrency(calculations.totalDepreciation * 0.1)}
                        </span>
                      </div>
                      <div className="border-t border-emerald-300 pt-2">
                        <div className="flex justify-between">
                          <span className="text-emerald-800 font-medium">Net carrying amount:</span>
                          <span className="font-bold text-emerald-900">
                            {formatCurrency(calculations.initialROU - (calculations.totalDepreciation * 0.1))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* P&L Impact */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-purple-900">Annual P&L Impact</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Interest expense:</span>
                        <span className="font-bold text-purple-900">
                          {formatCurrency(calculations.totalInterest / (leaseData.NonCancellableYears || 1))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Depreciation expense:</span>
                        <span className="font-bold text-purple-900">
                          {formatCurrency(calculations.totalDepreciation / (leaseData.NonCancellableYears || 1))}
                        </span>
                      </div>
                      <div className="border-t border-purple-300 pt-2">
                        <div className="flex justify-between">
                          <span className="text-purple-800 font-medium">Total annual impact:</span>
                          <span className="font-bold text-purple-900">
                            {formatCurrency((calculations.totalInterest + calculations.totalDepreciation) / (leaseData.NonCancellableYears || 1))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Disclosures */}
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-4">Additional Disclosure Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h5 className="font-medium text-slate-800 mb-2">Lease Terms</h5>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Weighted average lease term: {leaseData.NonCancellableYears || 0} years</li>
                        <li>• Weighted average discount rate: {((leaseData.IBR_Annual || 0) * 100).toFixed(2)}%</li>
                        <li>• Payment frequency: {leaseData.PaymentFrequency || 'Monthly'}</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-slate-800 mb-2">Cash Flow Information</h5>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Total cash payments for leases: {formatCurrency(calculations.cashflowSchedule.reduce((sum, row) => sum + row.rent, 0))}</li>
                        <li>• Cash paid for amounts included in lease liabilities: {formatCurrency(calculations.initialLiability)}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'maturity' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Lease Liability Maturity Analysis</h3>
                
                <div className="overflow-x-auto border border-slate-200 rounded-lg shadow">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Period</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Undiscounted Cashflow</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Present Value</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {generateMaturityAnalysis().map((row, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${row.period === 'Total' ? 'bg-slate-100 font-bold' : ''} hover:bg-blue-50 transition-colors`}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.period}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                            {formatCurrency(row.undiscountedCashflow)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                            {formatCurrency(row.presentValue)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-slate-700">
                            {((row.presentValue / calculations.initialLiability) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Maturity Analysis Notes</h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• The maturity analysis shows undiscounted lease payments and their present values</li>
                    <li>• Current portion (Year 1) represents lease liabilities due within 12 months</li>
                    <li>• Non-current portion represents lease liabilities due after 12 months</li>
                    <li>• This analysis is required under IFRS 16 paragraph 58</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}