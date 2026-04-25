"use client";

import React, { useState, useEffect } from 'react';
import { Table, Input, Select } from 'antd';
import { SearchOutlined, HistoryOutlined, FilterOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';
import api from '../lib/axios';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/audit-logs');
      const sortedLogs = response.data.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setLogs(sortedLogs);
    } catch {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = Cookies.get('role');
    if (role?.toLowerCase() !== 'admin') {
      toast.error('Unauthorized Access! Admin only.');
      router.push('/');
    } else {
      const timer = setTimeout(() => void fetchLogs(), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesAction = filterAction === 'All' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionStyle = (action: string) => {
    const a = action?.toLowerCase();
    if (a?.includes('create')) return { color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' };
    if (a?.includes('update')) return { color: '#a5b4fc', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)' };
    if (a?.includes('delete')) return { color: '#f87171', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)' };
    if (a?.includes('borrow')) return { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' };
    if (a?.includes('return')) return { color: '#67e8f9', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)' };
    if (a?.includes('login')) return { color: '#c4b5fd', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };
  };

  const columns = [
    {
      title: 'Log ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: number) => (
        <span style={{ color: '#334155', fontFamily: 'monospace', fontSize: 11 }}>#{id}</span>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (action: string) => {
        const s = getActionStyle(action);
        return (
          <span style={{
            color: s.color, background: s.bg, border: `1px solid ${s.border}`,
            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          }}>
            {action?.toUpperCase()}
          </span>
        );
      },
    },
    {
      title: 'Performed By',
      dataIndex: 'user_email',
      key: 'user_email',
      render: (email: string) => (
        <span style={{ fontWeight: 600, color: '#cbd5e1', fontFamily: 'monospace', fontSize: 12 }}>
          {email || 'System'}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => <span style={{ color: '#78909c', fontSize: 13 }}>{desc}</span>,
    },
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => (
        <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.02em' }}>
          {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
            border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HistoryOutlined style={{ fontSize: 22, color: '#a5b4fc' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              System Audit Logs
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
              Monitor all user activities and system changes in real-time.
            </p>
          </div>
        </div>
        <div style={{
          padding: '8px 14px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 8,
          color: '#34d399', fontSize: 13, fontWeight: 600,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#34d399',
            boxShadow: '0 0 8px #34d399', display: 'inline-block',
          }} />
          Live Monitoring
        </div>
      </div>

      {/* ── Security Notice ── */}
      <div
        className="glass-card animate-fade-in-up delay-100"
        style={{
          marginBottom: 18, padding: '12px 18px',
          background: 'rgba(245,158,11,0.05)',
          borderColor: 'rgba(245,158,11,0.18)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>🔒</span>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          <strong style={{ color: '#fbbf24' }}>Security Notice:</strong> Audit logs are read-only and cannot be modified or deleted.
          Retained for compliance and security monitoring purposes.
        </span>
      </div>

      {/* ── Filters ── */}
      <div className="glass-card animate-fade-in-up delay-200" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <FilterOutlined style={{ color: '#6366f1', fontSize: 16 }} />
        <Input
          placeholder="Search by description or user..."
          prefix={<SearchOutlined style={{ color: '#475569' }} />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ maxWidth: 360, height: 38 }}
        />
        <Select
          value={filterAction}
          onChange={val => setFilterAction(val)}
          style={{ width: 180, height: 38 }}
          options={[
            { value: 'All', label: 'All Actions' },
            { value: 'CREATE', label: '✦ Created' },
            { value: 'UPDATE', label: '✎ Updated' },
            { value: 'DELETE', label: '✕ Deleted' },
            { value: 'BORROW', label: '↗ Borrowed' },
            { value: 'RETURN', label: '↩ Returned' },
            { value: 'LOGIN', label: '⊙ Logins' },
          ]}
        />
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#475569', fontWeight: 500 }}>
          {filteredLogs.length} log entr{filteredLogs.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="dark-table-container animate-fade-in-up delay-300">
        <Table
          columns={columns}
          dataSource={filteredLogs}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 12,
            showSizeChanger: true,
            showTotal: total => `${total} total entries`,
            style: { padding: '12px 20px' },
          }}
          size="middle"
        />
      </div>
    </AdminLayout>
  );
}