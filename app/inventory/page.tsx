"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button, Table, Tag, Input, Space, Modal, Form, Select, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout'; 
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { title } from 'process';

const { Title, Text } = Typography;

const dummyData = [
  { id: 1, code: 'ITM-001', name: 'Logitech MX Master 3', quantity: 15, place_id: 1, status: 'In-Store' },
  { id: 2, code: 'ITM-002', name: 'Dell 24" Monitor', quantity: 4, place_id: 2, status: 'Borrowed' },
  { id: 3, code: 'ITM-003', name: 'Mechanical Keyboard', quantity: 0, place_id: 1, status: 'Damaged' },
];

export default function InventoryPage() {
  const [items, setItems] = useState(dummyData);
  const [loading, setLoading] = useState(false);
  const [submitloading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect
    (() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {setLoading(true);
          const response = await api.get('/inventory');
            setItems(response.data);
        } catch (error) {
            toast.error('Failed to fetch inventory items.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleAddSubmit = async (values: any) => {
        setSubmitLoading(true);
        try {
            await api.post('/inventory', values);
            toast.success('Item added successfully!');
            setIsModalOpen(false);
            form.resetFields();
            fetchItems();
        } catch (error) {
            toast.error('Failed to add item. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };


    const columns = [
        {
            title: 'Item Code',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Text strong>{text}</Text>,
        },
    { title: 'Item Name', dataIndex: 'name', key: 'name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Storage Place ID', dataIndex: 'place_id', key: 'place_id' },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        let color = status === 'In-Store' ? 'success' : status === 'Borrowed' ? 'warning' : 'error';
        return <Tag color={color} className="rounded-full px-3">{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} className="text-blue-500 hover:text-blue-700" />
          
          <Popconfirm
            title="Delete the item"
            description="Are you sure to delete this item?"
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
        <div>
          <Title level={3} style={{ margin: 0 }}>Inventory Management</Title>
          <Text type="secondary">Manage hardware assets, quantities, and their locations.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          className="bg-blue-600 rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Item
        </Button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <Input 
          size="large" 
          placeholder="Search by Item Name or Code..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          className="max-w-md rounded-lg"
        />
        <Select size="large" defaultValue="All" className="w-40" options={[
          { value: 'All', label: 'All Status' },
          { value: 'In-Store', label: 'In-Store' },
          { value: 'Borrowed', label: 'Borrowed' },
          { value: 'Damaged', label: 'Damaged' },
        ]} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={items} 
          loading={loading}
          rowKey="id" 
          pagination={{ pageSize: 8 }}
        />
      </div>

      <Modal
        title={<Title level={4}>Add New Item</Title>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleAddSubmit} className="mt-4">
          <div className="flex gap-4">
            <Form.Item name="code" label="Item Code" className="w-1/3" rules={[{ required: true }]}>
              <Input placeholder="ITM-001" className="rounded-lg" />
            </Form.Item>
            <Form.Item name="name" label="Item Name" className="w-2/3" rules={[{ required: true }]}>
              <Input placeholder="e.g. Logitech Mouse" className="rounded-lg" />
            </Form.Item>
          </div>
          
          <div className="flex gap-4">
            <Form.Item name="quantity" label="Initial Quantity" className="w-1/2" rules={[{ required: true }]}>
              <InputNumber className="w-full rounded-lg" min={1} />
            </Form.Item>
            <Form.Item name="status" label="Status" className="w-1/2" initialValue="In-Store" rules={[{ required: true }]}>
              <Select className="rounded-lg" options={[
                { value: 'In-Store', label: 'In-Store' },
                { value: 'Damaged', label: 'Damaged' },
              ]} />
            </Form.Item>
          </div>

          <Form.Item name="place_id" label="Storage Place ID" rules={[{ required: true }]}>
             <InputNumber className="w-full rounded-lg" min={1} placeholder="Enter Place ID (e.g. 1)" />
          </Form.Item>

          <Form.Item name="description" label="Description">
             <Input.TextArea placeholder="Optional description..." rows={3} className="rounded-lg" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)} className="rounded-lg">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} className="bg-blue-600 rounded-lg">Save Item</Button>
          </div>
        </Form>
      </Modal>

    </AdminLayout>
  );
}