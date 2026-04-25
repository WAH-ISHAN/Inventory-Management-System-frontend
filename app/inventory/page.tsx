"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, Tag, Input, Space, Modal, Form, Select, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout'; 
import toast from 'react-hot-toast';
import api from '../lib/axios'; // ⚠️ සැබෑ API එක

const { Title, Text } = Typography;

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {

      const [itemsRes, placesRes] = await Promise.all([
        api.get('/items'),
        api.get('/places')

      ]);

      setItems(itemsRes.data);
      setPlaces(placesRes.data);

    } catch (error) {

      toast.error("Failed to load inventory data");
      console.error("Failed to load inventory data");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (values: any) => {

    setSubmitLoading(true);
    try {

      await api.post('/items', values);
      toast.success('Item added successfully!'); 
      setIsModalOpen(false); 
      form.resetFields(); 
      fetchData(); 

    } catch (error) {

        toast.error("Failed to add item");
      console.error("Failed to add item");

    } finally {
      setSubmitLoading(false);
    }
  };
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/items/${id}`);

      toast.success('Item deleted successfully!');

      fetchData();
    } catch (error) {

      toast.error("Failed to delete item");
      console.error("Failed to delete item");
    }
  };

  const filteredItems = items.filter(item => {

    const matchesSearch = item.name?.toLowerCase().includes(searchText.toLowerCase()) || item.code?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;

    return matchesSearch && matchesStatus;

  });
  const columns = [
    { 
      title: 'Item Code', 
      dataIndex: 'code', 
      key: 'code', 
      render: (text: string) => <Text strong>{text}</Text> 
    },
    { title: 'Item Name', dataIndex: 'name', key: 'name' },
    { 
      title: 'Quantity', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (qty: number) => (
        <span className={qty <= 5 ? "text-red-500 font-bold" : "text-gray-700"}>
          {qty} {qty <= 5 && " (Low)"}
        </span>
      )
    },
    { 
      title: 'Storage Place', 
      dataIndex: 'place_id', 
      key: 'place_id',
      render: (place_id: number) => {

        const place = places.find(p => p.id === place_id);
        return <Tag color="purple">{place ? place.name : `PLC-${place_id}`}</Tag>;

      }
    },
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
            description={`Are you sure you want to delete ${record.name}?`}
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
          <div className="p-3 bg-blue-100 rounded-lg">

            <AppstoreOutlined className="text-blue-600 text-xl" />

          </div>
          <div>

            <Title level={3} style={{ margin: 0 }}>Inventory Management</Title>
            <Text type="secondary">Manage hardware assets, quantities, and their locations.</Text>
          </div>

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
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />


        <Select 
          size="large" 
          value={filterStatus} 
          onChange={(val) => setFilterStatus(val)} 
          className="w-40" 
          options={[
            { value: 'All', label: 'All Status' },
            { value: 'In-Store', label: 'In-Store' },
            { value: 'Borrowed', label: 'Borrowed' },
            { value: 'Damaged', label: 'Damaged' },
          ]} 

        />

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredItems} 
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
            <Form.Item name="code" label="Item Code" className="w-1/3" rules={[{ required: true, message: 'Required!' }]}>
              <Input placeholder="ITM-001" className="rounded-lg" />
            </Form.Item>
            <Form.Item name="name" label="Item Name" className="w-2/3" rules={[{ required: true, message: 'Required!' }]}>
              <Input placeholder="e.g. Logitech Mouse" className="rounded-lg" />
            </Form.Item>


          </div>
          


          <div className="flex gap-4">


            <Form.Item name="quantity" label="Initial Quantity" className="w-1/2" rules={[{ required: true, message: 'Required!' }]}>
              <InputNumber className="w-full rounded-lg" min={1} />
            </Form.Item>
            <Form.Item name="status" label="Status" className="w-1/2" initialValue="In-Store" rules={[{ required: true }]}>
              <Select className="rounded-lg" options={[
                { value: 'In-Store', label: 'In-Store' },
                { value: 'Damaged', label: 'Damaged' },
              ]} />


            </Form.Item>

          </div>

   
  
          <Form.Item name="place_id" label="Storage Place" rules={[{ required: true, message: 'Please select a place!' }]}>
             <Select 
               placeholder="Select where to store this item" 
               className="rounded-lg"
               options={places.map(p => ({
                 value: p.id,
                 label: `[PLC-${p.id}] ${p.name} (Cupboard: ${p.cupboard_id})`
               }))}
             />
          </Form.Item>

          <Form.Item name="description" label="Description">
             <Input.TextArea placeholder="Optional description or specs..." rows={3} className="rounded-lg" />
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