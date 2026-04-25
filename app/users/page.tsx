"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button, Table, Input, Modal, Form, Select, Popconfirm } from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  UsergroupAddOutlined, SafetyOutlined, UserOutlined, FilterOutlined,
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminLayout from '../components/AdminLayout';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const role = Cookies.get('role');
    if (role?.toLowerCase() !== 'admin') {
      toast.error('Unauthorized Access! Admin only.');
      router.push('/');
    } else {
      fetchUsers();
    }
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch { console.error('Failed to load users'); }
    finally { setLoading(false); }
  }

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, { name: values.name, role: values.role });
        toast.success('User updated successfully!');
      } else {
        await api.post('/users', values);
        toast.success('User created successfully!');
      }
      closeModal();
      fetchUsers();
    } catch { console.error('Failed to save user'); }
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch { console.error('Failed to delete user'); }
  };

  const openAddModal = () => { setEditingUser(null); form.resetFields(); setIsModalOpen(true); };
  const openEditModal = (record: any) => {
    setEditingUser(record);
    form.setFieldsValue({ name: record.name, role: record.role });
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingUser(null); form.resetFields(); };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => (
        <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: 12 }}>USR-{id}</span>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: record.role?.toLowerCase() === 'admin'
              ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white',
          }}>
            {text?.charAt(0)?.toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>{email}</span>,
    },
    {
      title: 'System Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const isAdmin = role?.toLowerCase() === 'admin';
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            color: isAdmin ? '#fb7185' : '#a5b4fc',
            background: isAdmin ? 'rgba(244,63,94,0.12)' : 'rgba(99,102,241,0.12)',
            border: `1px solid ${isAdmin ? 'rgba(244,63,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          }}>
            {isAdmin ? <SafetyOutlined /> : <UserOutlined />}
            {role?.toUpperCase()}
          </span>
        );
      },
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: 12 }}>
          {dayjs(date).format('MMM DD, YYYY')}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => openEditModal(record)}
            style={{
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 8, padding: '6px 10px', color: '#a5b4fc', cursor: 'pointer',
            }}
          >
            <EditOutlined />
          </button>
          <Popconfirm
            title="Remove this user?"
            description={`Are you sure you want to remove ${record.name}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <button style={{
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
              borderRadius: 8, padding: '6px 10px', color: '#f87171', cursor: 'pointer',
            }}>
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
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.12))',
            border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UsergroupAddOutlined style={{ fontSize: 22, color: '#c4b5fd' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              User Management
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
              Manage system administrators and staff access.
            </p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddModal}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none',
            borderRadius: 10, height: 40, fontWeight: 700, boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
          }}
        >
          Add New User
        </Button>
      </div>

      {/* ── RBAC Notice ── */}
      <div
        className="glass-card animate-fade-in-up delay-100"
        style={{
          marginBottom: 18, padding: '12px 18px',
          background: 'rgba(245,158,11,0.06)',
          borderColor: 'rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <SafetyOutlined style={{ color: '#fbbf24', fontSize: 16 }} />
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          <strong style={{ color: '#fbbf24' }}>Admin only:</strong> Users with Admin role have full access. Staff members have restricted access.
        </span>
      </div>

      {/* ── Filters Bar ── */}
      <div className="glass-card animate-fade-in-up delay-200" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <FilterOutlined style={{ color: '#6366f1', fontSize: 16 }} />
        <Input
          placeholder="Search by name or email..."
          prefix={<SearchOutlined style={{ color: '#475569' }} />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ maxWidth: 340, height: 38 }}
        />
        <Select
          value={filterRole}
          onChange={val => setFilterRole(val)}
          style={{ width: 180, height: 38 }}
          options={[
            { value: 'All', label: 'All Roles' },
            { value: 'Admin', label: '🛡 Administrators' },
            { value: 'Staff', label: '👤 Staff Members' },
          ]}
        />
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#475569', fontWeight: 500 }}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="dark-table-container animate-fade-in-up delay-300">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {editingUser ? <EditOutlined style={{ color: 'white', fontSize: 14 }} /> : <PlusOutlined style={{ color: 'white', fontSize: 14 }} />}
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>
              {editingUser ? 'Edit User Details' : 'Create New User'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter the name!' }]}>
            <Input placeholder="e.g. Kasun Perera" />
          </Form.Item>
          {!editingUser && (
            <>
              <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Valid email required!' }]}>
                <Input placeholder="user@company.com" />
              </Form.Item>
              <Form.Item name="password" label="Temporary Password" rules={[{ required: true, min: 6, message: 'Minimum 6 characters required!' }]}>
                <Input.Password placeholder="Set a strong password" />
              </Form.Item>
            </>
          )}
          <Form.Item name="role" label="System Role" initialValue="Staff" rules={[{ required: true }]}>
            <Select options={[
              { value: 'Admin', label: '🛡 Administrator (Full Access)' },
              { value: 'Staff', label: '👤 Staff (Limited Access)' },
            ]} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none',
              fontWeight: 700, boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
            }}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}