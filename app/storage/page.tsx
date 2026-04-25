"use client";

import React, { useState } from 'react';
import { Typography, Button, Table, Tabs, Input, Space, Modal, Form, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined, AppstoreOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout'; 
import toast from 'react-hot-toast';
import api from '../lib/axios';

const { Title, Text } = Typography;

export default function StoragePage() {
  const [activeTab, setActiveTab] = useState('1');
  const [cupboards, setCupboards] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loadingCupboards, setLoadingCupboards] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isCupboardModalOpen, setIsCupboardModalOpen] = useState(false);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [cupboardForm] = Form.useForm();
  const [placeForm] = Form.useForm();

  useEffect(() => {
    fetchCupboards();
    fetchPlaces();
  }, []);

  const fetchCupboards = async () => {
    try {
      setLoadingCupboards(true);
      const res = await api.get('/cupboards');
      setCupboards(res.data);
    } catch (error) {
      toast.error("Failed to fetch cupboards");
      console.error("Failed to fetch cupboards");
    } finally {
      setLoadingCupboards(false);
    }
  };

  const fetchPlaces = async () => {
    try {
      setLoadingPlaces(true);
      const res = await api.get('/places');
      setPlaces(res.data);
    } catch (error) {
      toast.error("Failed to fetch places");
      console.error("Failed to fetch places");
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleAddCupboard = async (values: any) => {
    setSubmitLoading(true);
    try {
      await api.post('/cupboards', values);
      toast.success('Cupboard added successfully!');
      setIsCupboardModalOpen(false);
      cupboardForm.resetFields();
      fetchCupboards(); 
    } catch (error) {
      toast.error("Failed to add cupboard");
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddPlace = async (values: any) => {
    setSubmitLoading(true);
    try {
      await api.post('/places', values);
      toast.success('Place added successfully!');
      setIsPlaceModalOpen(false);
      placeForm.resetFields();
      fetchPlaces(); 
    } catch (error) {
      toast.error("Failed to add place");
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };


  const handleDelete = async (type: 'cupboard' | 'place', id: number) => {
    try {
      if (type === 'cupboard') {
        await api.delete(`/cupboards/${id}`);
        fetchCupboards();
      } else {
        await api.delete(`/places/${id}`);
        fetchPlaces();
      }
      toast.success(`${type} deleted successfully!`);
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
      console.error(`Failed to delete ${type}`);
    }
  };


  const cupboardColumns = [
    { 
      title: 'Cupboard ID', 
      dataIndex: 'id', 
      key: 'id', 
      render: (id: number) => <Tag color="blue">CUP-{id}</Tag> 
    },
    { title: 'Cupboard Name', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Location Details', dataIndex: 'location_details', key: 'location_details' },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} className="text-blue-500 hover:text-blue-700" />
          <Popconfirm title="Delete Cupboard" description="Are you sure?" onConfirm={() => handleDelete('cupboard', record.id)} okText="Yes" cancelText="No">
            <Button type="text" icon={<DeleteOutlined />} className="text-red-500 hover:text-red-700" />
          </Popconfirm>
        </Space>
      ),
    },
  ];


  const placeColumns = [
    { 
      title: 'Place ID', 
      dataIndex: 'id', 
      key: 'id',
      render: (id: number) => <Tag color="purple">PLC-{id}</Tag> 
    },
    { 
      title: 'Cupboard ID', 
      dataIndex: 'cupboard_id', 
      key: 'cupboard_id',
      render: (id: number) => <Tag color="blue">CUP-{id}</Tag> 
    },
    { title: 'Place Name', dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} className="text-blue-500 hover:text-blue-700" />
          <Popconfirm title="Delete Place" description="Are you sure?" onConfirm={() => handleDelete('place', record.id)} okText="Yes" cancelText="No">
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

          <Title level={3} style={{ margin: 0 }}>Storage Management</Title>
          <Text type="secondary">Organize your physical inventory locations (Cupboards & Places).</Text>

        </div>
        
        {activeTab === '1' ? (

          <Button type="primary" icon={<PlusOutlined />} size="large" className="bg-blue-600 rounded-lg" onClick={() => setIsCupboardModalOpen(true)}>
            Add Cupboard

          </Button>

        ) : (
          <Button type="primary" icon={<PlusOutlined />} size="large" className="bg-purple-600 rounded-lg" onClick={() => setIsPlaceModalOpen(true)}>
            Add Storage Place

          </Button>
        )}

      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

        <Tabs 

          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key)}
          items={[

            {
              key: '1',
              label: <span className="text-base"><AppstoreOutlined /> Cupboards</span>,
              children: <Table columns={cupboardColumns} dataSource={cupboards} loading={loadingCupboards} rowKey="id" pagination={{ pageSize: 5 }} />
            },


            {
              key: '2',
              label: <span className="text-base"><InboxOutlined /> Storage Places</span>,
              children: <Table columns={placeColumns} dataSource={places} loading={loadingPlaces} rowKey="id" pagination={{ pageSize: 5 }} />
            }

          ]}

        />
      </div>


      <Modal title={<Title level={4}>Add New Cupboard</Title>} open={isCupboardModalOpen} onCancel={() => setIsCupboardModalOpen(false)} footer={null} destroyOnClose>

        <Form layout="vertical" form={cupboardForm} onFinish={handleAddCupboard} className="mt-4">
          <Form.Item name="name" label="Cupboard Name" rules={[{ required: true, message: 'Required!' }]}>
            <Input placeholder="e.g. Server Rack A" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="location_details" label="Location Details">
            <Input.TextArea placeholder="e.g. 1st Floor IT Room" rows={3} className="rounded-lg" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsCupboardModalOpen(false)} className="rounded-lg">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} className="bg-blue-600 rounded-lg">Save Cupboard</Button>
          </div>
        </Form>
        
      </Modal>

      
      <Modal title={<Title level={4}>Add Storage Place</Title>} open={isPlaceModalOpen} onCancel={() => setIsPlaceModalOpen(false)} footer={null} destroyOnClose>
        <Form layout="vertical" form={placeForm} onFinish={handleAddPlace} className="mt-4">
          
         
          <Form.Item name="cupboard_id" label="Select Cupboard" rules={[{ required: true, message: 'Please select a cupboard!' }]}>
            <Select 
              placeholder="Select a Cupboard" 
              className="rounded-lg"
              options={cupboards.map((c: any) => ({
                value: c.id,
                label: `[CUP-${c.id}] ${c.name}`
              }))}
            />
          </Form.Item>

          <Form.Item name="name" label="Place Name" rules={[{ required: true, message: 'Required!' }]}>
            <Input placeholder="e.g. Top Shelf" className="rounded-lg" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="What goes here?" rows={3} className="rounded-lg" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsPlaceModalOpen(false)} className="rounded-lg">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} className="bg-purple-600 rounded-lg">Save Place</Button>
          </div>
        </Form>
      </Modal>

    </AdminLayout>
  );
}