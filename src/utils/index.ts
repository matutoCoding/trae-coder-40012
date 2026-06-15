export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

export const generateOrderNo = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO${year}${month}${day}${random}`;
};

export const formatDateTime = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const calculateAllowance = (preShave: number, postShave: number): number => {
  return Math.round((preShave - postShave) * 1000) / 1000;
};

export const checkTolerance = (
  value: number,
  nominal: number,
  tolerance: { upper: number; lower: number }
): boolean => {
  return value >= nominal + tolerance.lower && value <= nominal + tolerance.upper;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: '#FF7D00',
    processing: '#165DFF',
    completed: '#00B42A',
    rejected: '#F53F3F',
    qualified: '#00B42A',
    unqualified: '#F53F3F',
  };
  return colorMap[status] || '#86909C';
};

export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    pending: '待开始',
    processing: '生产中',
    completed: '已完成',
    rejected: '已报废',
    qualified: '合格',
    unqualified: '不合格',
  };
  return textMap[status] || status;
};

export interface ValidationRule {
  field: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit: string;
}

export interface ValidationResult {
  valid: boolean;
  warnings: ValidationWarning[];
}

export interface ValidationWarning {
  field: string;
  label: string;
  value: number;
  message: string;
  level: 'warning' | 'error';
}

export const validateBlank = (data: { outerDiameter: number; endFaceRunout: number; roughness: number }): ValidationResult => {
  const warnings: ValidationWarning[] = [];
  if (data.outerDiameter > 260 || data.outerDiameter < 20) {
    warnings.push({ field: 'outerDiameter', label: '外圆直径', value: data.outerDiameter, message: `外圆直径 ${data.outerDiameter}mm 超出常规范围(20~260mm)`, level: 'warning' });
  }
  if (data.endFaceRunout > 0.02) {
    warnings.push({ field: 'endFaceRunout', label: '端面跳动', value: data.endFaceRunout, message: `端面跳动 ${(data.endFaceRunout * 1000).toFixed(1)}μm 超标(≤20μm)`, level: 'error' });
  }
  if (data.roughness > 3.2) {
    warnings.push({ field: 'roughness', label: '粗糙度', value: data.roughness, message: `粗糙度 Ra${data.roughness}μm 超出推荐值(≤3.2μm)`, level: 'warning' });
  }
  return { valid: warnings.filter(w => w.level === 'error').length === 0, warnings };
};

export const validateShaving = (data: { allowance: number }): ValidationResult => {
  const warnings: ValidationWarning[] = [];
  if (data.allowance < 0.1 || data.allowance > 0.2) {
    warnings.push({ field: 'allowance', label: '剃齿余量', value: data.allowance, message: `剃齿余量 ${data.allowance.toFixed(3)}mm 超出推荐范围(0.10~0.20mm)`, level: data.allowance < 0.05 ? 'error' : 'warning' });
  }
  return { valid: warnings.filter(w => w.level === 'error').length === 0, warnings };
};

export const validateCarburizing = (data: { caseDepth: number; surfaceHardness: number }): ValidationResult => {
  const warnings: ValidationWarning[] = [];
  if (data.caseDepth < 0.5 || data.caseDepth > 1.5) {
    warnings.push({ field: 'caseDepth', label: '渗碳层深度', value: data.caseDepth, message: `渗碳层深度 ${data.caseDepth.toFixed(2)}mm 超出推荐范围(0.50~1.50mm)`, level: data.caseDepth < 0.3 ? 'error' : 'warning' });
  }
  if (data.surfaceHardness < 58) {
    warnings.push({ field: 'surfaceHardness', label: '表面硬度', value: data.surfaceHardness, message: `表面硬度 ${data.surfaceHardness.toFixed(1)}HRC 低于合格下限(58HRC)`, level: 'error' });
  }
  return { valid: warnings.filter(w => w.level === 'error').length === 0, warnings };
};

export const validateGrinding = (data: { grindingAccuracy: number }): ValidationResult => {
  const warnings: ValidationWarning[] = [];
  if (data.grindingAccuracy > 6) {
    warnings.push({ field: 'grindingAccuracy', label: '磨齿精度', value: data.grindingAccuracy, message: `磨齿精度 ${data.grindingAccuracy}级 低于目标精度(≤6级)`, level: 'warning' });
  }
  return { valid: warnings.filter(w => w.level === 'error').length === 0, warnings };
};

export const validateInspection = (data: { faTotal: number; fbTotal: number; radialRunout: number; roughnessRa: number; commonNormalVariation: number }): ValidationResult => {
  const warnings: ValidationWarning[] = [];
  if (data.faTotal > 0.02) warnings.push({ field: 'faTotal', label: '齿形偏差Fa', value: data.faTotal, message: `齿形总偏差 ${(data.faTotal * 1000).toFixed(1)}μm 超标(≤20μm)`, level: 'error' });
  if (data.fbTotal > 0.025) warnings.push({ field: 'fbTotal', label: '齿向偏差Fβ', value: data.fbTotal, message: `齿向总偏差 ${(data.fbTotal * 1000).toFixed(1)}μm 超标(≤25μm)`, level: 'error' });
  if (data.radialRunout > 0.05) warnings.push({ field: 'radialRunout', label: '径向跳动Fr', value: data.radialRunout, message: `径向跳动 ${(data.radialRunout * 1000).toFixed(1)}μm 超标(≤50μm)`, level: 'error' });
  if (data.roughnessRa > 0.8) warnings.push({ field: 'roughnessRa', label: '粗糙度Ra', value: data.roughnessRa, message: `粗糙度 Ra${data.roughnessRa}μm 超出推荐值(≤0.8μm)`, level: 'warning' });
  if (data.commonNormalVariation > 0.02) warnings.push({ field: 'commonNormalVariation', label: '公法线变动', value: data.commonNormalVariation, message: `公法线变动量 ${(data.commonNormalVariation * 1000).toFixed(0)}μm 超标(≤20μm)`, level: 'error' });
  return { valid: warnings.filter(w => w.level === 'error').length === 0, warnings };
};

export const validateHobbing = (data: { toothDirectionError?: number; pitchCumulativeError?: number }): ValidationResult => {
  const warnings: ValidationWarning[] = [];
  if (data.toothDirectionError !== undefined && data.toothDirectionError > 0.02) {
    warnings.push({ field: 'toothDirectionError', label: '齿向误差', value: data.toothDirectionError, message: `齿向误差 ${(data.toothDirectionError * 1000).toFixed(1)}μm 超标(≤20μm)`, level: 'error' });
  }
  if (data.pitchCumulativeError !== undefined && data.pitchCumulativeError > 0.06) {
    warnings.push({ field: 'pitchCumulativeError', label: '齿距累积误差', value: data.pitchCumulativeError, message: `齿距累积误差 ${(data.pitchCumulativeError * 1000).toFixed(1)}μm 超标(≤60μm)`, level: 'warning' });
  }
  return { valid: warnings.filter(w => w.level === 'error').length === 0, warnings };
};

export const validateMatching = (data: { noiseDb: number; backlash: number }): ValidationResult => {
  const warnings: ValidationWarning[] = [];
  if (data.noiseDb > 72) warnings.push({ field: 'noiseDb', label: '噪声', value: data.noiseDb, message: `噪声 ${data.noiseDb}dB 超出限值(≤72dB)`, level: data.noiseDb > 80 ? 'error' : 'warning' });
  if (data.backlash < 0.05 || data.backlash > 0.25) warnings.push({ field: 'backlash', label: '侧隙', value: data.backlash, message: `侧隙 ${data.backlash.toFixed(3)}mm 超出推荐范围(0.05~0.25mm)`, level: 'warning' });
  return { valid: warnings.filter(w => w.level === 'error').length === 0, warnings };
};
