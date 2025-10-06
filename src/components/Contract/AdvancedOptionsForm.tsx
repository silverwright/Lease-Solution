import React from 'react';
import { useLeaseContext } from '../../context/LeaseContext';
import { FormField } from '../UI/FormField';
import { Switch } from '../UI/Switch';

export function AdvancedOptionsForm() {
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
      <h3 className="text-lg font-semibold text-slate-900">Advanced Options</h3>
      
      {/* Renewal & Termination */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900">Renewal & Termination Options</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Renewal Option (years)"
            type="number"
            value={leaseData.RenewalOptionYears || ''}
            onChange={(value) => updateField('RenewalOptionYears', Number(value))}
            placeholder="3"
          />
          
          <FormField
            label="Renewal Likelihood (0-1)"
            type="number"
            step="0.01"
            value={leaseData.RenewalOptionLikelihood || ''}
            onChange={(value) => updateField('RenewalOptionLikelihood', Number(value))}
            placeholder="0.70"
            min="0"
            max="1"
          />
          
          <FormField
            label="Termination Option Point"
            value={leaseData.TerminationOptionPoint || ''}
            onChange={(value) => updateField('TerminationOptionPoint', value)}
            placeholder="End of Year 4"
          />
          
          <FormField
            label="Termination Penalty"
            type="number"
            value={leaseData.TerminationPenaltyExpected || ''}
            onChange={(value) => updateField('TerminationPenaltyExpected', Number(value))}
            placeholder="1000000"
          />
        </div>

        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
          <Switch
            checked={leaseData.TerminationReasonablyCertain || false}
            onChange={(checked) => updateField('TerminationReasonablyCertain', checked)}
          />
          <div>
            <label className="text-sm font-medium text-slate-900">Termination Reasonably Certain</label>
            <p className="text-xs text-slate-600">Is early termination reasonably certain?</p>
          </div>
        </div>
      </div>

      {/* Purchase Options & Guarantees */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="text-md font-semibold text-slate-900">Purchase Options & Guarantees</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Purchase Option Price"
            type="number"
            value={leaseData.PurchaseOptionPrice || ''}
            onChange={(value) => updateField('PurchaseOptionPrice', Number(value))}
            placeholder="0"
          />
          
          <FormField
            label="RVG Expected"
            type="number"
            value={leaseData.RVGExpected || ''}
            onChange={(value) => updateField('RVGExpected', Number(value))}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
            <Switch
              checked={leaseData.PurchaseOptionReasonablyCertain || false}
              onChange={(checked) => updateField('PurchaseOptionReasonablyCertain', checked)}
            />
            <div>
              <label className="text-sm font-medium text-slate-900">Purchase Option Reasonably Certain</label>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
            <Switch
              checked={leaseData.RVGReasonablyCertain || false}
              onChange={(checked) => updateField('RVGReasonablyCertain', checked)}
            />
            <div>
              <label className="text-sm font-medium text-slate-900">RVG Reasonably Certain</label>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Flags */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="text-md font-semibold text-slate-900">Policy Elections</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
            <Switch
              checked={leaseData.LowValueExemption || false}
              onChange={(checked) => updateField('LowValueExemption', checked)}
            />
            <div>
              <label className="text-sm font-medium text-slate-900">Low Value Exemption</label>
              <p className="text-xs text-slate-600">Apply low-value practical expedient</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
            <Switch
              checked={leaseData.ShortTermExemption || false}
              onChange={(checked) => updateField('ShortTermExemption', checked)}
            />
            <div>
              <label className="text-sm font-medium text-slate-900">Short Term Exemption</label>
              <p className="text-xs text-slate-600">Apply short-term lease expedient</p>
            </div>
          </div>
        </div>
      </div>

      

         

      {/* Governance */}
      <div className="border-t pt-6 space-y-4">
        <h4 className="text-md font-semibold text-slate-900">Governance & Approval</h4>
        
        <FormField
          label="Judgement Notes"
          value={leaseData.JudgementNotes || ''}
          onChange={(value) => updateField('JudgementNotes', value)}
          placeholder="Renewal likely due to site economics"
          multiline
        />
        
        <FormField
          label="Approval Sign-off"
          value={leaseData.ApprovalSignoff || ''}
          onChange={(value) => updateField('ApprovalSignoff', value)}
          placeholder="CFO – 14-Aug-2025"
        />
      </div>
    </div>
  );
}