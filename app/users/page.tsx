"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, Tag, Input, Space, Modal, Form, Select, Popconfirm, Card } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined, SafetyOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout'; 
import toast from 'react-hot-toast';
import api from '../lib/axios'; 
import dayjs from 'dayjs'; 
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const { Title, Text } = Typography;

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
    } catch (error) {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          name: values.name,
          role: values.role
        });
        toast.success('User updated successfully!');
      } else {
        await api.post('/users', values);
        toast.success('User created successfully!');
      }
      
      closeModal();
      fetchUsers(); 
    } catch (error) {
      console.error("Failed to save user");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user");
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (record: any) => {

    setEditingUser(record);
    form.setFieldsValue({
      name: record.name,
      role: record.role
    });

    setIsModalOpen(true);

  };


  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };




  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchText.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });
  

  
  const columns = [
    { 
      title: 'User ID', 
      dataIndex: 'id', 
      key: 'id', 
      render: (id: number) => <Text type="secondary">USR-{id}</Text> 
    },




    { 
      title: 'Full Name', 
      dataIndex: 'name', 
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },



    { title: 'Email Address', dataIndex: 'email', key: 'email' },



    {

        
      title: 'System Role',
      key: 'role',
      dataIndex: 'role',
      render: (role: string) => {
        const color = role?.toLowerCase() === 'admin' ? 'volcano' : 'geekblue';
        const icon = role?.toLowerCase() === 'admin' ? <SafetyOutlined /> : <UserOutlined />;
        return <Tag color={color} icon={icon} className="rounded-full px-3">{role?.toUpperCase()}</Tag>;
      },

    },




    { 
      title: 'Joined Date', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (date: string) => <span className="text-gray-500">{dayjs(date).format('MMM DD, YYYY')}</span>
    },







    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            className="text-blue-500 hover:text-blue-700" 
            onClick={() => openEditModal(record)}
          />
          
          <Popconfirm
            title="Delete the user"
            description={`Are you sure you want to remove ${record.name}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined />} className="text-red-500 hover:text-red-700" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      
      <div className="flex justify-between items-center mb-6">

        <div className="flex items-center gap-3">

          <div className="p-3 bg-purple-100 rounded-lg">

            <UsergroupAddOutlined className="text-purple-600 text-xl" />


          </div>

          <div>

            <Title level={3} style={{ margin: 0 }}>User Management</Title>

            <Text type="secondary">Manage system administrators and staff access.</Text>

          </div>

        </div>

        <Button 

          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          className="bg-purple-600 border-none hover:bg-purple-700 rounded-lg"
          onClick={openAddModal}
        >
          Add New User
        </Button>

      </div>

      <Card className="mb-6 bg-slate-50 border-slate-200">
        <Text className="text-slate-600">

          
          <strong>Note:</strong> Admin users have full access to add, edit, and delete inventory data. Staff members may have restricted access based on your backend logic.
        </Text>

      </Card>


      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <Input 
          size="large" 
          placeholder="Search by name or email..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          className="max-w-md rounded-lg"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />


        <Select 
          size="large" 
          value={filterRole} 
          onChange={(val) => setFilterRole(val)} 
          className="w-40" 
          options={[
            { value: 'All', label: 'All Roles' },
            { value: 'Admin', label: 'Administrators' },
            { value: 'Staff', label: 'Staff Members' },
          ]} 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredUsers} 
          loading={loading}
          rowKey="id" 
          pagination={{ pageSize: 8 }}
        />
      </div>

      <Modal
        title={<Title level={4}>{editingUser ? 'Edit User Details' : 'Create New User'}</Title>}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit} className="mt-4">
          
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter the name!' }]}>
            <Input placeholder="e.g. Kasun Perera" className="rounded-lg" />
          </Form.Item>
          {!editingUser && (
            <>

              <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Valid email required!' }]}>
                <Input placeholder="user@ceyntics.com" className="rounded-lg" />
              </Form.Item>
              
              <Form.Item name="password" label="Temporary Password" rules={[{ required: true, min: 6, message: 'Minimum 6 characters required!' }]}>
                <Input.Password placeholder="Set a strong password" className="rounded-lg" />
              </Form.Item>
            </>

          )}

          <Form.Item name="role" label="System Role" initialValue="Staff" rules={[{ required: true }]}>
            <Select className="rounded-lg" options={[
              { value: 'Admin', label: 'Administrator (Full Access)' },
              { value: 'Staff', label: 'Staff (Limited Access)' },
            ]} />

          </Form.Item>


          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={closeModal} className="rounded-lg">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} className="bg-purple-600 border-none rounded-lg">
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>

          </div>

        </Form>
        
      </Modal>

    </AdminLayout>
  );
}