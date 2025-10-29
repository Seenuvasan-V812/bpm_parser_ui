const processes=[
  {
    id: 'process_client_asset_transfer',
    name: 'Client Asset Transfer - Global Wealth Management',
    description: 'End-to-end global client asset transfer workflow ensuring KYC, AML, and compliance adherence.',
    entryPoint: 'START_EVENT_001',
    exitPoint: 'END_EVENT_001',
    reference: 'PROC_CLIENT_ASSET_TRANSFER_GLOBAL',
    confidence: 0.97,
    nodes: [
      {
        id: 'START_EVENT_001',
        type: 'startEvent',
        data: {
          label: 'Start Asset Transfer Request',
          attributes: [
            'Client submits request via RM/portal/email/form',
            'Regulatory: KYC',
            'lane: Client'
          ]
        }
      },
      {
        id: 'TASK_001',
        type: 'entity',
        data: {
          label: 'Capture and Log Client Instruction',
          attributes: [
            'Lane: Relationship Manager (RM)',
            'Risk: Medium',
            'Action: Generate CRM reference'
          ]
        }
      },
      {
        id: 'TASK_002',
        type: 'decision',
        data: {
          label: 'Validate Instruction Eligibility',
          attributes: [
            'Lane: Ops Intake Analyst',
            'Risk: High',
            'Checks: account, balance, sanctions'
          ],
          decision_reason: 'Has conditional and exception outgoing flows (Eligibility Confirmed vs Incomplete Info)'
        }
      },
      {
        id: 'TASK_003',
        type: 'entity',
        data: {
          label: 'KYC/AML & Regulatory Compliance Confirmation',
          attributes: [
            'Lane: Compliance Officer',
            'Risk: Critical',
            'Regulation: AML/KYC'
          ]
        }
      },
      {
        id: 'TASK_004',
        type: 'entity',
        data: {
          label: 'Asset Valuation & Feasibility',
          attributes: [
            'Lane: Ops Specialist',
            'System-based',
            'Verifies: holdings, price, liquidity'
          ]
        }
      },
      {
        id: 'TASK_005',
        type: 'entity',
        data: {
          label: 'Counterparty Coordination & Booking',
          attributes: [
            'Lane: Settlement Specialist',
            'Risk: High',
            'Validates: SWIFT/BIC details'
          ]
        }
      },
      {
        id: 'TASK_006',
        type: 'decision',
        data: {
          label: 'Settlement & Reconciliation',
          attributes: [
            'Lane: Reconciliation Team',
            'Risk: High',
            'Handles failed/partial settlements'
          ],
          decision_reason: 'Conditional path for failed/partial settlement (reprocess) exists'
        }
      },
      {
        id: 'TASK_007',
        type: 'entity',
        data: {
          label: 'Post-Transfer Client Notification',
          attributes: [
            'Lane: Relationship Manager (RM)',
            'Risk: Low',
            'Ensures notification accuracy'
          ]
        }
      },
      {
        id: 'TASK_008',
        type: 'entity',
        data: {
          label: 'Record Archival & Audit Trail',
          attributes: [
            'Lane: Audit Controller',
            'Risk: Medium',
            'Validates retention policy'
          ]
        }
      },
      {
        id: 'END_EVENT_001',
        type: 'endEvent',
        data: {
          label: 'Close Transfer Case',
          attributes: [
            'Archive reference generated',
            'Regulatory: Record Retention'
          ]
        }
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'START_EVENT_001',
        target: 'TASK_001',
        label: 'Client Initiated',
        meta: { flow_type: 'sequence', conditional: false, exception: false }
      },
      {
        id: 'e2',
        source: 'TASK_001',
        target: 'TASK_002',
        label: 'Instruction Logged',
        meta: { flow_type: 'sequence', conditional: false, exception: false }
      },
      {
        id: 'e3',
        source: 'TASK_002',
        target: 'TASK_003',
        label: 'Eligibility Confirmed',
        meta: { flow_type: 'conditional', conditional: true, exception: false, regulatory_exception_flag: false }
      },
      {
        id: 'e4',
        source: 'TASK_002',
        target: 'TASK_001',
        label: 'Incomplete / Missing Info - Return to RM',
        meta: {
          flow_type: 'exception_path',
          conditional: false,
          exception: true,
          failedRoute: true,
          description: 'Exception route: return to RM for missing/incomplete info'
        }
      },
      {
        id: 'e5',
        source: 'TASK_003',
        target: 'TASK_004',
        label: 'Compliance Cleared',
        meta: { flow_type: 'sequence', conditional: false, exception: false, regulatory_exception_flag: false }
      },
      {
        id: 'e6',
        source: 'TASK_004',
        target: 'TASK_005',
        label: 'Feasibility Confirmed',
        meta: { flow_type: 'sequence', conditional: false, exception: false }
      },
      {
        id: 'e7',
        source: 'TASK_005',
        target: 'TASK_006',
        label: 'Booking Completed',
        meta: { flow_type: 'sequence', conditional: false, exception: false }
      },
      {
        id: 'e8',
        source: 'TASK_006',
        target: 'TASK_006',
        label: 'Failed or Partial Settlement - Reprocess',
        meta: {
          flow_type: 'conditional',
          conditional: true,
          exception: false,
          description: 'Failed/partial settlement path triggers reprocess'
        }
      },
      {
        id: 'e9',
        source: 'TASK_006',
        target: 'TASK_007',
        label: 'Settlement Confirmed',
        meta: { flow_type: 'sequence', conditional: false, exception: false }
      },
      {
        id: 'e10',
        source: 'TASK_007',
        target: 'TASK_008',
        label: 'Notification Sent',
        meta: { flow_type: 'sequence', conditional: false, exception: false }
      },
      {
        id: 'e11',
        source: 'TASK_008',
        target: 'END_EVENT_001',
        label: 'Archival Completed',
        meta: { flow_type: 'sequence', conditional: false, exception: false }
      }
    ]
  }
]


export default processes;


