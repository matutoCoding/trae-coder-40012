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
