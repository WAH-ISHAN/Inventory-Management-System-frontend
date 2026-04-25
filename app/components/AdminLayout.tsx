"use client";

import React, { useState } from 'react';
import { Layout, Menu, Typography, Button, theme } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  SwapOutlined,
  DatabaseOutlined,
  UserOutlined,
  HistoryOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import Link from 'next/link'; 
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; 
import toast from 'react-hot-toast'; 

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname(); 
  const router = useRouter();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();


  const handleLogout = () => {
    Cookies.remove('token'); 
    toast.success('Logged out successfully!');
    router.push('/login'); 
  };


  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: <Link href="/">Dashboard</Link> },
    { key: '/inventory', icon: <AppstoreOutlined />, label: <Link href="/inventory">Inventory Items</Link> },
    { key: '/borrowings', icon: <SwapOutlined />, label: <Link href="/borrowings">Borrowing System</Link> },
    { key: '/storage', icon: <DatabaseOutlined />, label: <Link href="/storage">Storage Management</Link> },
    { key: '/users', icon: <UserOutlined />, label: <Link href="/users">User Management</Link> },
    { key: '/audit-logs', icon: <HistoryOutlined />, label: <Link href="/audit-logs">Audit Logs</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      
  
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)} 
        theme="dark"
      >
     
        <div className="h-8 m-4 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
          {!collapsed ? (
            <span className="text-white font-bold tracking-wider">CEYNTICS</span>
          ) : (
            <span className="text-white font-bold">C</span>
          )}
        </div>

    
        <Menu 
          theme="dark" 
          selectedKeys={[pathname]} 
          mode="inline" 
          items={menuItems} 
        />
      </Sider>
      
      <Layout>
        
        <Header 
          style={{ 
            padding: '0 24px', 
            background: colorBgContainer, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}
        >
          <Title level={4} style={{ margin: 0 }}>Internal System</Title>
          
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            className="font-medium"
          >
            Logout
          </Button>
        </Header>

       
        <Content style={{ margin: '16px' }}>
          <div 
            style={{ 
              padding: 24, 
              minHeight: 360, 
              background: colorBgContainer, 
              borderRadius: borderRadiusLG 
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}