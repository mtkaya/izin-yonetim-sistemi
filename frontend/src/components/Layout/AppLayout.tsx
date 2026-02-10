import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/personel',
    icon: <TeamOutlined />,
    label: 'Personel Yonetimi',
  },
  {
    key: '/izin',
    icon: <CalendarOutlined />,
    label: 'Izin Islemleri',
  },
  {
    key: '/raporlar',
    icon: <BarChartOutlined />,
    label: 'Raporlar',
  },
  {
    key: '/resmi-tatil',
    icon: <ScheduleOutlined />,
    label: 'Resmi Tatiller',
  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: colorBgContainer }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <h2 style={{ margin: 0, fontSize: collapsed ? 16 : 20, color: '#1677ff' }}>
            {collapsed ? 'IY' : 'Izin Yonetimi'}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, color: '#333' }}>
            Personel Izin Takip Sistemi
          </h3>
        </Header>
        <Content style={{
          margin: 24,
          padding: 24,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
