export type WorkOrderStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface ProcessProgress {
  blank: boolean;
  hobbing: boolean;
  shaving: boolean;
  carburizing: boolean;
  grinding: boolean;
  inspection: boolean;
  matching: boolean;
}

export interface WorkOrder {
  id: string;
  orderNo: string;
  productName: string;
  gearModel: string;
  quantity: number;
  status: WorkOrderStatus;
  processProgress: ProcessProgress;
  createTime: string;
  updateTime: string;
}

export interface BlankRecord {
  id: string;
  workOrderId: string;
  batchNo: string;
  outerDiameter: number;
  outerDiameterTolerance: string;
  endFaceRunout: number;
  roughness: number;
  operator: string;
  recordTime: string;
  remark?: string;
}

export type HobbingProcessType = '滚齿' | '插齿' | '键槽';

export interface HobbingRecord {
  id: string;
  workOrderId: string;
  processType: HobbingProcessType;
  hobModel?: string;
  hobModule: number;
  pressureAngle: number;
  cuttingSpeed: number;
  feedRate: number;
  toothDirectionError?: number;
  pitchCumulativeError?: number;
  keywayWidth?: number;
  keywayDepth?: number;
  symmetry?: number;
  operator: string;
  recordTime: string;
}

export interface ShavingRecord {
  id: string;
  workOrderId: string;
  preShaveWk: number;
  postShaveWk: number;
  allowance: number;
  toothCount: number;
  operator: string;
  recordTime: string;
}

export interface CarburizingRecord {
  id: string;
  workOrderId: string;
  carburizingTemp: number;
  holdingTime: number;
  caseDepth: number;
  surfaceHardness: number;
  coreHardness: number;
  operator: string;
  recordTime: string;
}

export interface GrindingRecord {
  id: string;
  workOrderId: string;
  wheelModel: string;
  dressingFeed: number;
  dressingPass: number;
  dressingDepth: number;
  grindingAccuracy: number;
  operator: string;
  recordTime: string;
}

export type InspectionResult = 'qualified' | 'unqualified';

export interface InspectionRecord {
  id: string;
  workOrderId: string;
  faTotal: number;
  faSlope: number;
  fbTotal: number;
  fbSlope: number;
  spanToothCount: number;
  commonNormal: number;
  commonNormalVariation: number;
  radialRunout: number;
  roughnessRa: number;
  roughnessRz: number;
  inspector: string;
  result: InspectionResult;
  recordTime: string;
}

export type MatchingResult = 'qualified' | 'unqualified';

export interface MatchingRecord {
  id: string;
  workOrderId: string;
  drivingGearNo: string;
  drivenGearNo: string;
  backlash: number;
  contactPattern: string;
  noiseDb: number;
  noiseAnalysis: string;
  inspector: string;
  result: MatchingResult;
  recordTime: string;
}

export interface ProcessKey {
  key: string;
  name: string;
  icon: string;
  color: string;
  path: string;
}
