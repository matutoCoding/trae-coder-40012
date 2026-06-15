import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from '@/components/Layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import BlankProcess from '@/pages/process/BlankProcess';
import HobbingProcess from '@/pages/process/HobbingProcess';
import ShavingProcess from '@/pages/process/ShavingProcess';
import CarburizingProcess from '@/pages/process/CarburizingProcess';
import GrindingProcess from '@/pages/process/GrindingProcess';
import InspectionPage from '@/pages/Inspection';
import MatchingPage from '@/pages/Matching';
import WorkOrderList from '@/pages/WorkOrder/WorkOrderList';
import WorkOrderDetail from '@/pages/WorkOrder/WorkOrderDetail';
import QualityStats from '@/pages/QualityStats';
import SettingsPage from '@/pages/Settings';
import 'dayjs/locale/zh-cn';

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#165DFF',
          colorInfo: '#165DFF',
          colorSuccess: '#00B42A',
          colorWarning: '#FF7D00',
          colorError: '#F53F3F',
          borderRadius: 4,
          fontSize: 14,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        },
        components: {
          Layout: {
            siderBg: '#1D2129',
            headerBg: '#FFFFFF',
            bodyBg: '#F5F6F7',
          },
          Menu: {
            darkItemBg: '#1D2129',
            darkSubMenuItemBg: '#171A1F',
            darkItemSelectedBg: '#165DFF',
            darkItemSelectedColor: '#FFFFFF',
          },
          Button: {
            borderRadius: 4,
            controlHeight: 36,
          },
          Card: {
            boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
          },
          Table: {
            headerBg: '#FAFAFA',
            headerColor: '#4E5969',
            rowHoverBg: '#F5F8FF',
          },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/process/blank" element={<BlankProcess />} />
              <Route path="/process/hobbing" element={<HobbingProcess />} />
              <Route path="/process/shaving" element={<ShavingProcess />} />
              <Route path="/process/carburizing" element={<CarburizingProcess />} />
              <Route path="/process/grinding" element={<GrindingProcess />} />
              <Route path="/inspection" element={<InspectionPage />} />
              <Route path="/matching" element={<MatchingPage />} />
              <Route path="/quality-stats" element={<QualityStats />} />
              <Route path="/workorders" element={<WorkOrderList />} />
              <Route path="/workorders/:id" element={<WorkOrderDetail />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
