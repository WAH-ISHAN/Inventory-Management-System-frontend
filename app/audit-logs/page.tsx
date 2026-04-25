"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Input, Space, Select, Card } from 'antd';
import { SearchOutlined, HistoryOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout'; 
import api from '../lib/axios'; 
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);

    try {

        toast.loading('Fetching audit logs...');
      const response = await api.get('/audit-logs');
      const sortedLogs = response.data.sort((a: any, b: any) => 

        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

      );
      setLogs(sortedLogs);

    } catch (error) {

    toast.error('Failed to fetch audit logs');
    console.error("Failed to fetch audit logs");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchLogs();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const filteredLogs = logs.filter(log => {


    const matchesSearch = log.description?.toLowerCase().includes(searchText.toLowerCase()) || 
                          log.user_email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesAction = filterAction === 'All' || log.action === filterAction;
    return matchesSearch && matchesAction;

  });
  const columns = [
    { 
      title: 'Log ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: '100px',
      render: (id: number) => <Text type="secondary">LOG-{id}</Text> 
    },
    {

      title: 'Action Type',
      key: 'action',
      dataIndex: 'action',
      width: '150px',

      render: (action: string) => 
        {

        let color = 'default';
        if (action?.toLowerCase().includes('create')) color = 'success';
        else if (action?.toLowerCase().includes('update')) color = 'processing';
        else if (action?.toLowerCase().includes('delete')) color = 'error';
        else if (action?.toLowerCase().includes('borrow')) color = 'warning';
        else if (action?.toLowerCase().includes('return')) color = 'cyan';
        else if (action?.toLowerCase().includes('login')) color = 'purple';

        return <Tag color={color} className="rounded-full px-3 font-semibold">{action?.toUpperCase()}
        </Tag>;

      },

    },

    { 
      title: 'Performed By', 
      dataIndex: 'user_email', 
      key: 'user_email',
      render: (text: string) => <Text strong>{text || 'System / Admin'}</Text>
    },


    { 
      title: 'Description / Changes', 
      dataIndex: 'description', 
      key: 'description' 
    },


    { 
      title: 'Timestamp', 
      dataIndex: 'created_at', 
      key: 'created_at',
      width: '200px',
      render: (date: string) => (
        <span className="text-gray-500 font-medium">
          {dayjs(date).format('YYYY MMM DD, hh:mm A')}
        </span>
      )
    },


  ];

  return (

    <AdminLayout>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-800 rounded-lg">
            <HistoryOutlined className="text-white text-xl" />
          </div>

          <div>
            
            <Title level={3} style={{ margin: 0 }}>System Audit Logs</Title>
            <Text type="secondary">Monitor all user activities and system changes in real-time.</Text>
          </div>

        </div>


      </div>

      <Card className="mb-6 bg-slate-50 border-slate-200">
        <Text className="text-slate-600">

          <strong>Security Notice:</strong> Audit logs are read-only and cannot be modified or deleted. They are retained for compliance and security monitoring.
        </Text>

      </Card>


      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">

        <Input 
          size="large" 
          placeholder="Search logs by description or user..." 
          prefix={<SearchOutlined className="text-gray-400" />} 
          className="max-w-md rounded-lg"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Select 
          size="large" 
          value={filterAction} 
          onChange={(val) => setFilterAction(val)} 
          className="w-48" 
          options={[
            { value: 'All', label: 'All Actions' },
            { value: 'CREATE', label: 'Created' },
            { value: 'UPDATE', label: 'Updated' },
            { value: 'DELETE', label: 'Deleted' },
            { value: 'BORROW', label: 'Borrowed' },
            { value: 'RETURN', label: 'Returned' },
            { value: 'LOGIN', label: 'Logins' },
          ]} 

        />

      </div>



      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredLogs} 
          loading={loading} 
          rowKey="id" 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} log entries`
          }}
          size="middle"
        />

      </div>

    </AdminLayout>
    
  );
}