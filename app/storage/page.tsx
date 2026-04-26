"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button, Table, Input, Modal, Form, Select, Popconfirm } from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  DatabaseOutlined, AppstoreOutlined, InboxOutlined, FilterOutlined,
} from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';
import api from '../lib/axios';

export default function StoragePage() {
  const [activeTab, setActiveTab] = useState<'cupboards' | 'places'>('cupboards');
  const [cupboards, setCupboards] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [loadingCupboards, setLoadingCupboards] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isCupboardModalOpen, setIsCupboardModalOpen] = useState(false);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [cupboardForm] = Form.useForm();
  const [placeForm] = Form.useForm();

  const normalizeList = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  useEffect(() => { fetchCupboards(); fetchPlaces(); }, []);

  async function fetchCupboards() {
    try { setLoadingCupboards(true); await api.get('/cupboards').then(res => setCupboards(normalizeList(res.data))); }
    catch { toast.error('Failed to fetch cupboards'); }
    finally { setLoadingCupboards(false); }
  }

  async function fetchPlaces() {
    try { setLoadingPlaces(true); await api.get('/places').then(res => setPlaces(normalizeList(res.data))); }
    catch { toast.error('Failed to fetch places'); }
    finally { setLoadingPlaces(false); }
  }

  const handleAddCupboard = async (values: any) => {
    setSubmitLoading(true);
    try {
      await api.post('/cupboards', values);
      toast.success('Cupboard added!');
      setIsCupboardModalOpen(false);
      cupboardForm.resetFields();
      fetchCupboards();
    } catch { toast.error('Failed to add cupboard'); }
    finally { setSubmitLoading(false); }
  };

  const handleAddPlace = async (values: any) => {
    setSubmitLoading(true);
    try {
      await api.post('/places', values);
      toast.success('Place added!');
      setIsPlaceModalOpen(false);
      placeForm.resetFields();
      fetchPlaces();
    } catch { toast.error('Failed to add place'); }
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async (type: 'cupboard' | 'place', id: number) => {
    try {
      if (type === 'cupboard') { await api.delete(`/cupboards/${id}`); fetchCupboards(); }
      else { await api.delete(`/places/${id}`); fetchPlaces(); }
      toast.success(`${type} deleted!`);
    } catch { toast.error(`Failed to delete ${type}`); }
  };

  const cupboardColumns = [
    {
      title: 'Cupboard ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <span style={{
          fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
          color: '#67e8f9', background: 'rgba(6,182,212,0.12)',
          padding: '3px 10px', borderRadius: 6,
        }}>CUP-{id}</span>
      ),
    },
    {
      title: 'Cupboard Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{text}</span>,
    },
    {
      title: 'Location',
      dataIndex: 'location_details',
      key: 'location_details',
      render: (val: string) => <span style={{ color: '#94a3b8' }}>{val || '—'}</span>,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 8, padding: '6px 10px', color: '#a5b4fc', cursor: 'pointer',
          }}><EditOutlined /></button>
          <Popconfirm title="Delete this cupboard?" description="Are you sure?" onConfirm={() => handleDelete('cupboard', record.id)} okText="Delete" cancelText="Cancel">
            <button style={{
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
              borderRadius: 8, padding: '6px 10px', color: '#f87171', cursor: 'pointer',
            }}><DeleteOutlined /></button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const placeColumns = [
    {
      title: 'Place ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <span style={{
          fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
          color: '#c4b5fd', background: 'rgba(139,92,246,0.12)',
          padding: '3px 10px', borderRadius: 6,
        }}>PLC-{id}</span>
      ),
    },
    {
      title: 'Cupboard',
      dataIndex: 'cupboard_id',
      key: 'cupboard_id',
      render: (id: number) => (
        <span style={{
          fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
          color: '#67e8f9', background: 'rgba(6,182,212,0.12)',
          padding: '3px 10px', borderRadius: 6,
        }}>CUP-{id}</span>
      ),
    },
    {
      title: 'Place Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (val: string) => <span style={{ color: '#94a3b8' }}>{val || '—'}</span>,
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 8, padding: '6px 10px', color: '#a5b4fc', cursor: 'pointer',
          }}><EditOutlined /></button>
          <Popconfirm title="Delete this place?" description="Are you sure?" onConfirm={() => handleDelete('place', record.id)} okText="Delete" cancelText="Cancel">
            <button style={{
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
              borderRadius: 8, padding: '6px 10px', color: '#f87171', cursor: 'pointer',
            }}><DeleteOutlined /></button>
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
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(217,119,6,0.12))',
            border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DatabaseOutlined style={{ fontSize: 22, color: '#fbbf24' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Storage Management
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
              Organize physical inventory locations — Cupboards & Places.
            </p>
          </div>
        </div>
        {activeTab === 'cupboards' ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCupboardModalOpen(true)} style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none',
            borderRadius: 10, height: 40, fontWeight: 700, boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
          }}>
            Add Cupboard
          </Button>
        ) : (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsPlaceModalOpen(true)} style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none',
            borderRadius: 10, height: 40, fontWeight: 700, boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
          }}>
            Add Storage Place
          </Button>
        )}
      </div>

      {/* ── Tab Switcher ── */}
      <div className="glass-card animate-fade-in-up delay-100" style={{ padding: '6px', display: 'inline-flex', gap: 4, marginBottom: 16, borderRadius: 12 }}>
        {[
          { key: 'cupboards', label: 'Cupboards', icon: <AppstoreOutlined />, count: cupboards.length, color: '#fbbf24' },
          { key: 'places', label: 'Storage Places', icon: <InboxOutlined />, count: places.length, color: '#c4b5fd' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
              background: activeTab === tab.key ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
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
        {activeTab === 'cupboards' ? (
          <Table columns={cupboardColumns} dataSource={cupboards} loading={loadingCupboards} rowKey="id" pagination={{ pageSize: 6 }} />
        ) : (
          <Table columns={placeColumns} dataSource={places} loading={loadingPlaces} rowKey="id" pagination={{ pageSize: 6 }} />
        )}
      </div>

      {/* ── Cupboard Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AppstoreOutlined style={{ color: 'white', fontSize: 14 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>Add New Cupboard</span>
          </div>
        }
        open={isCupboardModalOpen}
        onCancel={() => setIsCupboardModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={460}
      >
        <Form layout="vertical" form={cupboardForm} onFinish={handleAddCupboard} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Cupboard Name" rules={[{ required: true, message: 'Required!' }]}>
            <Input placeholder="e.g. Server Rack A" />
          </Form.Item>
          <Form.Item name="location_details" label="Location Details">
            <Input.TextArea placeholder="e.g. 1st Floor IT Room" rows={3} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button onClick={() => setIsCupboardModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', fontWeight: 700,
            }}>Save Cupboard</Button>
          </div>
        </Form>
      </Modal>

      {/* ── Place Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <InboxOutlined style={{ color: 'white', fontSize: 14 }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>Add Storage Place</span>
          </div>
        }
        open={isPlaceModalOpen}
        onCancel={() => setIsPlaceModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={460}
      >
        <Form layout="vertical" form={placeForm} onFinish={handleAddPlace} style={{ marginTop: 16 }}>
          <Form.Item name="cupboard_id" label="Select Cupboard" rules={[{ required: true, message: 'Please select a cupboard!' }]}>
            <Select
              placeholder="Select a Cupboard"
              options={cupboards.map((c: any) => ({ value: c.id, label: `[CUP-${c.id}] ${c.name}` }))}
            />
          </Form.Item>
          <Form.Item name="name" label="Place Name" rules={[{ required: true, message: 'Required!' }]}>
            <Input placeholder="e.g. Top Shelf" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="What goes here?" rows={3} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button onClick={() => setIsPlaceModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', fontWeight: 700,
            }}>Save Place</Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}