import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import trTR from 'antd/locale/tr_TR';
import AppLayout from './components/Layout/AppLayout';
import PersonelPage from './pages/PersonelPage';
import IzinIslemleriPage from './pages/IzinIslemleriPage';
import RaporlarPage from './pages/RaporlarPage';
import ResmiTatilPage from './pages/ResmiTatilPage';

function App() {
  return (
    <ConfigProvider locale={trTR} theme={{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 6,
      },
    }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/personel" replace />} />
            <Route path="personel" element={<PersonelPage />} />
            <Route path="izin" element={<IzinIslemleriPage />} />
            <Route path="raporlar" element={<RaporlarPage />} />
            <Route path="resmi-tatil" element={<ResmiTatilPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
