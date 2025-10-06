import React from 'react';
import { useLeaseContext } from '../../context/LeaseContext';
import { FormField } from '../UI/FormField';
import { Select } from '../UI/Select';
import { Switch } from '../UI/Switch';

const paymentFrequencies = ['Monthly', 'Quarterly', 'Semiannual', 'Annual'];
const paymentTimings = ['Advance', 'Arrears'];
const escalationTypes = ['None', 'CPI', 'Fixed%'];
const currencies = ['NGN', 'USD', 'EUR', 'GBP'];

export function PaymentDetailsForm() {
  const { state, dispatch } = useLeaseContext();
  const { leaseData } = state;

  const updateField = (field: string, value: any) => {
    dispatch({
      type: 'SET_LEASE_DATA',
      payload: { [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Payment Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Fixed Payment per Period"
          type="number"
          value={leaseData.FixedPaymentPerPeriod || ''}
          onChange={(value) => updateField('FixedPaymentPerPeriod', Number(value))}
          placeholder="25000000"
          required
        />
        
        <Select
          label="Currency"
          value={leaseData.Currency || 'NGN'}
          options={currencies}
          onChange={(value) => updateField('Currency', value)}
          required
        />
        
        <Select
          label="Payment Frequency"
          value={leaseData.PaymentFrequency || 'Monthly'}
          options={paymentFrequencies}
          onChange={(value) => updateField('PaymentFrequency', value)}
          required
        />
        
        <Select
          label="Payment Timing"
          value={leaseData.PaymentTiming || 'Advance'}
          options={paymentTimings}
          onChange={(value) => updateField('PaymentTiming', value)}
          required
        />
      </div>

      {/* Escalation Section */}
      <div className="border-t pt-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Escalation</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Escalation Type"
            value={leaseData.EscalationType || 'None'}
            options={escalationTypes}
            onChange={(value) => updateField('EscalationType', value)}
          />
          
          {leaseData.EscalationType === 'CPI' && (
            <>
              <FormField
                label="Base CPI"
                type="number"
                value={leaseData.BaseCPI || ''}
                onChange={(value) => updateField('BaseCPI', Number(value))}
                placeholder="250.0"
              />
              <FormField
                label="CPI Reset Month (1-12)"
                type="number"
                value={leaseData.CPIResetMonth || ''}
                onChange={(value) => updateField('CPIResetMonth', Number(value))}
                placeholder="1"
                min="1"
                max="12"
              />
            </>
          )}
          
          {leaseData.EscalationType === 'Fixed%' && (
            <FormField
              label="Fixed Escalation % (decimal)"
              type="number"
              step="0.01"
              value={leaseData.FixedEscalationPct || ''}
              onChange={(value) => updateField('FixedEscalationPct', Number(value))}
              placeholder="0.05"
            />
          )}
        </div>
      </div>

      {/* Rate & Financial Details */}
      <div className="border-t pt-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Financial Details</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="IBR (Annual %)"
            type="number"
            step="0.01"
            value={leaseData.IBR_Annual ? (Math.round(leaseData.IBR_Annual * 10000) / 100).toString() : ''}
            onChange={(value) => updateField('IBR_Annual', Math.round(Number(value) * 100) / 10000)}
            placeholder="14"
            required
          />
          
          <FormField
            label="Initial Direct Costs"
            type="number"
            value={leaseData.InitialDirectCosts || ''}
            onChange={(value) => updateField('InitialDirectCosts', Number(value))}
            placeholder="5000000"
          />
          
          <FormField
            label="Prepayments"
            type="number"
            value={leaseData.PrepaymentsBeforeCommencement || ''}
            onChange={(value) => updateField('PrepaymentsBeforeCommencement', Number(value))}
            placeholder="2500000"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormField
            label="Lease Incentives"
            type="number"
            value={leaseData.LeaseIncentives || ''}
            onChange={(value) => updateField('LeaseIncentives', Number(value))}
            placeholder="100000"
          />
          
          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
            <Switch
              checked={leaseData.PrepaidFirstPayment || false}
              onChange={(checked) => updateField('PrepaidFirstPayment', checked)}
            />
            <div>
              <label className="text-sm font-medium text-slate-900">Prepaid First Payment</label>
              <p className="text-xs text-slate-600">First payment made before commencement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Payment Details */}
      <div className="border-t pt-6">
        <h4 className="text-md font-semibold text-slate-900 mb-4">Bank Payment Details</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Bank Name"
            type="text"
            value={leaseData.BankName || ''}
            onChange={(value) => updateField('BankName', value)}
            placeholder="First Bank of Nigeria"
          />

          <FormField
            label="Account Name"
            type="text"
            value={leaseData.BankAccountName || ''}
            onChange={(value) => updateField('BankAccountName', value)}
            placeholder="XYZ Leasing Limited"
          />

          <FormField
            label="Account Number"
            type="text"
            value={leaseData.BankAccountNo || ''}
            onChange={(value) => updateField('BankAccountNo', value)}
            placeholder="1234567890"
          />
        </div>
      </div>
    </div>
  );
}