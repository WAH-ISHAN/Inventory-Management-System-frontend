"use client";

import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Badge } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  SwapOutlined,
  DatabaseOutlined,
  UserOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const { Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const role = Cookies.get('role');
    const email = Cookies.get('email') || 'admin@ims.local';
    setUserRole(role?.toLowerCase() || 'staff');
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    toast.success('Logged out successfully!');
    router.push('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link href="/">Dashboard</Link>,
    },
    {
      key: '/inventory',
      icon: <AppstoreOutlined />,
      label: <Link href="/inventory">Inventory Items</Link>,
    },
    {
      key: '/borrowings',
      icon: <SwapOutlined />,
      label: <Link href="/borrowings">Borrowing System</Link>,
    },
    {
      key: '/storage',
      icon: <DatabaseOutlined />,
      label: <Link href="/storage">Storage Management</Link>,
    },
  ];

  if (userRole === 'admin') {
    menuItems.push(
      {
        key: '/users',
        icon: <UserOutlined />,
        label: <Link href="/users">User Management</Link>,
      },
      {
        key: '/audit-logs',
        icon: <HistoryOutlined />,
        label: <Link href="/audit-logs">Audit Logs</Link>,
      }
    );
  }

  const getAvatarInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* ── Sidebar ── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        trigger={null}
        width={240}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
          borderRight: '1px solid rgba(99,102,241,0.15)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            padding: collapsed ? '20px 12px' : '24px 20px',
            borderBottom: '1px solid rgba(99,102,241,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(99,102,241,0.5)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h10M4 17h7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  background: 'linear-gradient(135deg, #a5b4fc 0%, #67e8f9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                IMS
              </div>
              <div style={{ fontSize: 10, color: '#475569', letterSpacing: '0.1em', marginTop: -2 }}>
                INVENTORY MANAGEMENT
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ background: 'transparent', border: 'none', padding: '8px 12px' }}
        />

        {/* Sidebar Footer — User Badge */}
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 64,
              left: 12,
              right: 12,
              padding: '12px 14px',
              background: 'rgba(99,102,241,0.08)',
              borderRadius: 12,
              border: '1px solid rgba(99,102,241,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
            className="animate-fade-in"
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}
            >
              {getAvatarInitials(userEmail)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userEmail}
              </div>
              <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {userRole}
              </div>
            </div>
          </div>
        )}
      </Sider>

      <Layout style={{ background: '#0f172a' }}>
        {/* ── Top Header Bar ── */}
        <div
          style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(99,102,241,0.12)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Collapse Button */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: '#94a3b8',
              fontSize: 16,
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 8,
              background: 'rgba(99,102,241,0.08)',
              height: 36,
              width: 36,
            }}
          />

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge count={0} style={{ backgroundColor: '#6366f1' }}>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  color: '#94a3b8',
                  fontSize: 16,
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 8,
                  background: 'rgba(99,102,241,0.08)',
                  height: 36,
                  width: 36,
                }}
              />
            </Badge>

            <div
              style={{
                width: 1,
                height: 24,
                background: 'rgba(99,102,241,0.2)',
              }}
            />

            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                background: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.25)',
                color: '#f87171',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                height: 36,
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <Content
          style={{
            margin: '24px',
            minHeight: 'calc(100vh - 108px)',
          }}
        >
          <div className="animate-fade-in-up">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}