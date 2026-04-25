"use client";

import React, { useEffect, useState } from 'react';
import { Typography, Button, Table, Tabs, Input, Space, Modal, Form, Select, DatePicker, Tag } from 'antd';
import { PlusOutlined, SwapOutlined, HistoryOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout'; 
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import api from '../lib/axios';


const { Title, Text } = Typography;

export default function BorrowingsPage() {
  const [activeTab, setActiveTab] = useState('1');
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null); 
  const [borrowForm] = Form.useForm();
  const [returnForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      
      const [borrowRes, itemsRes] = await Promise.all([
        api.get('/borrowings'),
        api.get('/items')
      ]);
      setBorrowings(borrowRes.data);
      
    
      const inStoreItems = itemsRes.data.filter((item: any) => item.status === 'In-Store');
      setAvailableItems(inStoreItems);
    } catch (error) {
        toast.error('Failed to load data. Please try again.');
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);

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
        quantity_borrowed: 1 
      };
      
      await api.post('/borrowings', payload);
      toast.success('Item borrowed successfully!');
      setIsBorrowModalOpen(false);
      borrowForm.resetFields();
      fetchData(); 
    } catch (error) {
         toast.error('Failed to borrow item. Please try again.');
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReturnSubmit = async (values: any) => {
    setSubmitLoading(true);
    try {
      const payload = {
        ...values,
        return_date: values.return_date.format('YYYY-MM-DD')
      };
      await api.post(`/borrowings/${selectedRecordId}/return`, payload);
      toast.success('Item returned successfully!');
      setIsReturnModalOpen(false);
      returnForm.resetFields();
      fetchData(); 
    } catch (error) {
      toast.error('Failed to process return. Please try again.');
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };
  const openReturnModal = (record: any) => {
    setSelectedRecordId(record.id); 
    setIsReturnModalOpen(true);
  };
  const activeColumns = [
    { title: 'Borrow ID', dataIndex: 'id', key: 'id', render: (id: number) => <Tag color="blue">BRW-{id}</Tag> },
    { title: 'Item ID', dataIndex: 'item_id', key: 'item_id', render: (id: number) => <Text strong>ITM-{id}</Text> },
    { title: 'Borrower', dataIndex: 'borrower_name', key: 'borrower_name' },
    { title: 'Contact', dataIndex: 'contact_details', key: 'contact_details' },
    { title: 'Borrow Date', dataIndex: 'borrow_date', key: 'borrow_date' },
    { title: 'Due Date', dataIndex: 'expected_return_date', key: 'expected_return_date' },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => {
        const isOverdue = dayjs().isAfter(dayjs(record.expected_return_date));
        if (isOverdue) return <Tag color="error" icon={<ExclamationCircleOutlined />}>OVERDUE</Tag>;
        return <Tag color="processing">ACTIVE</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          size="small" 
          className="bg-emerald-500 hover:bg-emerald-600 border-none"
          onClick={() => openReturnModal(record)}
        >
          Return Item
        </Button>
      ),
    },
  ];

  const historyColumns = [
    { title: 'Record ID', dataIndex: 'id', key: 'id', render: (id: number) => <Text type="secondary">REC-{id}</Text> },
    { title: 'Item ID', dataIndex: 'item_id', key: 'item_id', render: (id: number) => <Text strong>ITM-{id}</Text> },
    { title: 'Borrower', dataIndex: 'borrower_name', key: 'borrower_name' },
    { title: 'Returned On', dataIndex: 'return_date', key: 'return_date' },
    {
      title: 'Condition',
      key: 'condition',
      dataIndex: 'condition',
      render: (condition: string) => {
        const color = condition === 'Good' ? 'success' : condition === 'Damaged' ? 'error' : 'warning';
        return <Tag color={color}>{condition?.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Borrowing System</Title>
          <Text type="secondary">Track who borrowed what, and manage item returns.</Text>
        </div>
        
        <Button type="primary" icon={<PlusOutlined />} size="large" className="bg-blue-600 rounded-lg" onClick={() => setIsBorrowModalOpen(true)}>
          Lend New Item
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: '1',
              label: <span className="text-base"><SwapOutlined /> Active Borrows</span>,
              children: <Table columns={activeColumns} dataSource={activeBorrows} loading={loading} rowKey="id" pagination={{ pageSize: 5 }} />
            },
            {
              key: '2',
              label: <span className="text-base"><HistoryOutlined /> Return History</span>,
              children: <Table columns={historyColumns} dataSource={returnHistory} loading={loading} rowKey="id" pagination={{ pageSize: 5 }} />
            }
          ]}
        />
      </div>
      <Modal title={<Title level={4}>Lend an Item</Title>} open={isBorrowModalOpen} onCancel={() => setIsBorrowModalOpen(false)} footer={null} destroyOnClose>
        <Form layout="vertical" form={borrowForm} onFinish={handleBorrowSubmit} className="mt-4">
          <Form.Item name="item_id" label="Select Item" rules={[{ required: true, message: 'Select an item' }]}>
            <Select 
              placeholder="Search for an Item" 
              className="rounded-lg"
              options={availableItems.map(item => ({
                value: item.id,
                label: `[ITM-${item.id}] ${item.name} (Qty: ${item.quantity})`
              }))}
            />
          </Form.Item>
          
          <div className="flex gap-4">
            <Form.Item name="borrower_name" label="Borrower Name" className="w-1/2" rules={[{ required: true }]}>
              <Input placeholder="e.g. Kasun Perera" className="rounded-lg" />
            </Form.Item>
            <Form.Item name="contact_details" label="Contact Number" className="w-1/2" rules={[{ required: true }]}>
              <Input placeholder="077xxxxxxx" className="rounded-lg" />
            </Form.Item>
          </div>

          <div className="flex gap-4">
            <Form.Item name="borrow_date" label="Borrow Date" className="w-1/2" rules={[{ required: true }]}>
              <DatePicker className="w-full rounded-lg" />
            </Form.Item>
            <Form.Item name="expected_return_date" label="Expected Return Date" className="w-1/2" rules={[{ required: true }]}>
              <DatePicker className="w-full rounded-lg" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsBorrowModalOpen(false)} className="rounded-lg">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} className="bg-blue-600 rounded-lg">Confirm Lending</Button>
          </div>
        </Form>
      </Modal>
      <Modal title={<Title level={4}>Process Item Return</Title>} open={isReturnModalOpen} onCancel={() => setIsReturnModalOpen(false)} footer={null} destroyOnClose>
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <Text className="text-blue-700">Please verify the item condition before accepting the return.</Text>
        </div>

        <Form layout="vertical" form={returnForm} onFinish={handleReturnSubmit}>
          <Form.Item name="return_date" label="Return Date" rules={[{ required: true }]}>
             <DatePicker className="w-full rounded-lg" />
          </Form.Item>

          <Form.Item name="condition" label="Item Condition" initialValue="Good" rules={[{ required: true }]}>
            <Select className="rounded-lg" options={[
              { value: 'Good', label: 'Good (No Damage)' },
              { value: 'Damaged', label: 'Damaged' },
              { value: 'Lost', label: 'Lost / Missing' },
            ]} />
          </Form.Item>

          <Form.Item name="notes" label="Return Notes (Optional)">
             <Input.TextArea placeholder="Any damages or issues?" rows={3} className="rounded-lg" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsReturnModalOpen(false)} className="rounded-lg">Cancel</Button>
            <Button type="primary" htmlType="submit" loading={submitLoading} className="bg-emerald-500 hover:bg-emerald-600 rounded-lg border-none">
              Accept Return
            </Button>
          </div>
        </Form>
      </Modal>

    </AdminLayout>
  );
}