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
} from '@/types';
import { generateId, generateOrderNo, formatDateTime } from '@/utils';
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
        set((state) => ({ blankRecords: [record, ...state.blankRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'blank');
      },

      addHobbingRecord: (data) => {
        const record: HobbingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        set((state) => ({ hobbingRecords: [record, ...state.hobbingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'hobbing');
      },

      addShavingRecord: (data) => {
        const record: ShavingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        set((state) => ({ shavingRecords: [record, ...state.shavingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'shaving');
      },

      addCarburizingRecord: (data) => {
        const record: CarburizingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        set((state) => ({ carburizingRecords: [record, ...state.carburizingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'carburizing');
      },

      addGrindingRecord: (data) => {
        const record: GrindingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        set((state) => ({ grindingRecords: [record, ...state.grindingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'grinding');
      },

      addInspectionRecord: (data) => {
        const record: InspectionRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        set((state) => ({ inspectionRecords: [record, ...state.inspectionRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'inspection');
      },

      addMatchingRecord: (data) => {
        const record: MatchingRecord = {
          ...data,
          id: generateId(),
          recordTime: formatDateTime(),
        };
        set((state) => ({ matchingRecords: [record, ...state.matchingRecords] }));
        get().updateWorkOrderProgress(data.workOrderId, 'matching');
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
