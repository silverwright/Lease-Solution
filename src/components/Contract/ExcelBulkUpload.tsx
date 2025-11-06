import React, { useRef, useState } from 'react';
import { useLeaseContext, SavedContract } from '../../context/LeaseContext';
import { Button } from '../UI/Button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
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

  const downloadTemplate = () => {
    const headers = [
      'Contract ID', 'Lessee Entity', 'Lessor Name', 'Asset Class', 'Asset Description',
      'Contract Date', 'Commencement Date', 'Original End Date', 'Non-cancellable Years',
      'Useful Life Years', 'Fixed Payment Per Period', 'Currency', 'Payment Frequency',
      'Payment Timing', 'IBR Annual', 'Escalation Type', 'Base CPI', 'CPI Reset Month',
      'First Reset Year Offset', 'Fixed Escalation Pct', 'Initial Direct Costs',
      'Prepayments Before Commencement', 'Lease Incentives', 'Prepaid First Payment',
      'Bank Name', 'Bank Account Name', 'Bank Account No', 'Renewal Option Years',
      'Renewal Likelihood', 'Termination Option Point', 'Termination Penalty Expected',
      'Termination Reasonably Certain', 'Purchase Option Price', 'Purchase Option Reasonably Certain',
      'RVG Expected', 'RVG Reasonably Certain', 'Variable Payments In Substance Fixed',
      'Variable Payments Usage Expected', 'Low Value Exemption', 'Short Term Exemption',
      'Separate Non Lease Components', 'Allocation Basis', 'FX Policy', 'Judgement Notes',
      'Approval Signoff', 'Lessor Jurisdiction', 'Lessee Jurisdiction', 'Lessor Address',
      'Lessee Address', 'Lessor RC Number', 'Lessee RC Number', 'Asset Location',
      'Delivery Date Latest', 'Risk Transfer Event', 'Insurance Sum Insured', 'Insurance TP Limit',
      'Insurer Rating Min', 'Permitted Use', 'Move Restriction', 'Software License',
      'Arbitration Rules', 'Seat Of Arbitration', 'Language', 'Governing Law',
      'Lessor Signatory Title', 'Lessee Signatory Title', 'Mode'
    ];

    const sampleData = [
      {
        'Contract ID': 'LC-001',
        'Lessee Entity': 'ABC Manufacturing Ltd',
        'Lessor Name': 'Global Leasing Corp',
        'Asset Class': 'Equipment',
        'Asset Description': 'Industrial Machinery - CNC Machine',
        'Contract Date': '2024-01-15',
        'Commencement Date': '2024-02-01',
        'Original End Date': '2029-01-31',
        'Non-cancellable Years': 5,
        'Useful Life Years': 8,
        'Fixed Payment Per Period': 50000,
        'Currency': 'USD',
        'Payment Frequency': 'Monthly',
        'Payment Timing': 'In Arrears',
        'IBR Annual': 5.5,
        'Escalation Type': 'Fixed',
        'Base CPI': 2.5,
        'CPI Reset Month': 'January',
        'First Reset Year Offset': 1,
        'Fixed Escalation Pct': 2.0,
        'Initial Direct Costs': 5000,
        'Prepayments Before Commencement': 0,
        'Lease Incentives': 10000,
        'Prepaid First Payment': 50000,
        'Bank Name': 'First National Bank',
        'Bank Account Name': 'Lease Operations',
        'Bank Account No': '123456789',
        'Renewal Option Years': 2,
        'Renewal Likelihood': 'Likely',
        'Termination Option Point': 'End of Year 3',
        'Termination Penalty Expected': 5000,
        'Termination Reasonably Certain': 'No',
        'Purchase Option Price': 100000,
        'Purchase Option Reasonably Certain': 'No',
        'RVG Expected': 50000,
        'RVG Reasonably Certain': 'Yes',
        'Variable Payments In Substance Fixed': 'No',
        'Variable Payments Usage Expected': 0,
        'Low Value Exemption': 'No',
        'Short Term Exemption': 'No',
        'Separate Non Lease Components': 'No',
        'Allocation Basis': 'Standalone Price',
        'FX Policy': 'USD Only',
        'Judgement Notes': 'Standard lease agreement',
        'Approval Signoff': 'CFO - John Smith',
        'Lessor Jurisdiction': 'New York',
        'Lessee Jurisdiction': 'California',
        'Lessor Address': '100 Finance Ave, New York, NY 10001',
        'Lessee Address': '500 Tech Drive, San Francisco, CA 94105',
        'Lessor RC Number': 'RC-001-NY',
        'Lessee RC Number': 'RC-ABC-CA',
        'Asset Location': 'San Francisco, CA',
        'Delivery Date Latest': '2024-01-31',
        'Risk Transfer Event': 'Commencement Date',
        'Insurance Sum Insured': 250000,
        'Insurance TP Limit': 500000,
        'Insurer Rating Min': 'A',
        'Permitted Use': 'Manufacturing Operations',
        'Move Restriction': 'None',
        'Software License': 'Included',
        'Arbitration Rules': 'ICC Rules',
        'Seat Of Arbitration': 'New York',
        'Language': 'English',
        'Governing Law': 'New York',
        'Lessor Signatory Title': 'VP of Leasing',
        'Lessee Signatory Title': 'CFO',
        'Mode': 'FULL'
      },
      {
        'Contract ID': 'LC-002',
        'Lessee Entity': 'Tech Solutions Inc',
        'Lessor Name': 'Equipment Finance Partners',
        'Asset Class': 'IT Equipment',
        'Asset Description': 'Server Hardware and Network Equipment',
        'Contract Date': '2024-02-01',
        'Commencement Date': '2024-03-01',
        'Original End Date': '2027-02-28',
        'Non-cancellable Years': 3,
        'Useful Life Years': 5,
        'Fixed Payment Per Period': 25000,
        'Currency': 'USD',
        'Payment Frequency': 'Quarterly',
        'Payment Timing': 'In Advance',
        'IBR Annual': 4.8,
        'Escalation Type': 'CPI',
        'Base CPI': 3.0,
        'CPI Reset Month': 'April',
        'First Reset Year Offset': 1,
        'Fixed Escalation Pct': 0,
        'Initial Direct Costs': 2000,
        'Prepayments Before Commencement': 25000,
        'Lease Incentives': 5000,
        'Prepaid First Payment': 25000,
        'Bank Name': 'Tech Bank',
        'Bank Account Name': 'Lease Account',
        'Bank Account No': '987654321',
        'Renewal Option Years': 1,
        'Renewal Likelihood': 'Unlikely',
        'Termination Option Point': 'End of Year 2',
        'Termination Penalty Expected': 2500,
        'Termination Reasonably Certain': 'No',
        'Purchase Option Price': 50000,
        'Purchase Option Reasonably Certain': 'No',
        'RVG Expected': 15000,
        'RVG Reasonably Certain': 'No',
        'Variable Payments In Substance Fixed': 'No',
        'Variable Payments Usage Expected': 0,
        'Low Value Exemption': 'No',
        'Short Term Exemption': 'No',
        'Separate Non Lease Components': 'Yes',
        'Allocation Basis': 'Incremental Borrowing Rate',
        'FX Policy': 'USD Only',
        'Judgement Notes': 'Technology refresh lease',
        'Approval Signoff': 'IT Director - Sarah Johnson',
        'Lessor Jurisdiction': 'Texas',
        'Lessee Jurisdiction': 'Illinois',
        'Lessor Address': '200 Finance Plaza, Houston, TX 77001',
        'Lessee Address': '300 Tech Park, Chicago, IL 60601',
        'Lessor RC Number': 'RC-002-TX',
        'Lessee RC Number': 'RC-TECH-IL',
        'Asset Location': 'Chicago, IL',
        'Delivery Date Latest': '2024-02-28',
        'Risk Transfer Event': 'Delivery Date',
        'Insurance Sum Insured': 150000,
        'Insurance TP Limit': 300000,
        'Insurer Rating Min': 'AA',
        'Permitted Use': 'IT Operations',
        'Move Restriction': 'Facilities Only',
        'Software License': 'Excluded',
        'Arbitration Rules': 'AAA Rules',
        'Seat Of Arbitration': 'Chicago',
        'Language': 'English',
        'Governing Law': 'Illinois',
        'Lessor Signatory Title': 'VP of Contracts',
        'Lessee Signatory Title': 'COO',
        'Mode': 'FULL'
      },
      {
        'Contract ID': 'LC-003',
        'Lessee Entity': 'Retail Operations LLC',
        'Lessor Name': 'Commercial Real Estate Partners',
        'Asset Class': 'Real Estate',
        'Asset Description': 'Retail Store Space - 5000 sqft',
        'Contract Date': '2024-01-20',
        'Commencement Date': '2024-04-01',
        'Original End Date': '2034-03-31',
        'Non-cancellable Years': 10,
        'Useful Life Years': 25,
        'Fixed Payment Per Period': 15000,
        'Currency': 'USD',
        'Payment Frequency': 'Monthly',
        'Payment Timing': 'In Advance',
        'IBR Annual': 6.2,
        'Escalation Type': 'Fixed',
        'Base CPI': 0,
        'CPI Reset Month': '',
        'First Reset Year Offset': 0,
        'Fixed Escalation Pct': 3.0,
        'Initial Direct Costs': 10000,
        'Prepayments Before Commencement': 30000,
        'Lease Incentives': 30000,
        'Prepaid First Payment': 15000,
        'Bank Name': 'Commercial Bank',
        'Bank Account Name': 'Real Estate',
        'Bank Account No': '555666777',
        'Renewal Option Years': 5,
        'Renewal Likelihood': 'Very Likely',
        'Termination Option Point': 'End of Year 5',
        'Termination Penalty Expected': 50000,
        'Termination Reasonably Certain': 'Yes',
        'Purchase Option Price': 500000,
        'Purchase Option Reasonably Certain': 'Yes',
        'RVG Expected': 600000,
        'RVG Reasonably Certain': 'Yes',
        'Variable Payments In Substance Fixed': 'Yes',
        'Variable Payments Usage Expected': 5000,
        'Low Value Exemption': 'No',
        'Short Term Exemption': 'No',
        'Separate Non Lease Components': 'No',
        'Allocation Basis': 'Weighted Average',
        'FX Policy': 'USD Only',
        'Judgement Notes': 'Long-term retail space lease',
        'Approval Signoff': 'CEO - Michael Chen',
        'Lessor Jurisdiction': 'Florida',
        'Lessee Jurisdiction': 'Florida',
        'Lessor Address': '1000 Real Estate Blvd, Miami, FL 33101',
        'Lessee Address': '2000 Retail Drive, Orlando, FL 32801',
        'Lessor RC Number': 'RC-003-FL',
        'Lessee RC Number': 'RC-RETAIL-FL',
        'Asset Location': 'Orlando, FL',
        'Delivery Date Latest': '2024-03-31',
        'Risk Transfer Event': 'Commencement Date',
        'Insurance Sum Insured': 1000000,
        'Insurance TP Limit': 2000000,
        'Insurer Rating Min': 'AA',
        'Permitted Use': 'Retail Sales',
        'Move Restriction': 'Location Fixed',
        'Software License': 'N/A',
        'Arbitration Rules': 'JAMS Rules',
        'Seat Of Arbitration': 'Miami',
        'Language': 'English',
        'Governing Law': 'Florida',
        'Lessor Signatory Title': 'Managing Director',
        'Lessee Signatory Title': 'CEO',
        'Mode': 'FULL'
      },
      {
        'Contract ID': 'LC-004',
        'Lessee Entity': 'Fleet Management Co',
        'Lessor Name': 'Vehicle Leasing International',
        'Asset Class': 'Vehicles',
        'Asset Description': 'Commercial Fleet - 50 Vehicles',
        'Contract Date': '2024-02-10',
        'Commencement Date': '2024-03-15',
        'Original End Date': '2026-03-14',
        'Non-cancellable Years': 2,
        'Useful Life Years': 4,
        'Fixed Payment Per Period': 35000,
        'Currency': 'USD',
        'Payment Frequency': 'Monthly',
        'Payment Timing': 'In Arrears',
        'IBR Annual': 5.0,
        'Escalation Type': 'None',
        'Base CPI': 0,
        'CPI Reset Month': '',
        'First Reset Year Offset': 0,
        'Fixed Escalation Pct': 0,
        'Initial Direct Costs': 7500,
        'Prepayments Before Commencement': 0,
        'Lease Incentives': 0,
        'Prepaid First Payment': 0,
        'Bank Name': 'Leasing Bank',
        'Bank Account Name': 'Fleet Operations',
        'Bank Account No': '444555666',
        'Renewal Option Years': 1,
        'Renewal Likelihood': 'Moderate',
        'Termination Option Point': 'End of Year 1',
        'Termination Penalty Expected': 10000,
        'Termination Reasonably Certain': 'No',
        'Purchase Option Price': 200000,
        'Purchase Option Reasonably Certain': 'No',
        'RVG Expected': 150000,
        'RVG Reasonably Certain': 'Yes',
        'Variable Payments In Substance Fixed': 'No',
        'Variable Payments Usage Expected': 0,
        'Low Value Exemption': 'No',
        'Short Term Exemption': 'No',
        'Separate Non Lease Components': 'No',
        'Allocation Basis': 'Individual Vehicles',
        'FX Policy': 'USD Only',
        'Judgement Notes': 'Commercial vehicle fleet',
        'Approval Signoff': 'Operations Manager - Lisa White',
        'Lessor Jurisdiction': 'Michigan',
        'Lessee Jurisdiction': 'Ohio',
        'Lessor Address': '300 Auto Park, Detroit, MI 48201',
        'Lessee Address': '400 Transport Way, Columbus, OH 43085',
        'Lessor RC Number': 'RC-004-MI',
        'Lessee RC Number': 'RC-FLEET-OH',
        'Asset Location': 'Columbus, OH',
        'Delivery Date Latest': '2024-03-14',
        'Risk Transfer Event': 'Delivery Date',
        'Insurance Sum Insured': 500000,
        'Insurance TP Limit': 1000000,
        'Insurer Rating Min': 'A',
        'Permitted Use': 'Commercial Transport',
        'Move Restriction': 'Regional',
        'Software License': 'Fleet Tracking Software',
        'Arbitration Rules': 'AAA Rules',
        'Seat Of Arbitration': 'Cleveland',
        'Language': 'English',
        'Governing Law': 'Ohio',
        'Lessor Signatory Title': 'Account Manager',
        'Lessee Signatory Title': 'Operations Director',
        'Mode': 'MINIMAL'
      },
      {
        'Contract ID': 'LC-005',
        'Lessee Entity': 'Healthcare Systems Group',
        'Lessor Name': 'Medical Equipment Finance',
        'Asset Class': 'Medical Equipment',
        'Asset Description': 'Diagnostic Imaging Equipment',
        'Contract Date': '2024-03-01',
        'Commencement Date': '2024-04-15',
        'Original End Date': '2027-04-14',
        'Non-cancellable Years': 3,
        'Useful Life Years': 6,
        'Fixed Payment Per Period': 18000,
        'Currency': 'USD',
        'Payment Frequency': 'Monthly',
        'Payment Timing': 'In Advance',
        'IBR Annual': 5.3,
        'Escalation Type': 'CPI',
        'Base CPI': 2.5,
        'CPI Reset Month': 'May',
        'First Reset Year Offset': 1,
        'Fixed Escalation Pct': 0,
        'Initial Direct Costs': 3000,
        'Prepayments Before Commencement': 18000,
        'Lease Incentives': 0,
        'Prepaid First Payment': 18000,
        'Bank Name': 'Healthcare Finance Bank',
        'Bank Account Name': 'Medical Division',
        'Bank Account No': '111222333',
        'Renewal Option Years': 2,
        'Renewal Likelihood': 'Likely',
        'Termination Option Point': 'End of Year 2',
        'Termination Penalty Expected': 3000,
        'Termination Reasonably Certain': 'No',
        'Purchase Option Price': 75000,
        'Purchase Option Reasonably Certain': 'No',
        'RVG Expected': 40000,
        'RVG Reasonably Certain': 'No',
        'Variable Payments In Substance Fixed': 'No',
        'Variable Payments Usage Expected': 0,
        'Low Value Exemption': 'No',
        'Short Term Exemption': 'No',
        'Separate Non Lease Components': 'Yes',
        'Allocation Basis': 'Service Component',
        'FX Policy': 'USD Only',
        'Judgement Notes': 'Medical device with maintenance',
        'Approval Signoff': 'Chief Medical Officer - Dr. Paul Evans',
        'Lessor Jurisdiction': 'Massachusetts',
        'Lessee Jurisdiction': 'Massachusetts',
        'Lessor Address': '500 Medical Plaza, Boston, MA 02101',
        'Lessee Address': '600 Healthcare Drive, Boston, MA 02115',
        'Lessor RC Number': 'RC-005-MA',
        'Lessee RC Number': 'RC-HEALTH-MA',
        'Asset Location': 'Boston, MA',
        'Delivery Date Latest': '2024-04-14',
        'Risk Transfer Event': 'Commencement Date',
        'Insurance Sum Insured': 300000,
        'Insurance TP Limit': 600000,
        'Insurer Rating Min': 'A',
        'Permitted Use': 'Patient Diagnostics',
        'Move Restriction': 'Facility Only',
        'Software License': 'Included',
        'Arbitration Rules': 'ICC Rules',
        'Seat Of Arbitration': 'Boston',
        'Language': 'English',
        'Governing Law': 'Massachusetts',
        'Lessor Signatory Title': 'Business Development Manager',
        'Lessee Signatory Title': 'Chief Financial Officer',
        'Mode': 'FULL'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    ws['!cols'] = headers.map(() => ({ wch: 18 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lease Contracts');

    XLSX.writeFile(wb, 'Lease_Template_66_Columns.xlsx');
  };

  const mapExcelRowToLeaseData = (row: any) => {
    const mapping: { [key: string]: string } = {
      // Basic identifiers
      'Contract ID': 'ContractID',
      'ContractID': 'ContractID',
      'Lessee Entity': 'LesseeEntity',
      'LesseeEntity': 'LesseeEntity',
      'Lessor Name': 'LessorName',
      'LessorName': 'LessorName',
      'Asset Class': 'AssetClass',
      'AssetClass': 'AssetClass',
      'Asset Description': 'AssetDescription',
      'AssetDescription': 'AssetDescription',

      // Dates
      'Contract Date': 'ContractDate',
      'ContractDate': 'ContractDate',
      'Commencement Date': 'CommencementDate',
      'CommencementDate': 'CommencementDate',
      'End Date': 'EndDateOriginal',
      'EndDateOriginal': 'EndDateOriginal',
      'Original End Date': 'EndDateOriginal',

      // Term & Options
      'Non-cancellable Years': 'NonCancellableYears',
      'NonCancellableYears': 'NonCancellableYears',
      'Non-cancellable Period': 'NonCancellableYears',
      'Renewal Option Years': 'RenewalOptionYears',
      'RenewalOptionYears': 'RenewalOptionYears',
      'Renewal Likelihood': 'RenewalOptionLikelihood',
      'RenewalOptionLikelihood': 'RenewalOptionLikelihood',
      'Termination Option Point': 'TerminationOptionPoint',
      'TerminationOptionPoint': 'TerminationOptionPoint',
      'Termination Penalty Expected': 'TerminationPenaltyExpected',
      'TerminationPenaltyExpected': 'TerminationPenaltyExpected',
      'Termination Reasonably Certain': 'TerminationReasonablyCertain',
      'TerminationReasonablyCertain': 'TerminationReasonablyCertain',

      // Payments
      'Fixed Payment': 'FixedPaymentPerPeriod',
      'FixedPaymentPerPeriod': 'FixedPaymentPerPeriod',
      'Fixed Payment Per Period': 'FixedPaymentPerPeriod',
      'Currency': 'Currency',
      'Payment Frequency': 'PaymentFrequency',
      'PaymentFrequency': 'PaymentFrequency',
      'Payment Timing': 'PaymentTiming',
      'PaymentTiming': 'PaymentTiming',

      // Escalation
      'Escalation Type': 'EscalationType',
      'EscalationType': 'EscalationType',
      'Base CPI': 'BaseCPI',
      'BaseCPI': 'BaseCPI',
      'CPI Reset Month': 'CPIResetMonth',
      'CPIResetMonth': 'CPIResetMonth',
      'First Reset Year Offset': 'FirstResetYearOffset',
      'FirstResetYearOffset': 'FirstResetYearOffset',
      'Fixed Escalation Pct': 'FixedEscalationPct',
      'FixedEscalationPct': 'FixedEscalationPct',

      // Variable & Other
      'Variable Payments In Substance Fixed': 'VariablePaymentsInSubstanceFixed',
      'VariablePaymentsInSubstanceFixed': 'VariablePaymentsInSubstanceFixed',
      'Variable Payments Usage Expected': 'VariablePaymentsUsageExpected',
      'VariablePaymentsUsageExpected': 'VariablePaymentsUsageExpected',
      'RVG Expected': 'RVGExpected',
      'RVGExpected': 'RVGExpected',
      'RVG Reasonably Certain': 'RVGReasonablyCertain',
      'RVGReasonablyCertain': 'RVGReasonablyCertain',
      'Purchase Option Price': 'PurchaseOptionPrice',
      'PurchaseOptionPrice': 'PurchaseOptionPrice',
      'Purchase Option Reasonably Certain': 'PurchaseOptionReasonablyCertain',
      'PurchaseOptionReasonablyCertain': 'PurchaseOptionReasonablyCertain',

      // ROU Adjustments
      'Initial Direct Costs': 'InitialDirectCosts',
      'InitialDirectCosts': 'InitialDirectCosts',
      'Prepayments Before Commencement': 'PrepaymentsBeforeCommencement',
      'PrepaymentsBeforeCommencement': 'PrepaymentsBeforeCommencement',
      'Lease Incentives': 'LeaseIncentives',
      'LeaseIncentives': 'LeaseIncentives',
      'Prepaid First Payment': 'PrepaidFirstPayment',
      'PrepaidFirstPayment': 'PrepaidFirstPayment',

      // Currency & Rates
      'IBR Annual': 'IBR_Annual',
      'IBR_Annual': 'IBR_Annual',
      'IBR': 'IBR_Annual',
      'FX Policy': 'FXPolicy',
      'FXPolicy': 'FXPolicy',

      // Asset Life
      'Useful Life Years': 'UsefulLifeYears',
      'UsefulLifeYears': 'UsefulLifeYears',
      'Useful Life': 'UsefulLifeYears',

      // Policy Flags
      'Low Value Exemption': 'LowValueExemption',
      'LowValueExemption': 'LowValueExemption',
      'Short Term Exemption': 'ShortTermExemption',
      'ShortTermExemption': 'ShortTermExemption',
      'Separate Non Lease Components': 'SeparateNonLeaseComponents',
      'SeparateNonLeaseComponents': 'SeparateNonLeaseComponents',
      'Allocation Basis': 'AllocationBasis',
      'AllocationBasis': 'AllocationBasis',

      // Governance
      'Judgement Notes': 'JudgementNotes',
      'JudgementNotes': 'JudgementNotes',
      'Approval Signoff': 'ApprovalSignoff',
      'ApprovalSignoff': 'ApprovalSignoff',

      // Full mode extensions (Legal & Administrative)
      'Lessor Jurisdiction': 'LessorJurisdiction',
      'LessorJurisdiction': 'LessorJurisdiction',
      'Lessee Jurisdiction': 'LesseeJurisdiction',
      'LesseeJurisdiction': 'LesseeJurisdiction',
      'Lessor Address': 'LessorAddress',
      'LessorAddress': 'LessorAddress',
      'Lessee Address': 'LesseeAddress',
      'LesseeAddress': 'LesseeAddress',
      'Lessor RC Number': 'LessorRCNumber',
      'LessorRCNumber': 'LessorRCNumber',
      'Lessee RC Number': 'LesseeRCNumber',
      'LesseeRCNumber': 'LesseeRCNumber',
      'Asset Location': 'AssetLocation',
      'AssetLocation': 'AssetLocation',
      'Delivery Date Latest': 'DeliveryDateLatest',
      'DeliveryDateLatest': 'DeliveryDateLatest',
      'Risk Transfer Event': 'RiskTransferEvent',
      'RiskTransferEvent': 'RiskTransferEvent',
      'Insurance Sum Insured': 'InsuranceSumInsured',
      'InsuranceSumInsured': 'InsuranceSumInsured',
      'Insurance TP Limit': 'InsuranceTPLimit',
      'InsuranceTPLimit': 'InsuranceTPLimit',
      'Insurer Rating Min': 'InsurerRatingMin',
      'InsurerRatingMin': 'InsurerRatingMin',
      'Permitted Use': 'PermittedUse',
      'PermittedUse': 'PermittedUse',
      'Move Restriction': 'MoveRestriction',
      'MoveRestriction': 'MoveRestriction',
      'Software License': 'SoftwareLicense',
      'SoftwareLicense': 'SoftwareLicense',
      'Bank Name': 'BankName',
      'BankName': 'BankName',
      'Bank Account Name': 'BankAccountName',
      'BankAccountName': 'BankAccountName',
      'Bank Account No': 'BankAccountNo',
      'BankAccountNo': 'BankAccountNo',
      'Arbitration Rules': 'ArbitrationRules',
      'ArbitrationRules': 'ArbitrationRules',
      'Seat Of Arbitration': 'SeatOfArbitration',
      'SeatOfArbitration': 'SeatOfArbitration',
      'Language': 'Language',
      'Governing Law': 'GoverningLaw',
      'GoverningLaw': 'GoverningLaw',
      'Lessor Signatory Title': 'LessorSignatoryTitle',
      'LessorSignatoryTitle': 'LessorSignatoryTitle',
      'Lessee Signatory Title': 'LesseeSignatoryTitle',
      'LesseeSignatoryTitle': 'LesseeSignatoryTitle',
    };

    const leaseData: any = {};
    Object.keys(row).forEach(excelKey => {
      // Trim whitespace from header names to handle Excel headers with leading/trailing spaces
      const normalizedKey = excelKey.trim();
      const leaseKey = mapping[normalizedKey];
      if (leaseKey && row[excelKey] !== undefined && row[excelKey] !== null && row[excelKey] !== '') {
        let value = row[excelKey];

        // Handle numeric fields
        const numericFields = [
          'NonCancellableYears', 'RenewalOptionYears', 'RenewalOptionLikelihood',
          'TerminationPenaltyExpected', 'FixedPaymentPerPeriod', 'BaseCPI',
          'CPIResetMonth', 'FirstResetYearOffset', 'FixedEscalationPct',
          'VariablePaymentsInSubstanceFixed', 'VariablePaymentsUsageExpected',
          'RVGExpected', 'PurchaseOptionPrice', 'InitialDirectCosts',
          'PrepaymentsBeforeCommencement', 'LeaseIncentives', 'IBR_Annual',
          'UsefulLifeYears', 'InsuranceSumInsured', 'InsuranceTPLimit'
        ];

        if (numericFields.includes(leaseKey)) {
          value = parseFloat(value);
          // Convert percentages if greater than 1
          if (['IBR_Annual', 'RenewalOptionLikelihood', 'FixedEscalationPct'].includes(leaseKey) && value > 1) {
            value = value / 100;
          }
        }

        // Handle boolean fields
        const booleanFields = [
          'TerminationReasonablyCertain', 'RVGReasonablyCertain',
          'PurchaseOptionReasonablyCertain', 'PrepaidFirstPayment',
          'LowValueExemption', 'ShortTermExemption', 'SeparateNonLeaseComponents'
        ];

        if (booleanFields.includes(leaseKey)) {
          const strValue = String(value).toLowerCase();
          value = strValue === 'true' || strValue === 'yes' || strValue === '1' || strValue === 'y';
        }

        // Handle date fields
        const dateFields = ['ContractDate', 'CommencementDate', 'EndDateOriginal', 'DeliveryDateLatest'];
        if (dateFields.includes(leaseKey)) {
          if (typeof value === 'number') {
            const date = XLSX.SSF.parse_date_code(value);
            value = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
          } else if (value instanceof Date) {
            value = value.toISOString().split('T')[0];
          }
        }

        // Handle banking/text fields - ensure they're strings
        const textFields = ['BankName', 'BankAccountName', 'BankAccountNo'];
        if (textFields.includes(leaseKey)) {
          value = String(value).trim();
        }

        leaseData[leaseKey] = value;
      }
    });

    if (!leaseData.PaymentFrequency) leaseData.PaymentFrequency = 'Monthly';
    if (!leaseData.PaymentTiming) leaseData.PaymentTiming = 'Advance';
    if (!leaseData.Currency) leaseData.Currency = 'NGN';

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

        // Debug: Log banking details for first row
        if (index === 0) {
          console.log('First row banking details:', {
            BankName: leaseData.BankName,
            BankAccountName: leaseData.BankAccountName,
            BankAccountNo: leaseData.BankAccountNo,
            rawRow: row
          });
        }

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

            <div className="flex gap-3">
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
              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Template
              </Button>
            </div>
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
          <div className="text-xs text-slate-600 mt-4 space-y-3">
            <div>
              <p className="font-semibold text-slate-900 mb-2">📋 All Available Columns (Headers for Excel File):</p>
              <p className="text-slate-600 mb-3 italic">Copy these headers exactly as shown below into your Excel file's first row. Order doesn't matter - the system will auto-map them.</p>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">✅ Required Columns (Must be present):</p>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                <code className="text-xs">
                  Contract ID | Lessee Entity | Lessor Name | Asset Class | Asset Description | Contract Date | Commencement Date | Original End Date | Non-cancellable Years | Useful Life Years | Fixed Payment Per Period | Currency | Payment Frequency | Payment Timing | IBR Annual
                </code>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">⚙️ Optional Columns - Payment Details:</p>
              <div className="bg-slate-100 border border-slate-300 rounded p-3 mb-2">
                <code className="text-xs break-words">
                  Escalation Type | Base CPI | CPI Reset Month | First Reset Year Offset | Fixed Escalation Pct | Initial Direct Costs | Prepayments Before Commencement | Lease Incentives | Prepaid First Payment | Bank Name | Bank Account Name | Bank Account No
                </code>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">⚙️ Optional Columns - Advanced Options:</p>
              <div className="bg-slate-100 border border-slate-300 rounded p-3 mb-2">
                <code className="text-xs break-words">
                  Renewal Option Years | Renewal Likelihood | Termination Option Point | Termination Penalty Expected | Termination Reasonably Certain | Purchase Option Price | Purchase Option Reasonably Certain | RVG Expected | RVG Reasonably Certain | Variable Payments In Substance Fixed | Variable Payments Usage Expected | Low Value Exemption | Short Term Exemption | Separate Non Lease Components | Allocation Basis | FX Policy | Judgement Notes | Approval Signoff
                </code>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">⚙️ Optional Columns - Legal & Administrative (FULL mode):</p>
              <div className="bg-slate-100 border border-slate-300 rounded p-3 mb-2">
                <code className="text-xs break-words">
                  Lessor Jurisdiction | Lessee Jurisdiction | Lessor Address | Lessee Address | Lessor RC Number | Lessee RC Number | Asset Location | Delivery Date Latest | Risk Transfer Event | Insurance Sum Insured | Insurance TP Limit | Insurer Rating Min | Permitted Use | Move Restriction | Software License | Arbitration Rules | Seat Of Arbitration | Language | Governing Law | Lessor Signatory Title | Lessee Signatory Title
                </code>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 mb-2">🔧 Special Column:</p>
              <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-2">
                <code className="text-xs">
                  Mode
                </code>
                <p className="text-xs text-slate-600 mt-1">Value: MINIMAL or FULL (overrides default mode for specific rows)</p>
              </div>
            </div>

            <div className="border-t pt-3 mt-3">
              <p className="font-semibold text-slate-900 mb-2">📝 Data Format Notes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                <li><strong>Dates:</strong> Use YYYY-MM-DD format or Excel date numbers</li>
                <li><strong>Numbers:</strong> No currency symbols or commas (e.g., 25000000 not ₦25,000,000)</li>
                <li><strong>Percentages:</strong> Can use decimal (0.14) or whole number (14) - both work</li>
                <li><strong>Booleans:</strong> Use TRUE/FALSE, YES/NO, 1/0, or Y/N</li>
                <li><strong>Text:</strong> Any text value is accepted</li>
              </ul>
            </div>
          </div>
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
