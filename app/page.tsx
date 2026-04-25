"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from 'antd';
import {
  AppstoreOutlined,
  WarningOutlined,
  SwapOutlined,
  TeamOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import AdminLayout from './components/AdminLayout';
import api from './lib/axios';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalItems: 0, lowStockItems: 0, activeBorrows: 0, totalUsers: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [lowStockList, setLowStockList] = useState<any[]>([]);
  
  // Count-up animation refs
  const [displayStats, setDisplayStats] = useState({ totalItems: 0, lowStockItems: 0, activeBorrows: 0, totalUsers: 0 });
  const animationRef = useRef<any>(null);

  const animateCountUp = (finalStats: typeof stats) => {
    const duration = 1200;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;

    if (animationRef.current) clearInterval(animationRef.current);
    animationRef.current = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayStats({
        totalItems: Math.round(finalStats.totalItems * eased),
        lowStockItems: Math.round(finalStats.lowStockItems * eased),
        activeBorrows: Math.round(finalStats.activeBorrows * eased),
        totalUsers: Math.round(finalStats.totalUsers * eased),
      });
      if (step >= steps) clearInterval(animationRef.current);
    }, interval);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [itemsRes, borrowsRes, usersRes, logsRes] = await Promise.all([
        api.get('/items').catch(() => ({ data: [] })),
        api.get('/borrowings').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/audit-logs').catch(() => ({ data: [] })),
      ]);

      const items = Array.isArray(itemsRes.data) ? itemsRes.data : [];
      const borrowings = Array.isArray(borrowsRes.data) ? borrowsRes.data : [];
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const logs = Array.isArray(logsRes.data) ? logsRes.data : [];

      const lowStock = items.filter((item: any) => item.quantity <= 5);
      const activeBorrows = borrowings.filter((b: any) => !b.return_date);

      const finalStats = {
        totalItems: items.length,
        lowStockItems: lowStock.length,
        activeBorrows: activeBorrows.length,
        totalUsers: users.length,
      };

      setStats(finalStats);
      setLowStockList(lowStock.slice(0, 5));

      const sortedLogs = logs.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentLogs(sortedLogs.slice(0, 5));

      setTimeout(() => animateCountUp(finalStats), 200);
    } catch {
      toast.error('Could not load dashboard data completely.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => void fetchDashboardData(), 0);
    return () => clearTimeout(t);
  }, []);

  const getLogTagColor = (action: string) => {
    if (action?.toLowerCase().includes('create')) return '#10b981';
    if (action?.toLowerCase().includes('update')) return '#6366f1';
    if (action?.toLowerCase().includes('delete')) return '#f43f5e';
    if (action?.toLowerCase().includes('borrow')) return '#f59e0b';
    if (action?.toLowerCase().includes('return')) return '#06b6d4';
    return '#64748b';
  };

  const getLogActionLabel = (action: string) => {
    if (action?.toLowerCase().includes('create')) return 'CREATE';
    if (action?.toLowerCase().includes('update')) return 'UPDATE';
    if (action?.toLowerCase().includes('delete')) return 'DELETE';
    if (action?.toLowerCase().includes('borrow')) return 'BORROW';
    if (action?.toLowerCase().includes('return')) return 'RETURN';
    return action?.toUpperCase();
  };

  const statCards = [
    {
      key: 'totalItems',
      label: 'Total Items',
      value: displayStats.totalItems,
      icon: <AppstoreOutlined style={{ fontSize: 22, color: '#a5b4fc' }} />,
      cardClass: 'stat-card-indigo',
      iconBg: 'rgba(99,102,241,0.2)',
      iconBorder: 'rgba(99,102,241,0.35)',
      textColor: '#a5b4fc',
      delay: 'delay-100',
    },
    {
      key: 'lowStockItems',
      label: 'Low Stock Alerts',
      value: displayStats.lowStockItems,
      icon: <WarningOutlined style={{ fontSize: 22, color: '#fb7185' }} />,
      cardClass: 'stat-card-rose',
      iconBg: 'rgba(244,63,94,0.2)',
      iconBorder: 'rgba(244,63,94,0.35)',
      textColor: '#fb7185',
      delay: 'delay-200',
    },
    {
      key: 'activeBorrows',
      label: 'Active Borrows',
      value: displayStats.activeBorrows,
      icon: <SwapOutlined style={{ fontSize: 22, color: '#fbbf24' }} />,
      cardClass: 'stat-card-amber',
      iconBg: 'rgba(245,158,11,0.2)',
      iconBorder: 'rgba(245,158,11,0.35)',
      textColor: '#fbbf24',
      delay: 'delay-300',
    },
    {
      key: 'totalUsers',
      label: 'System Users',
      value: displayStats.totalUsers,
      icon: <TeamOutlined style={{ fontSize: 22, color: '#34d399' }} />,
      cardClass: 'stat-card-emerald',
      iconBg: 'rgba(16,185,129,0.2)',
      iconBorder: 'rgba(16,185,129,0.35)',
      textColor: '#34d399',
      delay: 'delay-400',
    },
  ];

  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="mb-8 animate-fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 4,
                height: 28,
                borderRadius: 2,
                background: 'linear-gradient(180deg, #6366f1, #06b6d4)',
              }} />
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                Overview Dashboard
              </h1>
            </div>
            <p style={{ margin: 0, marginLeft: 14, color: '#64748b', fontSize: 14 }}>
              Welcome back — Inventory Management System
            </p>
          </div>
          <button
            onClick={() => void fetchDashboardData()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 10,
              color: '#a5b4fc',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <ReloadOutlined style={{ fontSize: 14 }} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`glass-card ${card.cardClass} animate-fade-in-up ${card.delay}`}
            style={{ padding: '20px 24px', borderRadius: 16 }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 2 }} title={false}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: card.textColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {card.value}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, color: '#34d399', fontSize: 12, fontWeight: 500 }}>
                    <ArrowUpOutlined style={{ fontSize: 10 }} />
                    <span>Live data</span>
                  </div>
                </div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: card.iconBg,
                  border: `1px solid ${card.iconBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {card.icon}
                </div>
              </div>
            </Skeleton>
          </div>
        ))}
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

        {/* Recent Activity */}
        <div className="glass-card animate-fade-in-up delay-200" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(99,102,241,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HistoryOutlined style={{ color: '#6366f1', fontSize: 16 }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>Recent Activities</span>
            </div>
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>Last 5 events</span>
          </div>
          <div style={{ padding: '0 24px' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              {recentLogs.length > 0 ? (
                recentLogs.map((log: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: '14px 0',
                      borderBottom: index < recentLogs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: getLogTagColor(log.action),
                        marginTop: 6,
                        flexShrink: 0,
                        boxShadow: `0 0 8px ${getLogTagColor(log.action)}`,
                      }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: getLogTagColor(log.action),
                            background: `${getLogTagColor(log.action)}18`,
                            padding: '2px 8px',
                            borderRadius: 99,
                            letterSpacing: '0.06em',
                          }}>
                            {getLogActionLabel(log.action)}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                            {log.user_email || 'System'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{log.description}</p>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap', marginLeft: 12, paddingTop: 2, fontFamily: 'monospace' }}>
                      {dayjs(log.created_at).format('MMM DD, HH:mm')}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569' }}>
                  <HistoryOutlined style={{ fontSize: 28, marginBottom: 8, display: 'block' }} />
                  No recent activities found.
                </div>
              )}
            </Skeleton>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Needs Attention */}
          <div className="glass-card stat-card-rose animate-fade-in-up delay-300" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(244,63,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <WarningOutlined style={{ color: '#f43f5e', fontSize: 15 }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Needs Attention</span>
            </div>
            <div style={{ padding: '0 20px' }}>
              <Skeleton loading={loading} active paragraph={{ rows: 3 }}>
                {lowStockList.length > 0 ? (
                  lowStockList.map((item: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '11px 0',
                        borderBottom: index < lowStockList.length - 1 ? '1px solid rgba(244,63,94,0.08)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#f43f5e',
                        background: 'rgba(244,63,94,0.15)',
                        border: '1px solid rgba(244,63,94,0.25)',
                        padding: '3px 10px',
                        borderRadius: 99,
                      }}>
                        Qty: {item.quantity}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#34d399', fontSize: 13, fontWeight: 500 }}>
                    ✓ All items have sufficient stock!
                  </div>
                )}
              </Skeleton>
            </div>
          </div>

          {/* System Secure */}
          <div
            className="glass-card animate-fade-in-up delay-400 animate-pulse-glow"
            style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))',
              borderColor: 'rgba(16,185,129,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(16,185,129,0.2)',
                border: '1px solid rgba(16,185,129,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <SafetyCertificateOutlined style={{ fontSize: 20, color: '#34d399' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 2 }}>System Secure</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>RBAC & Authentication Active</div>
              </div>
              <div style={{
                marginLeft: 'auto',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#34d399',
                boxShadow: '0 0 10px #34d399',
                animation: 'pulseGlow 2s ease-in-out infinite',
              }} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}