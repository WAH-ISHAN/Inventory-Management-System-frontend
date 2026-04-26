"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Input, Modal, Form, Select, InputNumber, Popconfirm } from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  AppstoreOutlined, FilterOutlined, ReloadOutlined,
} from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';
import api from '../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

const normalizeList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, placesRes] = await Promise.all([api.get('/items'), api.get('/places')]);
      setItems(normalizeList(itemsRes.data));
      setPlaces(normalizeList(placesRes.data));
    } catch {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void fetchData(), 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleAddSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      await api.post('/items', values);
      toast.success('Item added successfully!');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch {
      toast.error('Failed to add item');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/items/${id}`);
      toast.success('Item deleted successfully!');
      fetchData();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    if (status === 'In-Store') return { color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' };
    if (status === 'Borrowed')  return { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' };
    return { color: '#f87171', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)' };
  };

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <span style={{
          fontFamily: 'monospace',
          color: '#a5b4fc',
          background: 'rgba(99,102,241,0.12)',
          padding: '3px 10px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
        }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (text: string) => text ? <span style={{ color: '#94a3b8', fontSize: 13 }}>{text}</span> : <span style={{ color: '#475569', fontStyle: 'italic', fontSize: 12 }}>N/A</span>,
    },
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{text}</span>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number) => (
        <span style={{
          fontWeight: 700,
          color: qty <= 5 ? '#f87171' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          {qty}
          {qty <= 5 && (
            <span style={{
              fontSize: 10,
              color: '#f43f5e',
              background: 'rgba(244,63,94,0.15)',
              padding: '1px 6px',
              borderRadius: 99,
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}>
              LOW
            </span>
          )}
        </span>
      ),
    },
    {
      title: 'Storage Place',
      dataIndex: 'place_id',
      key: 'place_id',
      render: (place_id: number) => {
        const place = places.find(p => p.id === place_id);
        return (
          <span style={{
            color: '#c4b5fd',
            background: 'rgba(139,92,246,0.12)',
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
          }}>
            {place ? place.name : `PLC-${place_id}`}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = getStatusStyle(status);
        return (
          <span style={{
            color: s.color,
            background: s.bg,
            border: `1px solid ${s.border}`,
            padding: '4px 12px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}>
            {status?.toUpperCase()}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            title="Edit item"
            aria-label="Edit item"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#a5b4fc',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <EditOutlined />
          </button>
          <Popconfirm
            title="Delete this item?"
            description={`Are you sure you want to delete "${record.name}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <button
              title="Delete item"
              aria-label="Delete item"
              style={{
                background: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: 8,
                padding: '6px 10px',
                color: '#f87171',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <DeleteOutlined />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(79,70,229,0.15))',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AppstoreOutlined style={{ fontSize: 22, color: '#a5b4fc' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Inventory Management
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
              Manage hardware assets, quantities, and their locations.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 10,
              color: '#94a3b8',
              fontWeight: 600,
              height: 40,
            }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="btn-gradient"
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: 10, height: 40, fontWeight: 700 }}
          >
            Add New Item
          </Button>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div
        className="glass-card animate-fade-in-up delay-100"
        style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <FilterOutlined style={{ color: '#6366f1', fontSize: 16 }} />
        <Input
          placeholder="Search by item name or code..."
          prefix={<SearchOutlined style={{ color: '#475569' }} />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ maxWidth: 340, height: 38 }}
        />
        <Select
          value={filterStatus}
          onChange={val => setFilterStatus(val)}
          style={{ width: 160, height: 38 }}
          options={[
            { value: 'All', label: 'All Statuses' },
            { value: 'In-Store', label: '✓ In-Store' },
            { value: 'Borrowed', label: '↗ Borrowed' },
            { value: 'Damaged', label: '⚠ Damaged' },
          ]}
        />
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#475569', fontWeight: 500 }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* ── Table ── */}
      <div className="dark-table-container animate-fade-in-up delay-200">
        <Table
          columns={columns}
          dataSource={filteredItems}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 8,
            style: { padding: '12px 20px' },
          }}
        />
      </div>

      {/* ── Add Item Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PlusOutlined style={{ color: 'white', fontSize: 14 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>Add New Item</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <Form layout="vertical" form={form} onFinish={handleAddSubmit} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <Form.Item name="code" label="Item Code" style={{ width: '35%' }} rules={[{ required: true, message: 'Required!' }]}>
              <Input placeholder="ITM-001" />
            </Form.Item>
            <Form.Item name="name" label="Item Name" style={{ flex: 1 }} rules={[{ required: true, message: 'Required!' }]}>
              <Input placeholder="e.g. Logitech Mouse" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Form.Item name="serial_number" label="Serial Number (Optional)" style={{ width: '50%' }}>
              <Input placeholder="e.g. SN-987654321" />
            </Form.Item>
            <Form.Item name="quantity" label="Initial Quantity" style={{ flex: 1 }} rules={[{ required: true, message: 'Required!' }]}>
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Form.Item name="place_id" label="Storage Place" style={{ width: '50%' }} rules={[{ required: true, message: 'Please select a place!' }]}>
              <Select
                placeholder="Select where to store this item"
                options={(places || []).map((p: any) => ({
                  value: p.id,
                  label: `[PLC-${p.id}] ${p.name} (Cupboard: ${p.cupboard_id})`,
                }))}
              />
            </Form.Item>
            <Form.Item name="status" label="Status" style={{ flex: 1 }} initialValue="In-Store" rules={[{ required: true }]}>
              <Select options={[
                { value: 'In-Store', label: 'In-Store' },
                { value: 'Damaged', label: 'Damaged' },
              ]} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description (Optional)">
            <Input.TextArea placeholder="Optional description or specs..." rows={3} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} className="btn-gradient">
              Save Item
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}