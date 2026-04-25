"use client";

import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import axios from "axios";
import Cookies from "js-cookie";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  type LoginFormValues = {
    email: string;
    password: string;
    remember?: boolean;
  };

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    try{

      const res = await api.post('/login',values);
      if(res.data.token){
        Cookies.set('token', res.data.token, { expires: 7 });
        toast.success('Login successful! Redirecting...');
        router.push('/dashboard');
      }

    }catch(err){
      toast.error('Login failed. Please check your credentials and try again.');
    }
    finally{
      setLoading(false);
    }
    
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      
      {/* Left Side - Branding / Graphic Area (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract Background Design Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <Title level={2} style={{ color: 'white', margin: 0 }}>Ceyntics Systems</Title>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            Internal Inventory Management
          </Text>
        </div>

        <div className="relative z-10 max-w-md">
          <Title level={1} style={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
            Manage your hardware assets with precision.
          </Title>
          <p className="text-slate-400 mt-4 text-lg">
            Secure, reliable, and trackable inventory control for modern engineering teams.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-2 text-slate-500 text-sm">
          <SafetyCertificateOutlined />
          <span>Secured by Enterprise Grade Authentication</span>
        </div>
      </div>

      {/* Right Side - Login Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-8">
            <Title level={3} style={{ marginBottom: 4 }}>Welcome Back</Title>
            <Text type="secondary">Please enter your credentials to access the system.</Text>
          </div>

          <Form
            name="login_form"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="email"
              label={<span className="font-medium text-gray-700">Email Address</span>}
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" }
              ]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="admin@ceyntics.com" 
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="font-medium text-gray-700">Password</span>}
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <a className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer">
                Forgot Password?
              </a>
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700 h-11 rounded-lg font-semibold text-base"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '24px 0', borderColor: '#f0f0f0' }}>
            <span className="text-gray-400 text-xs">RESTRICTED ACCESS</span>
          </Divider>

          <div className="text-center">
            <Text type="secondary" className="text-xs">
              ⚠️ No public registration. If you need an account, please contact the System Administrator.
            </Text>
          </div>

        </div>
      </div>

    </div>
  );
}