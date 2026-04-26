"use client";

import React, { useEffect, useState } from 'react';
import { Button, Table, Input, Modal, Form, Select, DatePicker, Tag } from 'antd';
import {
  PlusOutlined, SwapOutlined, HistoryOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, FilterOutlined,
} from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import api from '../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function BorrowingsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [borrowForm] = Form.useForm();
  const [returnForm] = Form.useForm();

  const normalizeList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [borrowRes, itemsRes] = await Promise.all([api.get('/borrowings'), api.get('/items')]);
      const borrowingsList = normalizeList(borrowRes.data);
      const itemsList = normalizeList(itemsRes.data);
      setBorrowings(borrowingsList);
      setAvailableItems(itemsList.filter((item: any) => item.status === 'In-Store'));
    } catch {
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => void fetchData(), 0);
    return () => clearTimeout(timer);
  }, []);

  const activeBorrows = borrowings.filter(b => !b.return_date);
  const returnHistory = borrowings.filter(b => b.return_date);

  const handleBorrowSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const payload = {
        ...values,
        borrow_date: values.borrow_date.format('YYYY-MM-DD'),
        expected_return_date: values.expected_return_date.format('YYYY-MM-DD'),
        quantity_borrowed: 1,
      };
      await api.post('/borrowings', payload);
      toast.success('Item borrowed successfully!');
      setIsBorrowModalOpen(false);
      borrowForm.resetFields();
      fetchData();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        toast.error(Object.values(error.response.data.errors).flat().join(', '));
      } else {
        toast.error(error.response?.data?.message || 'Failed to borrow item. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReturnSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const payload = { ...values, return_date: values.return_date.format('YYYY-MM-DD') };
      await api.post(`/borrowings/${selectedRecordId}/return`, payload);
      toast.success('Item returned successfully!');
      setIsReturnModalOpen(false);
      returnForm.resetFields();
      fetchData();
    } catch {
      toast.error('Failed to process return. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openReturnModal = (record: any) => {
    setSelectedRecordId(record.id);
    setIsReturnModalOpen(true);
  };

  const activeColumns = [
    {
      title: 'Borrow ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <span style={{
          fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
          color: '#67e8f9', background: 'rgba(6,182,212,0.12)',
          padding: '3px 10px', borderRadius: 6,
        }}>BRW-{id}</span>
      ),
    },
    {
      title: 'Item',
      dataIndex: 'item_id',
      key: 'item_id',
      render: (id: number) => (
        <span style={{ fontWeight: 600, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 12 }}>ITM-{id}</span>
      ),
    },
    {
      title: 'Borrower',
      dataIndex: 'borrower_name',
      key: 'borrower_name',
      render: (name: string) => <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{name}</span>,
    },
    {
      title: 'Contact',
      dataIndex: 'contact_details',
      key: 'contact_details',
      render: (val: string) => <span style={{ color: '#94a3b8' }}>{val}</span>,
    },
    {
      title: 'Borrow Date',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
      render: (d: string) => <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 12 }}>{d}</span>,
    },
    {
      title: 'Due Date',
      dataIndex: 'expected_return_date',
      key: 'expected_return_date',
      render: (d: string) => <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 12 }}>{d}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => {
        const isOverdue = dayjs().isAfter(dayjs(record.expected_return_date));
        return isOverdue ? (
          <span style={{
            color: '#f87171', background: 'rgba(244,63,94,0.15)',
            border: '1px solid rgba(244,63,94,0.3)',
            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <ExclamationCircleOutlined />  OVERDUE
          </span>
        ) : (
          <span style={{
            color: '#60a5fa', background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.25)',
            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          }}>
            ACTIVE
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <button
          onClick={() => openReturnModal(record)}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: 8,
            padding: '7px 14px',
            color: 'white',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(16,185,129,0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
        >
          <CheckCircleOutlined />
          Return
        </button>
      ),
    },
  ];

  const historyColumns = [
    {
      title: 'Record ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: 12 }}>REC-{id}</span>
      ),
    },
    {
      title: 'Item',
      dataIndex: 'item_id',
      key: 'item_id',
      render: (id: number) => (
        <span style={{ fontWeight: 600, color: '#e2e8f0', fontFamily: 'monospace', fontSize: 12 }}>ITM-{id}</span>
      ),
    },
    {
      title: 'Borrower',
      dataIndex: 'borrower_name',
      key: 'borrower_name',
      render: (name: string) => <span style={{ color: '#94a3b8', fontWeight: 600 }}>{name}</span>,
    },
    {
      title: 'Returned On',
      dataIndex: 'return_date',
      key: 'return_date',
      render: (d: string) => <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 12 }}>{d}</span>,
    },
    {
      title: 'Condition',
      key: 'condition',
      dataIndex: 'condition',
      render: (condition: string) => {
        const styles: Record<string, any> = {
          Good:    { color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
          Damaged: { color: '#f87171', bg: 'rgba(244,63,94,0.15)',  border: 'rgba(244,63,94,0.3)' },
          Lost:    { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
        };
        const s = styles[condition] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.2)' };
        return (
          <span style={{
            color: s.color, background: s.bg, border: `1px solid ${s.border}`,
            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          }}>
            {condition?.toUpperCase()}
          </span>
        );
      },
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (val: string) => <span style={{ color: '#64748b', fontSize: 12 }}>{val || '—'}</span>,
    },
  ];

  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(8,145,178,0.12))',
            border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SwapOutlined style={{ fontSize: 22, color: '#67e8f9' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Borrowing System
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
              Track who borrowed what, and manage item returns.
            </p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsBorrowModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            border: 'none',
            borderRadius: 10,
            height: 40,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(6,182,212,0.4)',
          }}
        >
          Lend an Item
        </Button>
      </div>

      {/* ── Custom Tab Switcher ── */}
      <div
        className="glass-card animate-fade-in-up delay-100"
        style={{ padding: '6px', display: 'inline-flex', gap: 4, marginBottom: 16, borderRadius: 12 }}
      >
        {[
          { key: 'active', label: 'Active Borrows', icon: <SwapOutlined />, count: activeBorrows.length },
          { key: 'history', label: 'Return History', icon: <HistoryOutlined />, count: returnHistory.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 0.2s',
              background: activeTab === tab.key
                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                : 'transparent',
              color: activeTab === tab.key ? 'white' : '#64748b',
              boxShadow: activeTab === tab.key ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            {tab.icon}
            {tab.label}
            <span style={{
              background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'rgba(99,102,241,0.15)',
              color: activeTab === tab.key ? 'white' : '#a5b4fc',
              borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="dark-table-container animate-fade-in-up delay-200">
        {activeTab === 'active' ? (
          <Table columns={activeColumns} dataSource={activeBorrows} loading={loading} rowKey="id" pagination={{ pageSize: 6 }} />
        ) : (
          <Table columns={historyColumns} dataSource={returnHistory} loading={loading} rowKey="id" pagination={{ pageSize: 6 }} />
        )}
      </div>

      {/* ── Borrow Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SwapOutlined style={{ color: 'white', fontSize: 14 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>Lend an Item</span>
          </div>
        }
        open={isBorrowModalOpen}
        onCancel={() => setIsBorrowModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={520}
      >
        <Form layout="vertical" form={borrowForm} onFinish={handleBorrowSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="item_id" label="Select Item" rules={[{ required: true, message: 'Select an item' }]}>
            <Select
              placeholder="Search for an item..."
              options={availableItems.map(item => ({
                value: item.id,
                label: `[ITM-${item.id}] ${item.name} (Qty: ${item.quantity})`,
              }))}
            />
          </Form.Item>
          <div style={{ display: 'flex', gap: 14 }}>
            <Form.Item name="borrower_name" label="Borrower Name" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="e.g. Kasun Perera" />
            </Form.Item>
            <Form.Item name="contact_details" label="Contact Number" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="077xxxxxxx" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Form.Item name="borrow_date" label="Borrow Date" style={{ flex: 1 }} rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="expected_return_date" label="Expected Return" style={{ flex: 1 }} rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button onClick={() => setIsBorrowModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)', border: 'none',
              boxShadow: '0 4px 12px rgba(6,182,212,0.4)', fontWeight: 700,
            }}>
              Confirm Lending
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── Return Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircleOutlined style={{ color: 'white', fontSize: 14 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>Process Item Return</span>
          </div>
        }
        open={isReturnModalOpen}
        onCancel={() => setIsReturnModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <div style={{
          marginBottom: 16, padding: '12px 16px',
          background: 'rgba(6,182,212,0.08)', borderRadius: 10,
          border: '1px solid rgba(6,182,212,0.2)', color: '#67e8f9', fontSize: 13,
        }}>
          Please verify the item condition before accepting the return.
        </div>
        <Form layout="vertical" form={returnForm} onFinish={handleReturnSubmit}>
          <Form.Item name="return_date" label="Return Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="condition" label="Item Condition" initialValue="Good" rules={[{ required: true }]}>
            <Select options={[
              { value: 'Good', label: '✓ Good (No Damage)' },
              { value: 'Damaged', label: '⚠ Damaged' },
              { value: 'Lost', label: '✕ Lost / Missing' },
            ]} />
          </Form.Item>
          <Form.Item name="notes" label="Return Notes (Optional)">
            <Input.TextArea placeholder="Any damages or issues?" rows={3} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} className="btn-gradient-emerald" style={{ fontWeight: 700 }}>
              Accept Return
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}