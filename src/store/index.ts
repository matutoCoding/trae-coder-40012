import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorkOrder,
  BlankRecord,
  HobbingRecord,
  ShavingRecord,
  CarburizingRecord,
  GrindingRecord,
  InspectionRecord,
  MatchingRecord,
  ProcessProgress,
  QualityAlert,
} from '@/types';
import { generateId, generateOrderNo, formatDateTime, validateBlank, validateHobbing, validateShaving, validateCarburizing, validateGrinding, validateInspection, validateMatching } from '@/utils';
import { initialWorkOrders, initialBlankRecords, initialHobbingRecords, initialShavingRecords, initialCarburizingRecords, initialGrindingRecords, initialInspectionRecords, initialMatchingRecords } from '@/mock';

interface GearStore {
  workOrders: WorkOrder[];
  blankRecords: BlankRecord[];
  hobbingRecords: HobbingRecord[];
  shavingRecords: ShavingRecord[];
  carburizingRecords: CarburizingRecord[];
  grindingRecords: GrindingRecord[];
  inspectionRecords: InspectionRecord[];
  matchingRecords: MatchingRecord[];
  alerts: QualityAlert[];

  addWorkOrder: (data: Partial<WorkOrder>) => WorkOrder;
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;
  updateWorkOrderProgress: (id: string, process: keyof ProcessProgress) => void;
  
  addBlankRecord: (data: Omit<BlankRecord, 'id' | 'recordTime'>) => void;
  addHobbingRecord: (data: Omit<HobbingRecord, 'id' | 'recordTime'>) => void;
  addShavingRecord: (data: Omit<ShavingRecord, 'id' | 'recordTime'>) => void;
  addCarburizingRecord: (data: Omit<CarburizingRecord, 'id' | 'recordTime'>) => void;
  addGrindingRecord: (data: Omit<GrindingRecord, 'id' | 'recordTime'>) => void;
  addInspectionRecord: (data: Omit<InspectionRecord, 'id' | 'recordTime'>) => void;
  addMatchingRecord: (data: Omit<MatchingRecord, 'id' | 'recordTime'>) => void;
  addAlert: (alert: Omit<QualityAlert, 'id' | 'time'>) => void;

  getWorkOrderById: (id: string) => WorkOrder | undefined;
  getRecordsByWorkOrderId: (workOrderId: string) => {
    blank: BlankRecord[];
    hobbing: HobbingRecord[];
    shaving: ShavingRecord[];
    carburizing: CarburizingRecord[];
    grinding: GrindingRecord[];
    inspection: InspectionRecord[];
    matching: MatchingRecord[];
  };
}

export const useGearStore = create<GearStore>()(
  persist(
    (set, get) => ({
      workOrders: initialWorkOrders,
      blankRecords: initialBlankRecords,
      hobbingRecords: initialHobbingRecords,
      shavingRecords: initialShavingRecords,
      carburizingRecords: initialCarburizingRecords,
      grindingRecords: initialGrindingRecords,
      inspectionRecords: initialInspectionRecords,
      matchingRecords: initialMatchingRecords,
      alerts: [],

      addWorkOrder: (data) => {
        const now = formatDateTime();
        const newWorkOrder: WorkOrder = {
          id: generateId(),
          orderNo: generateOrderNo(),
          productName: data.productName || '',
          gearModel: data.gearModel || '',
          quantity: data.quantity || 0,
          status: 'pending',
          processProgress: {
            blank: false,
            hobbing: false,
            shaving: false,
            carburizing: false,
            grinding: false,
            inspection: false,
            matching: false,
          },
          createTime: now,
          updateTime: now,
        };
        set((state) => ({ workOrders: [newWorkOrder, ...state.workOrders] }));
        return newWorkOrder;
      },

      updateWorkOrder: (id, data) => {
        set((state) => ({
          workOrders: state.workOrders.map((wo) =>
            wo.id === id ? { ...wo, ...data, updateTime: formatDateTime() } : wo
          ),
        }));
      },

      deleteWorkOrder: (id) => {
        set((state) => ({
          workOrders: state.workOrders.filter((wo) => wo.id !== id),
          blankRecords: state.blankRecords.filter((r) => r.workOrderId !== id),
          hobbingRecords: state.hobbingRecords.filter((r) => r.workOrderId !== id),
          shavingRecords: state.shavingRecords.filter((r) => r.workOrderId !== id),
          carburizingRecords: state.carburizingRecords.filter((r) => r.workOrderId !== id),
          grindingRecords: state.grindingRecords.filter((r) => r.workOrderId !== id),
          inspectionRecords: state.inspectionRecords.filter((r) => r.workOrderId !== id),
          matchingRecords: state.matchingRecords.filter((r) => r.workOrderId !== id),
        }));
      },

      updateWorkOrderProgress: (id, process) => {
        set((state) => ({
          workOrders: state.workOrders.map((wo) => {
            if (wo.id !== id) return wo;
            const newProgress = { ...wo.processProgress, [process]: true };
            const allCompleted = Object.values(newProgress).every(Boolean);
            const anyStarted = Object.values(wo.processProgress).some(Boolean) || true;
            return {
              ...wo,
              processProgress: newProgress,
              status: allCompleted ? 'completed' : anyStarted ? 'processing' : wo.status,
              updateTime: formatDateTime(),
            };
          }),
        }));
      },

      addBlankRecord: (data) => {
        const record: BlankRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        const result = validateBlank({ outerDiameter: data.outerDiameter, endFaceRunout: data.endFaceRunout, roughness: data.roughness });
        result.warnings.forEach((w) => {
          get().addAlert({ type: w.level, title: w.label, level: w.level, workOrderId: data.workOrderId, process: 'blank', field: w.field, value: w.value, message: w.message });
        });
        set((state) => ({ blankRecords: [record, ...state.blankRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'blank');
      },

      addHobbingRecord: (data) => {
        const record: HobbingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        const result = validateHobbing({ toothDirectionError: data.toothDirectionError, pitchCumulativeError: data.pitchCumulativeError });
        result.warnings.forEach((w) => {
          get().addAlert({ type: w.level, title: w.label, level: w.level, workOrderId: data.workOrderId, process: 'hobbing', field: w.field, value: w.value, message: w.message });
        });
        set((state) => ({ hobbingRecords: [record, ...state.hobbingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'hobbing');
      },

      addShavingRecord: (data) => {
        const record: ShavingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        const result = validateShaving({ allowance: data.allowance });
        result.warnings.forEach((w) => {
          get().addAlert({ type: w.level, title: w.label, level: w.level, workOrderId: data.workOrderId, process: 'shaving', field: w.field, value: w.value, message: w.message });
        });
        set((state) => ({ shavingRecords: [record, ...state.shavingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'shaving');
      },

      addCarburizingRecord: (data) => {
        const record: CarburizingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        const result = validateCarburizing({ caseDepth: data.caseDepth, surfaceHardness: data.surfaceHardness });
        result.warnings.forEach((w) => {
          get().addAlert({ type: w.level, title: w.label, level: w.level, workOrderId: data.workOrderId, process: 'carburizing', field: w.field, value: w.value, message: w.message });
        });
        set((state) => ({ carburizingRecords: [record, ...state.carburizingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'carburizing');
      },

      addGrindingRecord: (data) => {
        const record: GrindingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        const result = validateGrinding({ grindingAccuracy: data.grindingAccuracy });
        result.warnings.forEach((w) => {
          get().addAlert({ type: w.level, title: w.label, level: w.level, workOrderId: data.workOrderId, process: 'grinding', field: w.field, value: w.value, message: w.message });
        });
        set((state) => ({ grindingRecords: [record, ...state.grindingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'grinding');
      },

      addInspectionRecord: (data) => {
        const record: InspectionRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        const result = validateInspection({ faTotal: data.faTotal, fbTotal: data.fbTotal, radialRunout: data.radialRunout, roughnessRa: data.roughnessRa, commonNormalVariation: data.commonNormalVariation });
        result.warnings.forEach((w) => {
          get().addAlert({ type: w.level, title: w.label, level: w.level, workOrderId: data.workOrderId, process: 'inspection', field: w.field, value: w.value, message: w.message });
        });
        set((state) => ({ inspectionRecords: [record, ...state.inspectionRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'inspection');
      },

      addMatchingRecord: (data) => {
        const record: MatchingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        const result = validateMatching({ noiseDb: data.noiseDb, backlash: data.backlash });
        result.warnings.forEach((w) => {
          get().addAlert({ type: w.level, title: w.label, level: w.level, workOrderId: data.workOrderId, process: 'matching', field: w.field, value: w.value, message: w.message });
        });
        set((state) => ({ matchingRecords: [record, ...state.matchingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'matching');
      },

      addAlert: (alert) => {
        const newAlert: QualityAlert = {
          ...alert,
          id: generateId(),
          time: formatDateTime(),
        };
        set((state) => ({ alerts: [newAlert, ...state.alerts] }));
      },

      getWorkOrderById: (id) => {
        return get().workOrders.find((wo) => wo.id === id);
      },

      getRecordsByWorkOrderId: (workOrderId) => {
        const state = get();
        return {
          blank: state.blankRecords.filter((r) => r.workOrderId === workOrderId),
          hobbing: state.hobbingRecords.filter((r) => r.workOrderId === workOrderId),
          shaving: state.shavingRecords.filter((r) => r.workOrderId === workOrderId),
          carburizing: state.carburizingRecords.filter((r) => r.workOrderId === workOrderId),
          grinding: state.grindingRecords.filter((r) => r.workOrderId === workOrderId),
          inspection: state.inspectionRecords.filter((r) => r.workOrderId === workOrderId),
          matching: state.matchingRecords.filter((r) => r.workOrderId === workOrderId),
        };
      },
    }),
    {
      name: 'gear-factory-storage',
    }
  )
);
