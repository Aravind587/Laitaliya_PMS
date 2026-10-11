export type TaskStatus = 
  | 'Not Yet Started'
  | 'Work In Progress'
  | 'Completed'
  | 'Pending'
  | 'Rechecking';

export type ProjectStage = 
  | 'Sales Phase'
  | 'Design Phase'
  | 'False Ceiling Phase'
  | 'Civil Works Phase'
  | 'Site Manual Finishing Phase'
  | 'Production Phase'
  | 'Modular Assembly Phase'
  | 'Kitchen Workflow'
  | 'Finishing Flow';

export type KitchenModel = 'Dry Kitchen' | 'Wet Kitchen' | 'Utility Kitchen';

export type UserRole = 'admin' | 'site-manager';

export interface StageStepDetail {
  stepNumber: number;
  name: string;
  shortName: string;
  tradeOrTeam: string;
  objective: string;
  deliverables: string;
  focus?: string;
  action?: string;
  goal?: string;
  keyActions?: string[];
  exitGate?: string;
}

export interface StageMetadata {
  id: ProjectStage;
  phaseNumber: number;
  name: string;
  shortName: string;
  icon: string;
  subSteps: string[];
  flowSummary: string;
  description: string;
  asciiFlowDiagram?: string;
  steps: StageStepDetail[];
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  stage: ProjectStage;
  subStep?: string;
  kitchenModel?: KitchenModel;
  name: string;
  status: TaskStatus;
  dueDate: string;
  assignedToName?: string;
  assignedToId?: string;
  remarks?: string;
  lastUpdated?: string;
  isForgotten?: boolean;
  overdueDays?: number;
  noUpdateDays?: number;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  siteManagerId: string;
  siteManagerName: string;
  startDate: string;
  endDate: string;
  status: 'In Progress' | 'Pending' | 'Completed' | 'Overdue';
  description?: string;
  budget?: string;
  kitchenModel?: KitchenModel;
  stages: ProjectStage[];
  progressPercent: number;
  filesCount?: number;
}

export interface User {
  id: string;
  name: string;
  role: 'Site Manager' | 'Admin' | 'Interior Designer';
  email: string;
  password?: string;
  phone: string;
  status: 'Active' | 'Inactive';
  avatarBg?: string;
  assignedProjectsCount: number;
}

export interface LoginLogEntry {
  id: string;
  timestamp: string;
  formattedDate: string;
  role: 'admin' | 'site-manager';
  userName: string;
  email: string;
  password?: string;
  status: 'SUCCESS' | 'FAILED';
  loginMethod: string;
  ipAddress?: string;
  device?: string;
}

export interface NotificationItem {
  id: string;
  type: 'overdue' | 'no_update' | 'status_updated' | 'info';
  title: string;
  subtitle: string;
  timeAgo: string;
  read: boolean;
  projectId?: string;
  taskId?: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: 'cad' | 'render' | 'pdf' | 'photo';
  size: string;
  uploadedAt: string;
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; desc: string; color: string; bg: string; border: string; dotColor: string }> = {
  'Not Yet Started': {
    label: 'Not Yet Started',
    desc: 'Task not started yet',
    color: '#475569',
    bg: '#F1F5F9',
    border: '#CBD5E1',
    dotColor: '#94A3B8'
  },
  'Work In Progress': {
    label: 'Work In Progress',
    desc: 'Task is in progress',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    dotColor: '#2563EB'
  },
  'Completed': {
    label: 'Completed',
    desc: 'Task finished',
    color: '#15803D',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    dotColor: '#16A34A'
  },
  'Pending': {
    label: 'Pending',
    desc: 'Waiting for approval or materials',
    color: '#B45309',
    bg: '#FFFBEB',
    border: '#FDE68A',
    dotColor: '#F59E0B'
  },
  'Rechecking': {
    label: 'Rechecking',
    desc: 'Being reviewed again',
    color: '#7E22CE',
    bg: '#FAF5FF',
    border: '#E9D5FF',
    dotColor: '#9333EA'
  }
};

export const PROJECT_STAGES: ProjectStage[] = [
  'Sales Phase',
  'Design Phase',
  'False Ceiling Phase',
  'Civil Works Phase',
  'Site Manual Finishing Phase',
  'Production Phase',
  'Modular Assembly Phase',
  'Kitchen Workflow',
  'Finishing Flow'
];

export const STAGES_METADATA: Record<ProjectStage, StageMetadata> = {
  'Sales Phase': {
    id: 'Sales Phase',
    phaseNumber: 1,
    name: 'Sales Phase',
    shortName: 'Sales',
    icon: '💼',
    subSteps: [
      'Lead Capture & Initial Contact',
      'Initial Presentation / Demo',
      'Scope Alignment',
      'Rough Quotation',
      'Token Amount Request',
      'Handover & Kickoff'
    ],
    flowSummary: 'Lead Capture ➔ Demo ➔ Scope Alignment ➔ Rough Quote ➔ Token Request ➔ Handover & Kickoff',
    description: 'Initial client acquisition, customized presentation, scope alignment, rough estimate calculation, token booking, and handover to project execution.',
    asciiFlowDiagram: `[ Lead Capture & Initial Contact ] ➔ [ Initial Presentation / Demo ] ➔ [ Scope Alignment ]
                                                                             │
[ Handover & Kickoff ] ◄─ [ Token Amount Request ] ◄─ [ Rough Quotation ] ◄──┘`,
    steps: [
      {
        stepNumber: 1,
        name: 'Lead Capture & Initial Contact',
        shortName: 'Lead Capture',
        tradeOrTeam: 'Sales Desk / CRM Lead',
        objective: 'Perform 5-10 min discovery call to qualify budget, timeline, and core requirements',
        deliverables: 'Qualified CRM Record, Client Brief Sheet, Budget Fit Matrix',
        action: 'Receive lead in CRM, assign to sales representative, and initiate contact within 1–4 hours.',
        goal: 'Perform a 5 to 10-minute discovery call to qualify budget, timeline, and core requirements.',
        focus: 'Rapid response time and structured client qualification.',
        keyActions: [
          'Receive incoming inquiry into CRM and route to designated sales representative.',
          'Initiate phone call or WhatsApp outreach within 1–4 hours of lead capture.',
          'Conduct 5–10 minute discovery call evaluating floor area, target timeline, and budget parameters.'
        ],
        exitGate: 'Lead qualified with core requirements and site location logged in system.'
      },
      {
        stepNumber: 2,
        name: 'Initial Presentation / Demo',
        shortName: 'Presentation & Demo',
        tradeOrTeam: 'Design Consultant / Sales Lead',
        objective: 'Demonstrate clear value and get agreement from client to move to cost estimation',
        deliverables: 'Tailored Presentation Deck, Finishes Board Demo, Client Consensus Note',
        action: 'Present product or service capabilities customized to the prospect\'s industry and pain points.',
        goal: 'Demonstrate clear value and get agreement from the client to move to cost estimation.',
        focus: 'Value communication and portfolio alignment.',
        keyActions: [
          'Host in-person or virtual walkthrough demonstrating company portfolio and executed turnkey interiors.',
          'Address client specific aesthetic preferences (Contemporary, Minimalist, Classic luxury).',
          'Secure client verbal agreement to proceed into preliminary cost estimation.'
        ],
        exitGate: 'Client confirms interest and agrees to advance to cost estimation stage.'
      },
      {
        stepNumber: 3,
        name: 'Scope Alignment',
        shortName: 'Scope Alignment',
        tradeOrTeam: 'Sales Lead / Project Estimator',
        objective: 'Ensure client expectations match what will be quoted in initial proposal',
        deliverables: 'Preliminary Scope Document, Room-by-Room Deliverables List, Assumptions Memo',
        action: 'Summarize meeting takeaways and outline key project deliverables, assumptions, and constraints.',
        goal: 'Ensure client expectations match what will be quoted in the initial proposal.',
        focus: 'Preventing scope creep and aligning boundary conditions.',
        keyActions: [
          'Compile structured summary of all discussed spaces (Living, Kitchen, Master Bed, Wardrobes).',
          'Document project constraints, structural assumptions, and client supplied exclusions.',
          'Validate scope boundaries with client prior to drafting commercial quote.'
        ],
        exitGate: 'Scope alignment document signed off or formally acknowledged by client.'
      },
      {
        stepNumber: 4,
        name: 'Rough Quotation',
        shortName: 'Rough Quotation',
        tradeOrTeam: 'Estimation Team / Sales Manager',
        objective: 'Validate financial fit before spending resources on deep technical scope documents',
        deliverables: 'Preliminary Rough Estimate BOQ, Stage Payment Matrix, High-level Phasing Plan',
        action: 'Send a preliminary, non-binding quote (Rough Estimate) detailing high-level costs and project phases.',
        goal: 'Validate financial fit before spending resources on deep technical scope documents.',
        focus: 'Transparent financial pricing and phase milestones.',
        keyActions: [
          'Compute high-level cost breakdown based on room sizes and modular joinery volumes.',
          'Issue formal Rough Quotation document with phased pricing and delivery milestones.',
          'Review pricing with client to confirm commercial feasibility and payment comfort.'
        ],
        exitGate: 'Rough estimate approved by client without commercial deadlock.'
      },
      {
        stepNumber: 5,
        name: 'Token Amount Request',
        shortName: 'Token Booking',
        tradeOrTeam: 'Finance Desk / Sales Head',
        objective: 'Lock in client commitment and prioritize their project slot',
        deliverables: 'Letter of Intent (LOI), Token Payment Receipt, Priority Slot Allocation',
        action: 'Ask for a token amount/booking deposit (e.g., 5%–10% or fixed deposit) along with a basic Letter of Intent (LOI).',
        goal: 'Lock in client commitment and prioritize their project slot.',
        focus: 'Formal engagement and deposit realization.',
        keyActions: [
          'Prepare and issue official Letter of Intent (LOI) with project booking terms.',
          'Request and receive 5%–10% token deposit (or fixed booking amount) via bank transfer.',
          'Issue verified payment receipt and allocate project code in company master roster.'
        ],
        exitGate: 'Token payment realized and signed Letter of Intent on file.'
      },
      {
        stepNumber: 6,
        name: 'Handover & Kickoff',
        shortName: 'Handover & Kickoff',
        tradeOrTeam: 'Sales Lead ➔ Project Execution Team',
        objective: 'Transition smoothly from sales to execution',
        deliverables: 'Confirmation Receipt, Draft SOW, Kickoff Meeting Minutes, Assigned PM/Designer Dossier',
        action: 'Issue confirmation receipt, begin formal Scope of Work (SOW) drafting, and introduce the delivery team.',
        goal: 'Transition smoothly from sales to execution.',
        focus: 'Frictionless handoff to design and execution teams.',
        keyActions: [
          'Issue official booking confirmation receipt to client.',
          'Initiate formal Scope of Work (SOW) drafting with technical specifications.',
          'Introduce dedicated Project Manager and Lead Interior Designer to client in formal kickoff call.'
        ],
        exitGate: 'Sales-to-Ops handoff meeting completed; Phase 2 (Design) formally opened.'
      }
    ]
  },
  'Design Phase': {
    id: 'Design Phase',
    phaseNumber: 2,
    name: 'Design Phase',
    shortName: 'Design',
    icon: '📐',
    subSteps: [
      'Site Measurements',
      'Initial 3D Design',
      'Selections',
      'Final 3D Design',
      'Site Validation',
      'Final 2D / Production Drawings',
      'KT to Execution Team'
    ],
    flowSummary: 'Site Measurements ➔ Initial 3D ➔ Selections ➔ Final 3D ➔ Site Validation ➔ 2D Drawings ➔ KT to Execution',
    description: 'Site measurements, conceptual 3D layouts, material & hardware selections, photorealistic final 3D renders, site MEP validation, final 2D production drawings, and KT handoff to execution.',
    asciiFlowDiagram: `[ Site Measurements ] ➔ [ Initial 3D Design ] ➔ [ Material & Finish Selections ]
                                                              │
[ KT to Execution Team ] ◄─ [ Final 2D / Production Drawings ] ◄─ [ Site Validation ] ◄─ [ Final 3D Design ]`,
    steps: [
      {
        stepNumber: 1,
        name: 'Site Measurements',
        shortName: 'Site Survey',
        tradeOrTeam: 'Surveyor / Technical Designer',
        objective: 'Capture accurate physical dimensions & site conditions',
        deliverables: 'As-built site dimensions, beam/column locations, utility points',
        focus: 'Precision millimeter laser survey across all walls, slab levels, and beam depths.',
        keyActions: [
          'Execute comprehensive laser distance measurements of all rooms and alcoves.',
          'Map beam drops, column jogs, wall out-of-plumb deviations, and slab ceiling heights.',
          'Record existing plumbing inlets, drain traps, electrical distribution boxes, and gas conduit lines.'
        ],
        exitGate: 'Verified as-built site CAD survey drawing logged.'
      },
      {
        stepNumber: 2,
        name: 'Initial 3D Design',
        shortName: 'Initial 3D Design',
        tradeOrTeam: 'Interior Architect / 3D Designer',
        objective: 'Concept visualization & spatial layout planning',
        deliverables: 'Conceptual 3D views, spatial flow, tentative color schemes',
        focus: 'Spatial layout planning, circulation pathways, and ergonomics.',
        keyActions: [
          'Build volumetric 3D models representing rooms and furniture zoning.',
          'Develop spatial flow concepts, partition layouts, and ceiling height drops.',
          'Review 3D conceptual drafts with client to freeze spatial configuration.'
        ],
        exitGate: 'Conceptual 3D layout signed off by client.'
      },
      {
        stepNumber: 3,
        name: 'Selections',
        shortName: 'Selections',
        tradeOrTeam: 'Design Consultant / Material Specialist',
        objective: 'Finalize materials, finishes, fixtures, & hardware',
        deliverables: 'Material board sign-off (laminates, veneers, fabrics, hardware)',
        focus: 'Physical material moodboards, texture tactile selection, and branded hardware specifications.',
        keyActions: [
          'Curate physical sample tray with laminates, smoked veneers, quartz slabs, and metal trims.',
          'Select hardware mechanisms (soft-close hinges, tandem boxes, bottle pull-outs, concealed channels).',
          'Obtain client physical signature on approved material spec sheet and code book.'
        ],
        exitGate: 'Material board sign-off sheet approved with vendor codes.'
      },
      {
        stepNumber: 4,
        name: 'Final 3D Design',
        shortName: 'Final 3D Design',
        tradeOrTeam: 'Senior 3D Visualizer',
        objective: 'High-precision visualization based on selected materials',
        deliverables: 'Photorealistic final 3D renders with exact materials applied',
        focus: 'Exact texture mapping, photometric lighting simulation, and hyper-realistic rendering.',
        keyActions: [
          'Apply exact client-approved veneers, laminates, marbles, and profile lighting in 3D scene.',
          'Render ultra-high-resolution photorealistic views for every living zone and bedroom.',
          'Present final 3D package to client for conclusive aesthetic approval.'
        ],
        exitGate: 'Photorealistic final 3D renders formally approved by client.'
      },
      {
        stepNumber: 5,
        name: 'Site Validation',
        shortName: 'Site Validation',
        tradeOrTeam: 'Project Manager / Site Engineer',
        objective: 'Re-verify site conditions against the approved design',
        deliverables: 'On-site markup/check for plumbing, electrical, and structural fit',
        focus: 'Physical on-site overlay checking MEP alignments, wall plumb, and civil tolerances.',
        keyActions: [
          'Transfer approved design coordinates onto site walls using laser marking tools.',
          'Verify plumbing trap coordinates and electrical backbox cutouts against proposed cabinetry.',
          'Check structural clearances for false ceiling drops, beam claddings, and door swings.'
        ],
        exitGate: 'Site validation checklist executed; zero on-site geometric clashes.'
      },
      {
        stepNumber: 6,
        name: 'Final 2D / Production Drawings',
        shortName: 'Final 2D Drawings',
        tradeOrTeam: 'Technical CAD Team',
        objective: 'Prepare technical drawings for factory/site manufacturing',
        deliverables: 'Working drawings (elevations, sections, electrical, plumbing layouts)',
        focus: 'Good-for-Construction (GFC) drawings with 1:10 joinery details.',
        keyActions: [
          'Prepare detailed elevations, sectional details, and carcass assembly layouts in CAD.',
          'Generate MEP coordinated layouts (ceiling electrical, wall chasing, plumbing points).',
          'Complete bill of quantities (BOQ) dimensional references.'
        ],
        exitGate: 'Complete stamped GFC 2D Production Drawing Package released.'
      },
      {
        stepNumber: 7,
        name: 'KT to Execution Team',
        shortName: 'KT to Execution Team',
        tradeOrTeam: 'Design Team ➔ PM & Site Supervisors',
        objective: 'Knowledge transfer to project managers & site supervisors',
        deliverables: 'Design handoff meeting, drawing pack sign-off, execution briefing',
        focus: 'Structured handoff meeting, drawing pack sign-off, and execution briefing.',
        keyActions: [
          'Convene formal KT handover session between lead designer, project manager, and site supervisor.',
          'Review critical architectural tolerances, material grain directions, and client nuances.',
          'Formally sign off and hand over stamped drawing binders to site operations.'
        ],
        exitGate: 'KT sign-off agreement signed; drawing package transferred to factory & site.'
      }
    ]
  },
  'Production Phase': {
    id: 'Production Phase',
    phaseNumber: 6,
    name: 'Production Phase',
    shortName: 'Production',
    icon: '🏭',
    subSteps: [
      'Drawing Forwarded to Factory',
      'Factory Cutlist Generation',
      'R1 (PO) Review',
      'R2 (PO) Recheck',
      'Production Approval',
      'Material List Generation',
      'Material Availability Check',
      'Material Procurement',
      'Production Start'
    ],
    flowSummary: 'Drawing Forwarded ➔ Cutlist Gen ➔ R1 Review ➔ R2 Recheck ➔ Approval ➔ Material List (BOM) ➔ Availability Check ➔ Procurement ➔ Production Start',
    description: 'Factory drawing handover, cutlist optimization, R1 PM check, R2 engineering QA, management PO approval, BOM generation, warehouse audit, procurement, and CNC factory production start.',
    asciiFlowDiagram: `[ Drawing Forwarded to Factory ] ➔ [ Factory Cutlist Generation ] ➔ [ R1 (PO) Review - PM ]
                                                                             │
[ Production Start ] ◄─ [ Material Procurement ] ◄─ [ Material Availability Check ] ◄─ [ Material List Generation ] ◄─ [ Approval ] ◄─ [ R2 (PO) Recheck ]`,
    steps: [
      {
        stepNumber: 1,
        name: 'Drawing Forwarded to Factory',
        shortName: 'Drawing Forwarded',
        tradeOrTeam: 'Design / Technical Team',
        objective: 'Hand over approved 2D/production drawings to factory',
        deliverables: 'Approved Production Drawing Package',
        focus: 'Seamless transfer of approved designs from the design office to factory operations.',
        keyActions: [
          'Design team uploads/sends final GFC 2D drawings, elevations, and specifications.',
          'Factory team logs the incoming drawing packet and verifies drawing completeness.'
        ],
        exitGate: 'Drawing intake confirmed by factory technical office.'
      },
      {
        stepNumber: 2,
        name: 'Factory Cutlist Generation',
        shortName: 'Cutlist Generation',
        tradeOrTeam: 'Factory Technical Team',
        objective: 'Convert 2D drawings into precise panel cutlists & hardware counts',
        deliverables: 'Draft Cutlist & Hardware Breakdown',
        focus: 'Translating architectural drawings into manufacturing dimensions.',
        keyActions: [
          'Factory engineers break down joinery and cabinetry into individual panel sizes, edge-banding specifications, and hardware needs.',
          'Generate the initial panel optimization layout to minimize sheet waste.'
        ],
        exitGate: 'Initial Cutlist & Hardware Schedule prepared.'
      },
      {
        stepNumber: 3,
        name: 'R1 (PO) Review',
        shortName: 'R1 (PO) Review',
        tradeOrTeam: 'Project Manager (PM)',
        objective: 'First-level technical & quantity verification against site specs',
        deliverables: 'R1 Reviewed Cutlist with Feedback/Corrections',
        focus: 'Project Manager checks cutlist accuracy against actual site realities.',
        keyActions: [
          'PM cross-references cutlist panel dimensions against validated site measurements.',
          'Verify edge-tape colors, laminate codes, and specific client requirements.',
          'Highlight discrepancies and request revisions if needed.'
        ],
        exitGate: 'R1 Cutlist markup & PM verification completed.'
      },
      {
        stepNumber: 4,
        name: 'R2 (PO) Recheck',
        shortName: 'R2 (PO) Recheck',
        tradeOrTeam: 'Senior Technical Lead / PM',
        objective: 'Second-level verification to prevent material wastage & errors',
        deliverables: 'Final Checked Cutlist',
        focus: 'Quality assurance and error prevention prior to formal approval.',
        keyActions: [
          'Perform a thorough recheck of corrected cutlist items, sheet yield optimization, and critical grain direction specs.',
          'Confirm that all R1 corrections have been properly incorporated.'
        ],
        exitGate: 'Fully verified and error-free Cutlist.'
      },
      {
        stepNumber: 5,
        name: 'Production Approval',
        shortName: 'Production Approval',
        tradeOrTeam: 'Management / Ops Head',
        objective: 'Sign off on validated cutlists to authorise procurement',
        deliverables: 'Approved Production Order (PO Sign-Off)',
        focus: 'Formal authorization to trigger material allocation and procurement.',
        keyActions: [
          'Authorized Lead / Factory Head approves the final verified cutlist package.',
          'Lock the design and cutlist to prevent mid-production changes without formal Change Requests (CR).'
        ],
        exitGate: 'Signed Production Order (PO Approval).'
      },
      {
        stepNumber: 6,
        name: 'Material List Generation',
        shortName: 'Material List (BOM)',
        tradeOrTeam: 'Factory Purchase / Estimator',
        objective: 'Generate Bill of Materials (BOM) based on approved cutlist',
        deliverables: 'Bill of Materials (BOM) / Requisition Sheet',
        focus: 'Converting approved cutlists into a complete Bill of Materials.',
        keyActions: [
          'Calculate total board count (plywood, MDF, particle board), laminate/veneer sheets, edge bands, adhesives, and hardware (hinges, channels, handles).',
          'Consolidate into a comprehensive Material Requisition Sheet.'
        ],
        exitGate: 'Generated Bill of Materials (BOM).'
      },
      {
        stepNumber: 7,
        name: 'Material Availability Check',
        shortName: 'Stock Availability Check',
        tradeOrTeam: 'Warehouse / Store Manager',
        objective: 'Audit current stock against required BOM',
        deliverables: 'Inventory Audit Report (In-Stock vs. Shortfall)',
        focus: 'In-house inventory verification.',
        keyActions: [
          'Store Manager checks existing factory warehouse stock against the BOM.',
          'Reserve available in-house materials for this specific job order.',
          'Identify exact shortfalls requiring external purchasing.'
        ],
        exitGate: 'Material Audit Report identifying In-Stock items vs. Procurement needs.'
      },
      {
        stepNumber: 8,
        name: 'Material Procurement',
        shortName: 'Material Procurement',
        tradeOrTeam: 'Procurement Team',
        objective: 'Purchase required raw materials, hardware, and finishes',
        deliverables: 'Purchase Orders Issued & Goods Received Note (GRN)',
        focus: 'Purchasing non-available raw materials and specialized hardware.',
        keyActions: [
          'Issue Purchase Orders (POs) to suppliers for required shortfalls.',
          'Track material delivery timelines to align with production schedules.',
          'Receive materials at factory store and perform Quality Check (QC) upon arrival.'
        ],
        exitGate: 'All required project materials received and stored in production bay.'
      },
      {
        stepNumber: 9,
        name: 'Production Start',
        shortName: 'Production Start',
        tradeOrTeam: 'Factory Production Supervisor',
        objective: 'Issue materials to the shop floor and commence manufacturing',
        deliverables: 'Job Card Issued & Cutting/Assembly Underway',
        focus: 'Manufacturing execution on the shop floor.',
        keyActions: [
          'Issue Job Cards and cutlists to CNC/cutting machine operators.',
          'Release allocated raw materials to the cutting floor.',
          'Begin panel cutting, edge-banding, routing, drilling, and assembly.'
        ],
        exitGate: 'Active Production Status (Job Card in Execution).'
      }
    ]
  },
  'False Ceiling Phase': {
    id: 'False Ceiling Phase',
    phaseNumber: 3,
    name: 'False Ceiling Phase',
    shortName: 'Ceiling',
    icon: '🏗️',
    subSteps: [
      'Floor Protection',
      'Framing & Channeling',
      'Thermal Insulation',
      'Electrical Wiring',
      'AC Copper Piping',
      'Ceiling Woodwork',
      'Board Fixing',
      'Painting Sub-tasks',
      'Final Electrical Fitting',
      'Site Cleaning'
    ],
    flowSummary: 'Floor Protection ➔ Framing ➔ Insulation ➔ Wiring ➔ AC Piping ➔ Woodwork ➔ Board Fixing ➔ Painting ➔ Electrical Fitting ➔ Site Cleaning',
    description: 'Floor protection, perimeter GI channeling, rockwool acoustic insulation, flexible conduit wiring, AC copper & drain lines, ceiling wooden coves, gypsum board fixing, joint putty painting, fixture mounting, and debris cleanup.',
    asciiFlowDiagram: `[ Floor Protection ] ➔ [ Framing & Channeling ] ➔ [ Thermal Insulation ] ➔ [ Electrical Wiring ] ➔ [ AC Copper Piping ]
                                                                                                        │
[ Site Cleaning ] ◄─ [ Final Electrical Fitting ] ◄─ [ Painting Works ] ◄─ [ Board Fixing ] ◄─ [ Ceiling Woodwork ]`,
    steps: [
      {
        stepNumber: 1,
        name: 'Floor Protection',
        shortName: 'Floor Protection',
        tradeOrTeam: 'Site Operations',
        objective: 'Safeguard finished floors against scratches & debris',
        deliverables: 'Protective sheet/Gypsum board covering',
        focus: 'Preventing damage to existing flooring (tile, marble, or wood).',
        keyActions: [
          'Clean floor area to remove existing grit and dust.',
          'Lay down thick corrugated sheets, bubble wrap, or heavy-duty protection materials.',
          'Secure all sheet seams with heavy tape to avoid shifting during work.'
        ],
        exitGate: 'Floor fully covered and secured.'
      },
      {
        stepNumber: 2,
        name: 'Framing & Channeling',
        shortName: 'Framing & Channeling',
        tradeOrTeam: 'Ceiling Fabricator',
        objective: 'Install metal grid framework for ceiling support',
        deliverables: 'Levelled perimeter & main GI grid structure',
        focus: 'Setting up the structural framework of the false ceiling.',
        keyActions: [
          'Transfer ceiling levels using laser markers or water levels.',
          'Fix perimeter channels along walls at the target finished level.',
          'Suspend main channels and intermediate channels from true ceiling slab using soffit cleats and fasteners.'
        ],
        exitGate: 'Rigid, level metal grid framework established.'
      },
      {
        stepNumber: 3,
        name: 'Thermal Insulation',
        shortName: 'Thermal Insulation',
        tradeOrTeam: 'Insulation Specialist',
        objective: 'Install sound/heat insulation layer in grid cavity',
        deliverables: 'Rockwool / Glasswool insulation laid in place',
        focus: 'Enhancing thermal resistance and acoustic damping.',
        keyActions: [
          'Lay rockwool, glasswool, or nitrile foam rolls/slabs over the metal framework.',
          'Ensure uniform coverage with zero gaps across target zones.'
        ],
        exitGate: 'Insulation layer securely placed above the grid frame.'
      },
      {
        stepNumber: 4,
        name: 'Electrical Wiring',
        shortName: 'Electrical Wiring',
        tradeOrTeam: 'Electrical Team',
        objective: 'Lay ceiling conduits and pull electrical cables',
        deliverables: 'Conduits secured & wire drop-points created',
        focus: 'Routing electrical cables for lighting, fans, and automation.',
        keyActions: [
          'Lay flexible PVC conduits across the framework.',
          'Pull wires through conduits to pre-mapped light points, fan hooks, and LED profile channels.',
          'Leave sufficient loop lengths at each fixture point.'
        ],
        exitGate: 'All ceiling electrical lines pulled and safely isolated.'
      },
      {
        stepNumber: 5,
        name: 'AC Copper Piping',
        shortName: 'AC Copper Piping',
        tradeOrTeam: 'HVAC Technician',
        objective: 'Route refrigerant lines and drain pipes for AC units',
        deliverables: 'Pressure-tested AC copper lines & drain outlets',
        focus: 'HVAC line routing prior to closing the ceiling.',
        keyActions: [
          'Route copper refrigerant lines, communication cables, and condensate drain pipes.',
          'Insulate copper pipes properly to prevent internal condensation leaks.',
          'Conduct pressure testing on copper lines to ensure zero leaks.'
        ],
        exitGate: 'AC piping installed, insulated, and pressure-verified.'
      },
      {
        stepNumber: 6,
        name: 'Ceiling Woodwork',
        shortName: 'Ceiling Woodwork',
        tradeOrTeam: 'Carpenter / Interior Team',
        objective: 'Install wooden features, coves, or paneling structures',
        deliverables: 'Wooden framing/coving support ready for board',
        focus: 'Structural backing for wooden panels, rafters, or decorative coves.',
        keyActions: [
          'Construct wooden battens/plywood frames for decorative elements or heavier hanging fixtures.',
          'Treat timber with anti-termite coating if solid wood/plywood is used.'
        ],
        exitGate: 'Wooden features and cove structural framing installed.'
      },
      {
        stepNumber: 7,
        name: 'Board Fixing',
        shortName: 'Board Fixing',
        tradeOrTeam: 'Ceiling Installer',
        objective: 'Mount gypsum, calcium silicate, or cement boards',
        deliverables: 'Screwed & aligned board ceiling surface',
        focus: 'Closing the ceiling with specified ceiling boards.',
        keyActions: [
          'Screw Gypsum, Calcium Silicate, or Fiber Cement boards onto the metal/wooden channels using drywall screws.',
          'Stagger board joints to prevent cracking; ensure flush alignments.',
          'Mark down electrical point locations on the underside of boards for reference.'
        ],
        exitGate: 'Fully boarded ceiling with smooth joints.'
      },
      {
        stepNumber: 8,
        name: 'Painting Sub-tasks',
        shortName: 'Painting Sub-tasks',
        tradeOrTeam: 'Painter / Finishing Team',
        objective: 'Achieve smooth, seamless ceiling surface & final color',
        deliverables: 'Joint taping, Putty, Primer, & Final Paint coats',
        focus: 'Achieving a seamless, blemish-free finish.',
        keyActions: [
          'Joint Taping & First Putty: Fill board joints with jointing compound and fiberglass tape.',
          'Putty Coats: Apply 2–3 thin coats of wall putty across the surface, sanding between coats for planarity.',
          'Primer: Apply a full coat of interior primer to seal putty and equalize absorption.',
          'Final Painting: Apply 2 final coats of ceiling emulsion paint via roller/spray.'
        ],
        exitGate: 'Smooth, painted ceiling surface.'
      },
      {
        stepNumber: 9,
        name: 'Final Electrical Fitting',
        shortName: 'Electrical Fitting',
        tradeOrTeam: 'Electrical Team',
        objective: 'Cut fixture openings & install light fittings',
        deliverables: 'COB lights, strip lights, & fan fittings mounted',
        focus: 'Mounting electrical fixtures and testing circuitry.',
        keyActions: [
          'Core-cut ceiling openings for spotlights, COBs, and profile lights using hole saws.',
          'Install driver units, connect fixtures, mount strip lights in coves, and attach fans/diffusers.',
          'Perform circuit testing and load checks.'
        ],
        exitGate: 'All lights, coves, and fixtures fully operational.'
      },
      {
        stepNumber: 10,
        name: 'Site Cleaning',
        shortName: 'Site Cleaning & Handover',
        tradeOrTeam: 'Housekeeping / Ops',
        objective: 'Clean ceiling surface, remove floor protection & debris',
        deliverables: 'Handover-ready site with clean ceiling & floors',
        focus: 'Restoring the site to pristine condition.',
        keyActions: [
          'Wipe down light fixtures, wooden trims, and air conditioning vents.',
          'Carefully peel off floor protection materials and vacuum floor surface.',
          'Collect and dispose of scrap boards, wire cut-offs, and painting debris.'
        ],
        exitGate: 'Clean, defect-free false ceiling ready for client sign-off.'
      }
    ]
  },
  'Civil Works Phase': {
    id: 'Civil Works Phase',
    phaseNumber: 4,
    name: 'Civil Works Phase',
    shortName: 'Civil Works',
    icon: '🧱',
    subSteps: [
      'Demolition',
      'Reconstruction',
      'Punning',
      'Plumbing Work',
      'Electrical Work'
    ],
    flowSummary: 'Demolition ➔ Reconstruction ➔ Punning ➔ Plumbing Work ➔ Electrical Work',
    description: 'Controlled demolition, masonry block reconstruction, plumb gypsum punning, concealed CPVC/UPVC plumbing pressure tests, and wall chasing with electrical back-box embedment.',
    asciiFlowDiagram: `[ Demolition ] ➔ [ Reconstruction / Masonry ] ➔ [ Punning / Plastering ] ➔ [ Plumbing Work ] ➔ [ Electrical Work ]`,
    steps: [
      {
        stepNumber: 1,
        name: 'Demolition',
        shortName: 'Demolition',
        tradeOrTeam: 'Demolition Crew',
        objective: 'Dismantle non-structural walls, tiles, and old fittings safely',
        deliverables: 'Cleared site & rubble/debris disposal',
        focus: 'Controlled dismantling and clearing of existing structures.',
        keyActions: [
          'Isolate utility supplies (turn off water main, isolate electrical circuits, cap gas lines).',
          'Dismantle old civil structures, non-load-bearing walls, floor tiles, and unwanted fittings.',
          'Bag debris and transport rubble off-site to designated dump zones.'
        ],
        exitGate: 'Clean, cleared site ready for new construction.'
      },
      {
        stepNumber: 2,
        name: 'Reconstruction',
        shortName: 'Reconstruction',
        tradeOrTeam: 'Masonry Team',
        objective: 'Build new layout walls, partitions, and structural bases',
        deliverables: 'Blockwork/brickwork walls & door/window frames set',
        focus: 'Erecting new wall layouts and spatial partitions as per design.',
        keyActions: [
          'Mark wall layouts on floors and ceilings using laser levels.',
          'Build brickwork or AAC blockwork walls with proper wall ties/curing.',
          'Install door lintels, window frames, and specialized niches/openings.'
        ],
        exitGate: 'Complete structural wall framework and partitions constructed.'
      },
      {
        stepNumber: 3,
        name: 'Punning',
        shortName: 'Punning / Plastering',
        tradeOrTeam: 'Plastering / Wall Team',
        objective: 'Apply smooth plaster/punning coat to align walls level',
        deliverables: 'Level, plumb, and smooth wall surfaces',
        focus: 'Creating perfectly level, plumb, and uniform wall surfaces.',
        keyActions: [
          'Apply cement plaster or Gypsum punning over brickwork/blockwork surfaces.',
          'Use aluminum straight-edges to align corners, edges, and wall planes to a true 90-degree right angle where required.',
          'Allow adequate curing time for plaster surfaces.'
        ],
        exitGate: 'Plumb, smooth, and crack-free wall surfaces.'
      },
      {
        stepNumber: 4,
        name: 'Plumbing Work',
        shortName: 'Plumbing Work',
        tradeOrTeam: 'Plumbing Team',
        objective: 'Core cutting, routing water supply, drainage & waste lines',
        deliverables: 'Pressure-tested plumbing lines & concealed traps',
        focus: 'Laying water supply, drainage, and sewage pipelines prior to wall closing.',
        keyActions: [
          'Make precision wall chases/grooves for concealed hot and cold water supply lines (CPVC/PPR).',
          'Lay waste water and sewage drainage pipes (UPVC/SWR) with proper drop gradients.',
          'Install concealed diverters, flush valves, and wall-hung toilet frames.',
          'Conduct hydro-static pressure testing to verify zero leaks before sealing grooves.'
        ],
        exitGate: 'Pressure-tested and approved concealed plumbing network.'
      },
      {
        stepNumber: 5,
        name: 'Electrical Work',
        shortName: 'Electrical Work',
        tradeOrTeam: 'Electrical Team',
        objective: 'Chase walls for conduits, fix switch boxes & pull wiring',
        deliverables: 'Wall conduits chased, back-boxes fixed & wired',
        focus: 'Laying electrical conduits and back-boxes for light, power, and automation points.',
        keyActions: [
          'Cut wall chases according to approved electrical layouts for light switches, power sockets, and DB boxes.',
          'Install heavy-duty PVC conduits inside wall chases and anchor them securely.',
          'Embed metal or PVC wall back-boxes flush with the punned wall level.',
          'Pull electrical wiring through conduits and leave circuit loops for final fixtures.'
        ],
        exitGate: 'Wall conduits sealed, back-boxes set, and internal wiring completed.'
      }
    ]
  },
  'Site Manual Finishing Phase': {
    id: 'Site Manual Finishing Phase',
    phaseNumber: 5,
    name: 'Site Manual Finishing Phase',
    shortName: 'Manual Finishing',
    icon: '🪚',
    subSteps: [
      'Woodwork (Carpentry)',
      'Stone & Marble Work',
      'Polishing / PU Works',
      'Wall Painting',
      'Final Cleaning'
    ],
    flowSummary: 'Woodwork / Carpentry ➔ Stone & Marble Work ➔ Polish / PU Works ➔ Wall Painting ➔ Final Cleaning',
    description: 'On-site custom carpentry assembly, granite & marble countertop masonry, luxury PU coating & veneer polishing, wall putty primer painting, and spotless deep cleaning.',
    asciiFlowDiagram: `[ Woodwork / Carpentry ] ➔ [ Stone / Marble Work ] ➔ [ Polish / PU Works ] ➔ [ Wall Painting ] ➔ [ Final Cleaning ]`,
    steps: [
      {
        stepNumber: 1,
        name: 'Woodwork (Carpentry)',
        shortName: 'Woodwork (Carpentry)',
        tradeOrTeam: 'Carpenter / Joiner',
        objective: 'On-site assembly, fitting, and paneling installation',
        deliverables: 'Framed cabinets, door frames, paneling, and moldings set',
        focus: 'Fitting factory-made units and executing on-site joinery/paneling.',
        keyActions: [
          'Assemble and fix factory carcasses, door frames, and custom wall paneling.',
          'Align shutters, hinges, drawer channels, and architectural trim/moldings.',
          'Sand down wood joints to ensure smooth transitions between elements.'
        ],
        exitGate: 'All wooden framework, cabinetry, and cladding structurally completed.'
      },
      {
        stepNumber: 2,
        name: 'Stone & Marble Work',
        shortName: 'Stone & Marble Work',
        tradeOrTeam: 'Stonemason / Tile Layer',
        objective: 'Countertop fitting, stone cladding, edge molding, and grouting',
        deliverables: 'Installed granite/marble countertops, wall stone cladding & sealed joints',
        focus: 'Cutting, placing, and setting stone surfaces for counter tops and feature walls.',
        keyActions: [
          'Measure, dry-fit, and cut stone/marble slabs on site.',
          'Secure countertops, vanity tops, and stone wall features using epoxy adhesives/clamps.',
          'Perform edge profile grinding (chamfering, bullnozing, or beveling) and epoxy joint filling.'
        ],
        exitGate: 'Stone surfaces fixed, leveled, edge-profiled, and grouted.'
      },
      {
        stepNumber: 3,
        name: 'Polishing / PU Works',
        shortName: 'Polishing / PU Works',
        tradeOrTeam: 'Wood Finisher / Polish Artisan',
        objective: 'Surface sanding, staining, and Polyurethane (PU) coating',
        deliverables: 'Premium veneer, solid wood, or MDF polished/PU painted surfaces',
        focus: 'Applying high-end finishes (Melamine, PU Gloss/Matt, Polishing) to wooden surfaces.',
        keyActions: [
          'Surface Prep: Sand raw wood/veneer using fine-grit sandpaper to remove scratches and dust.',
          'Staining & Base Coat: Apply wood stain/filler followed by initial PU/Polish base coat.',
          'Top Coat Application: Apply final Polyurethane (PU) or polish coats via spray machine or manual buffing in a dust-controlled environment.'
        ],
        exitGate: 'Cured, smooth PU or polished timber finish with zero runs or dust spots.'
      },
      {
        stepNumber: 4,
        name: 'Wall Painting',
        shortName: 'Wall Painting',
        tradeOrTeam: 'Painting Crew',
        objective: 'Wall preparation, putty, primer, and topcoat application',
        deliverables: 'Smooth, finished walls free of blemishes or patches',
        focus: 'Finishing interior walls and ceilings without disturbing cured woodwork/stone.',
        keyActions: [
          'Mask off finished woodwork, PU surfaces, and stone edges using protective tape and plastic sheets.',
          'Apply wall putty touches over any damaged/repaired plaster areas, followed by sanding.',
          'Apply 1 coat of wall primer and 2 final coats of premium wall emulsion paint.'
        ],
        exitGate: 'Evenly coated, stain-free wall surfaces with clean paint cut-lines.'
      },
      {
        stepNumber: 5,
        name: 'Final Cleaning',
        shortName: 'Final Cleaning',
        tradeOrTeam: 'Housekeeping / Deep Cleaning Team',
        objective: 'Deep cleaning, polish residue removal, and trash clearance',
        deliverables: 'Spotless, move-in/handover-ready interior space',
        focus: 'Complete site deep cleaning and restoration.',
        keyActions: [
          'Remove masking tape, floor coverings, and protective films.',
          'Clean paint overspray, polish splatters, and stone slurry from floors, glass, and hardware.',
          'Vacuum internal cabinets, wipe down all surfaces, and clear out remaining site debris.'
        ],
        exitGate: 'Spotless, dust-free interior ready for final quality inspection and client handover.'
      }
    ]
  },
  'Modular Assembly Phase': {
    id: 'Modular Assembly Phase',
    phaseNumber: 7,
    name: 'Modular Assembly Phase',
    shortName: 'Modular Assembly',
    icon: '📦',
    subSteps: [
      'Carcase Assembly',
      'Drawers Installation',
      'Lighting Fixing',
      'Accessories Fitting',
      'Shutters & Visibles',
      'Dummies & Skirting',
      'Ready to Inspect (L1 & L2)'
    ],
    flowSummary: 'Carcase Assembly ➔ Drawer Systems ➔ Lighting Fixing ➔ Accessories Fitting ➔ Shutters & Visibles ➔ Dummies & Skirting ➔ Ready to Inspect (L1 & L2 QC)',
    description: 'Cabinet carcass box leveling and anchoring, soft-close tandem runners, LED profile wiring, pull-out storage hardware, front shutters & end-gables, base skirting seals, and two-stage L1/L2 quality control.',
    asciiFlowDiagram: `[ Carcase Assembly ] ➔ [ Drawer Systems ] ➔ [ Lighting Fixing ] ➔ [ Accessories Fitting ]
                                                                             │
[ Quality Inspection L1/L2 ] ◄─ [ Dummies & Skirting ] ◄─ [ Shutters & Visibles ] ◄─┘`,
    steps: [
      {
        stepNumber: 1,
        name: 'Carcase Assembly',
        shortName: 'Carcase Assembly',
        tradeOrTeam: 'Modular Installer',
        objective: 'Erect, level, and anchor cabinet carcass boxes',
        deliverables: 'Square, plumb, and wall-anchored carcass structures',
        focus: 'Erecting stable, level, and structurally sound cabinet bases.',
        keyActions: [
          'Assemble base and wall unit carcasses using dowels, minifix, and connecting screws.',
          'Adjust corner legs to ensure precise level and plumb line alignment.',
          'Anchor carcasses securely to walls using heavy-duty bracket fixings.'
        ],
        exitGate: 'Levelled and rigid carcass structure ready for internal fittings.'
      },
      {
        stepNumber: 2,
        name: 'Drawers Installation',
        shortName: 'Drawers Installation',
        tradeOrTeam: 'Modular Installer',
        objective: 'Mount drawer channels, runners, and inner drawer boxes',
        deliverables: 'Smooth-sliding, aligned tandem/drawer boxes',
        focus: 'Mounting sliding runners and drawer boxes.',
        keyActions: [
          'Mark runner positions accurately using factory pre-drilled holes or templates.',
          'Fix soft-close tandem runners or telescopic channels onto carcass side walls.',
          'Click in drawer boxes and test glide smoothness.'
        ],
        exitGate: 'Smooth, noise-free drawer sliding operation with flush seating.'
      },
      {
        stepNumber: 3,
        name: 'Lighting Fixing',
        shortName: 'Lighting Fixing',
        tradeOrTeam: 'Electrician / Modular Tech',
        objective: 'Embed LED channels, profile drivers, and sensors',
        deliverables: 'Functional internal & under-cabinet LED lighting',
        focus: 'Integrating ambient and task lighting into modular units.',
        keyActions: [
          'Route concealed low-voltage wires through factory-cut routing channels.',
          'Surface-mount or recess aluminum LED profile channels under units and inside wardrobes.',
          'Connect profile lights to drivers/transformers and integrate door proximity sensors or touch switches.'
        ],
        exitGate: 'Fully wired, illuminated internal and task lighting units.'
      },
      {
        stepNumber: 4,
        name: 'Accessories Fitting',
        shortName: 'Accessories Fitting',
        tradeOrTeam: 'Modular Installer',
        objective: 'Install internal storage mechanisms & pull-outs',
        deliverables: 'Fitted cutlery trays, corner units, & tall units',
        focus: 'Installing functional hardware accessories and pull-out mechanisms.',
        keyActions: [
          'Fit kitchen/wardrobe accessories (S-carousels, magic corners, pull-out larders, bottle pull-outs, trouser racks).',
          'Insert cutlery trays, organizer dividers, and trash bin units into designated drawers/carcasses.',
          'Check weight capacity and operational clearance for all moving hardware.'
        ],
        exitGate: 'Fully functional, smooth-operating hardware accessories.'
      },
      {
        stepNumber: 5,
        name: 'Shutters & Visibles',
        shortName: 'Shutters & Visibles',
        tradeOrTeam: 'Modular Installer',
        objective: 'Mount front door shutters, end panels, & fillers',
        deliverables: 'Aligned shutter fronts with uniform gaps',
        focus: 'Mounting front-facing aesthetic elements.',
        keyActions: [
          'Fix clip-on soft-close hinges onto door shutters and attach them to carcasses.',
          'Mount exposed side panels (end-gables) and filler strips to cover gaps against walls.',
          'Adjust 3D hinge screws to achieve uniform 2mm–3mm reveal gaps across all shutters.'
        ],
        exitGate: 'Seamless, aligned front shutters with balanced gap lines.'
      },
      {
        stepNumber: 6,
        name: 'Dummies & Skirting',
        shortName: 'Dummies & Skirting',
        tradeOrTeam: 'Modular Installer',
        objective: 'Attach bottom skirting PVC/aluminum & top dummy trims',
        deliverables: 'Sealed cabinet bases and clean ceiling/wall gaps',
        focus: 'Sealing edges and concealing base gaps for a built-in finish.',
        keyActions: [
          'Clip PVC or aluminum skirting onto the cabinet legs at floor level to block dust/water.',
          'Install top dummy panels (pelmets/cornices) to bridge gaps between upper cabinets and ceiling.',
          'Apply silicone sealant along skirting edges touching the floor to prevent water ingress.'
        ],
        exitGate: 'Clean, flush finish without open gaps under or above cabinets.'
      },
      {
        stepNumber: 7,
        name: 'Ready to Inspect (L1 & L2)',
        shortName: 'Ready to Inspect (L1 & L2 QC)',
        tradeOrTeam: 'QC Lead / Project Manager',
        objective: 'Perform two-stage quality checks for final client sign-off',
        deliverables: 'Defect-free, verified modular installation',
        focus: 'Two-tiered quality control audit before handing over to the client.',
        keyActions: [
          'Level 1 Inspection (Internal Site Supervisor): Check shutter alignment, soft-close functions, runner glides, and leg levels; verify drawer margins, scratch-free surfaces, and electrical LED points; fix minor adjustments immediately.',
          'Level 2 Inspection (Project Manager / QC Auditor): Conduct final audit against production drawings, BOM specifications, and quality standards; inspect structural stability, hardware robustness, and clean finishing.',
          'Sign off on the Quality Inspection Certificate marking the site ready for client walkthrough.'
        ],
        exitGate: 'Approved L1 & L2 Quality Check Sign-off sheet.'
      }
    ]
  },
  'Kitchen Workflow': {
    id: 'Kitchen Workflow',
    phaseNumber: 8,
    name: 'Kitchen Workflow: Dry / Wet / Utility Models',
    shortName: 'Kitchen Models',
    icon: '🍳',
    subSteps: [
      'Bottom Cabinets',
      'Stone & Countertop',
      'Countertop & Backsplash',
      'Sink & Hob Cutouts',
      'Rest of Cabinets',
      'Profile Lights',
      'Accessories',
      'Shutters & Visibles',
      'Skirting & Dummies',
      'Deep Cleaning'
    ],
    flowSummary: 'Bottom Cabinets ➔ Stone ➔ Backsplash ➔ Sink/Hob ➔ Rest of Cabinets ➔ Profile Lights ➔ Accessories ➔ Shutters ➔ Skirting ➔ Cleaning',
    description: 'Dry / Wet / Utility Kitchen specialized execution: Base cabinet framework, countertop granite/quartz stone leveling, backsplash tile cladding, sink & hob laser cutouts, overhead & tall cabinets, under-cabinet profile lighting, modular corner accessories, soft-close shutters, water-resistant skirting, and deep cleaning.',
    asciiFlowDiagram: `[ Bottom Cabinets ] ➔ [ Stone & Countertop ] ➔ [ Countertop & Backsplash ] ➔ [ Sink & Hob Cutouts ]
                                                                                                        │
[ Deep Cleaning ] ◄─ [ Skirting & Dummies ] ◄─ [ Shutters & Visibles ] ◄─ [ Accessories ] ◄─ [ Rest of Cabinets ]`,
    steps: [
      {
        stepNumber: 1,
        name: 'Bottom Cabinets',
        shortName: 'Bottom Cabinets',
        tradeOrTeam: 'Modular Installer',
        objective: 'Erect and level base carcasses for countertops',
        deliverables: 'Levelled bottom cabinet framework',
        focus: 'Rigid base unit leveling and anti-tilt bracket fixation.',
        keyActions: ['Assemble base cabinets and level with height-adjustable legs.', 'Anchor units together using connector bolts.'],
        exitGate: 'Base carcasses rigid and level.'
      },
      {
        stepNumber: 2,
        name: 'Stone & Countertop',
        shortName: 'Stone & Countertop',
        tradeOrTeam: 'Stonemason',
        objective: 'Install countertop stone/quartz slab with epoxy joints',
        deliverables: 'Levelled countertop stone with edge chamfer',
        focus: 'Level stone seating, adhesive bonding, and sink cutouts.',
        keyActions: ['Dry-fit granite/quartz slab and apply epoxy adhesive.', 'Profile front edge with water drip grooves.'],
        exitGate: 'Stone securely set and cured.'
      },
      {
        stepNumber: 3,
        name: 'Countertop & Backsplash',
        shortName: 'Backsplash Cladding',
        tradeOrTeam: 'Tile Mason',
        objective: 'Install backsplash wall tiles and waterproof sealants',
        deliverables: 'Tiled and grouted backsplash surface',
        focus: 'Seamless vertical cladding aligned with countertop perimeter.',
        keyActions: ['Fix designer ceramic/vitrified tiles with epoxy grout.', 'Apply silicone sealant along stone juncture.'],
        exitGate: 'Backsplash tiled and waterproofed.'
      },
      {
        stepNumber: 4,
        name: 'Sink & Hob Cutouts',
        shortName: 'Sink & Hob Cutouts',
        tradeOrTeam: 'Stone Tech & Plumber',
        objective: 'Laser cutouts for undermount sink and cooking hob',
        deliverables: 'Fitted sink bowl, drain trap, and hob fixture',
        focus: 'Precise template cutouts and plumbing trap connection.',
        keyActions: ['Cut stone with diamond saw as per sink/hob templates.', 'Seal undermount sink bowl with anti-fungal silicone.'],
        exitGate: 'Sink leak-tested; hob test-fitted.'
      },
      {
        stepNumber: 5,
        name: 'Rest of Cabinets',
        shortName: 'Overhead & Tall Units',
        tradeOrTeam: 'Modular Installer',
        objective: 'Mount overhead and tall pantry cabinets',
        deliverables: 'Wall-anchored overhead cabinet assembly',
        focus: 'Heavy-duty wall hanging brackets and vertical plumb line.',
        keyActions: ['Install wall-hanging brackets and lift wall carcasses.', 'Secure tall pantry unit with floor and wall anchors.'],
        exitGate: 'Wall units rigid and aligned.'
      },
      {
        stepNumber: 6,
        name: 'Profile Lights',
        shortName: 'Profile Lighting',
        tradeOrTeam: 'Electrician',
        objective: 'Integrate under-cabinet LED profile lighting',
        deliverables: 'Warm-white concealed under-cabinet illumination',
        focus: 'Recessed aluminum channels and concealed 12V drivers.',
        keyActions: ['Install recessed aluminum profile channels under cabinets.', 'Connect LED strip and sensor switch.'],
        exitGate: 'Profile lights illuminated.'
      },
      {
        stepNumber: 7,
        name: 'Accessories',
        shortName: 'Kitchen Accessories',
        tradeOrTeam: 'Modular Installer',
        objective: 'Install pull-out larders, cutlery trays, bottle pullouts',
        deliverables: 'Fitted stainless steel and tandem mechanisms',
        focus: 'Hardware clearance and load capacity verification.',
        keyActions: ['Mount bottle pull-outs, tandem cutlery trays, and corner units.', 'Verify soft-close damping under load.'],
        exitGate: 'Accessories glide smoothly.'
      },
      {
        stepNumber: 8,
        name: 'Shutters & Visibles',
        shortName: 'Kitchen Shutters',
        tradeOrTeam: 'Modular Installer',
        objective: 'Mount acrylic/laminate shutters and adjust reveals',
        deliverables: 'Aligned kitchen shutters with 2mm gaps',
        focus: '3D hinge calibration and gap uniformity.',
        keyActions: ['Fix soft-close clip-on hinges onto front shutters.', 'Calibrate 3D screws for uniform 2mm lines.'],
        exitGate: 'Shutters aligned flush.'
      },
      {
        stepNumber: 9,
        name: 'Skirting & Dummies',
        shortName: 'Skirting & Trims',
        tradeOrTeam: 'Modular Installer',
        objective: 'Attach PVC water-stop skirting and top pelmet dummies',
        deliverables: 'Sealed bottom base and top gap fillers',
        focus: 'Water sealing and vermin barrier at floor level.',
        keyActions: ['Clip waterproof PVC skirting onto cabinet legs.', 'Apply silicone seal to prevent water entry.'],
        exitGate: 'Base sealed.'
      },
      {
        stepNumber: 10,
        name: 'Deep Cleaning',
        shortName: 'Kitchen Deep Cleaning',
        tradeOrTeam: 'Housekeeping Team',
        objective: 'De-dust internal carcasses and polish quartz stone',
        deliverables: 'Sparkling, sanitized kitchen handover state',
        focus: 'Protective film removal, vacuuming, and sanitization.',
        keyActions: ['Peel protective film from shutters and appliances.', 'Vacuum sawdust inside all drawers and wipe stone.'],
        exitGate: 'Kitchen ready for handover.'
      }
    ]
  },
  'Finishing Flow': {
    id: 'Finishing Flow',
    phaseNumber: 9,
    name: 'Finishing Flow',
    shortName: 'Finishing Flow',
    icon: '✨',
    subSteps: [
      'Wall Papers',
      'Texture Painting',
      'Curtains & Blinds',
      'Loose Furniture',
      'Appliances Fitting',
      'Deep Sanitization',
      'Snag Inspection'
    ],
    flowSummary: 'Wall Papers ➔ Texture Painting ➔ Curtains ➔ Furniture ➔ Appliances ➔ Deep Cleaning ➔ Snag Inspection',
    description: 'Designer wallpaper pasting, feature wall texture painting, motorized curtains & sheer drapes installation, loose furniture assembly & staging, smart home appliances connection, deep sanitization cleaning, and final client snagging inspection.',
    asciiFlowDiagram: `[ Wall Papers ] ➔ [ Texture Painting ] ➔ [ Curtains & Blinds ] ➔ [ Loose Furniture ]
                                                                             │
[ Snag Inspection ] ◄─ [ Deep Sanitization ] ◄─ [ Appliances Fitting ] ◄─────┘`,
    steps: [
      {
        stepNumber: 1,
        name: 'Wall Papers',
        shortName: 'Wall Papers',
        tradeOrTeam: 'Wallpaper Specialist',
        objective: 'Hang designer wall coverings and feature papers',
        deliverables: 'Seamless wallpaper installation on feature walls',
        focus: 'Pattern matching, seam roll-down, and bubble removal.',
        keyActions: ['Prepare wall with acrylic primer.', 'Hang wallpaper with matched pattern repeats.'],
        exitGate: 'Wallpaper bubble-free and aligned.'
      },
      {
        stepNumber: 2,
        name: 'Texture Painting',
        shortName: 'Texture Painting',
        tradeOrTeam: 'Artisan Painter',
        objective: 'Apply luxury stucco or metallic texture paint',
        deliverables: 'Textured feature walls with uniform grain',
        focus: 'Trowel technique, metallic glazes, and protective coats.',
        keyActions: ['Trowel texture base and buff metallic highlight glaze.', 'Seal with protective clear lacquer.'],
        exitGate: 'Texture cured and inspected.'
      },
      {
        stepNumber: 3,
        name: 'Curtains & Blinds',
        shortName: 'Curtains & Blinds',
        tradeOrTeam: 'Soft Furnishing Tech',
        objective: 'Mount motorized curtain tracks and sheer drapes',
        deliverables: 'Hung and steamed drapery and roller blinds',
        focus: 'Track leveling, motor pairing, and fabric steaming.',
        keyActions: ['Install concealed ceiling curtain tracks.', 'Hang blackout and sheer fabrics; steam out creases.'],
        exitGate: 'Curtains operational.'
      },
      {
        stepNumber: 4,
        name: 'Loose Furniture',
        shortName: 'Loose Furniture',
        tradeOrTeam: 'Furniture Assemblers',
        objective: 'Unpack, assemble, and stage sofas, dining & beds',
        deliverables: 'Fully staged living and bedroom furnishings',
        focus: 'Careful handling, felt floor pads, and layout alignment.',
        keyActions: ['Assemble dining table, chairs, bed frames, and sofas.', 'Position loose furniture according to approved 3D layout.'],
        exitGate: 'Furniture assembled & styled.'
      },
      {
        stepNumber: 5,
        name: 'Appliances Fitting',
        shortName: 'Appliances Fitting',
        tradeOrTeam: 'Appliance Technicians',
        objective: 'Install and test TV, chimney, refrigerator, oven',
        deliverables: 'Commissioned appliances with warranty logged',
        focus: 'Plumbing and electrical connections, ducting, and test runs.',
        keyActions: ['Mount TV on feature wall and connect audio.', 'Install kitchen chimney duct and connect cooktop.'],
        exitGate: 'All appliances tested & operational.'
      },
      {
        stepNumber: 6,
        name: 'Deep Sanitization',
        shortName: 'Deep Sanitization',
        tradeOrTeam: 'Specialized Cleaning Crew',
        objective: 'Complete hospital-grade deep cleaning and buffing',
        deliverables: 'Immaculate, sanitized, dust-free interior',
        focus: 'Glass polishing, floor scrubber buffing, and trash haul.',
        keyActions: ['Machine-buff marble/tile floors.', 'Wipe all glass panes, mirrors, and hardware spotless.'],
        exitGate: 'Site pristine and move-in ready.'
      },
      {
        stepNumber: 7,
        name: 'Snag Inspection',
        shortName: 'Snag Inspection & Handover',
        tradeOrTeam: 'Project Manager & Client',
        objective: 'Final walkthrough snag audit and formal handover',
        deliverables: 'Signed Handover Certificate and Key Handover',
        focus: 'Comprehensive snag check, rectification, and client keys handover.',
        keyActions: ['Conduct room-by-room walkthrough with client.', 'Log any minor punch-list touchups and rectify immediately.', 'Hand over warranty dossier, operation manuals, and project keys.'],
        exitGate: 'Signed Completion Certificate & Client Handover.'
      }
    ]
  }
};
