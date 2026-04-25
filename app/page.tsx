"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Statistic, List, Tag, Skeleton, Divider } from 'antd';
import { 
  AppstoreOutlined, 
  WarningOutlined, 
  SwapOutlined, 
  TeamOutlined, 
  HistoryOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import AdminLayout from './components/AdminLayout'; 
import api from './lib/axios'; 
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  

  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    activeBorrows: 0,
    totalUsers: 0
  });
  

  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const [lowStockList, setLowStockList] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
   
      const [itemsRes, borrowsRes, usersRes, logsRes] = await Promise.all([
        api.get('/items').catch(() => ({ data: [] })),
        api.get('/borrowings').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/audit-logs').catch(() => ({ data: [] }))
      ]);

      const items = itemsRes.data;
      const borrowings = borrowsRes.data;
      const users = usersRes.data;
      const logs = logsRes.data;


      const lowStock = items.filter((item: any) => item.quantity <= 5);
      const activeBorrows = borrowings.filter((b: any) => !b.return_date);

      setStats({
        totalItems: items.length,
        lowStockItems: lowStock.length,
        activeBorrows: activeBorrows.length,
        totalUsers: users.length
      });


      setLowStockList(lowStock.slice(0, 5));


      const sortedLogs = logs.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentLogs(sortedLogs.slice(0, 5));

    } catch (error) {
      console.error("Failed to fetch dashboard data");
      toast.error("Could not load dashboard data completely.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchDashboardData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  
  const getLogTagColor = (action: string) => {
    if (action?.toLowerCase().includes('create')) return 'success';
    if (action?.toLowerCase().includes('update')) return 'processing';
    if (action?.toLowerCase().includes('delete')) return 'error';
    if (action?.toLowerCase().includes('borrow')) return 'warning';
    if (action?.toLowerCase().includes('return')) return 'cyan';
    return 'default';
  };

  return (
    <AdminLayout>
      
   
      <div className="mb-8">
        <Title level={2} style={{ margin: 0 }}>Overview Dashboard</Title>
        <Text type="secondary" className="text-base">
          Welcome to Ceyntics Internal Inventory Management System.
        </Text>
      </div>

   
      <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
        <Row gutter={[16, 16]} className="mb-8">
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm rounded-xl">
              <Statistic
                title={<Text className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Total Items</Text>}
                value={stats.totalItems}
                prefix={<AppstoreOutlined className="text-blue-500 mr-2" />}
                valueStyle={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: '2rem' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-sm rounded-xl">
              <Statistic
                title={<Text className="text-red-600 font-semibold text-sm uppercase tracking-wider">Low Stock Alerts</Text>}
                value={stats.lowStockItems}
                prefix={<WarningOutlined className="text-red-500 mr-2" />}
                valueStyle={{ color: '#7f1d1d', fontWeight: 'bold', fontSize: '2rem' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 shadow-sm rounded-xl">
              <Statistic
                title={<Text className="text-amber-600 font-semibold text-sm uppercase tracking-wider">Active Borrows</Text>}
                value={stats.activeBorrows}
                prefix={<SwapOutlined className="text-amber-500 mr-2" />}
                valueStyle={{ color: '#78350f', fontWeight: 'bold', fontSize: '2rem' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm rounded-xl">
              <Statistic
                title={<Text className="text-purple-600 font-semibold text-sm uppercase tracking-wider">System Users</Text>}
                value={stats.totalUsers}
                prefix={<TeamOutlined className="text-purple-500 mr-2" />}
                valueStyle={{ color: '#4c1d95', fontWeight: 'bold', fontSize: '2rem' }}
              />
            </Card>
          </Col>

        </Row>
      </Skeleton>

      <Row gutter={[24, 24]}>
    
        <Col xs={24} lg={16}>
          <Card 
            title={<><HistoryOutlined className="mr-2"/> Recent Activities</>} 
            className="rounded-xl shadow-sm border-gray-100 h-full"
            bodyStyle={{ padding: '0 24px' }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              <List
                itemLayout="horizontal"
                dataSource={recentLogs}
                renderItem={(log: any) => (
                  <List.Item className="py-4 border-b border-gray-50">
                    <List.Item.Meta
                      title={
                        <div className="flex items-center gap-3">
                          <Tag color={getLogTagColor(log.action)} className="rounded-full m-0">
                            {log.action?.toUpperCase()}
                          </Tag>
                          <Text strong>{log.user_email || 'System'}</Text>
                        </div>
                      }
                      description={<Text className="text-gray-500">{log.description}</Text>}
                    />
                    <div className="text-xs text-gray-400">
                      {dayjs(log.created_at).format('MMM DD, hh:mm A')}
                    </div>
                  </List.Item>
                )}
                locale={{ emptyText: 'No recent activities found.' }}
              />
            </Skeleton>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<><WarningOutlined className="mr-2 text-red-500"/> Needs Attention</>} 
            className="rounded-xl shadow-sm border-gray-100 mb-6"
          >
            <Skeleton loading={loading} active paragraph={{ rows: 3 }}>
              {lowStockList.length > 0 ? (
                <List
                  dataSource={lowStockList}
                  renderItem={(item: any) => (
                    <List.Item className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <Text className="truncate max-w-[150px]">{item.name}</Text>
                      <Tag color="error" className="rounded-full m-0 border-none bg-red-100 text-red-600">
                        Qty: {item.quantity}
                      </Tag>
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center py-4 text-emerald-600 bg-emerald-50 rounded-lg">
                  <CheckCircleIcon className="mx-auto text-2xl mb-2" />
                  <p>All items have sufficient stock!</p>
                </div>
              )}
            </Skeleton>
          </Card>

          <Card className="rounded-xl shadow-sm border-gray-100 bg-slate-800 text-white">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <SafetyCertificateOutlined className="text-2xl text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white m-0 text-lg">System Secure</h4>
                  <Text className="text-slate-400 text-sm">RBAC & Authentication Active</Text>
                </div>
             </div>
          </Card>
        </Col>

      </Row>

    </AdminLayout>
  );
}

const CheckCircleIcon = (props: any) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);