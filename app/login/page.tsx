"use client";

import React, { useState } from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import api from "../lib/axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  type LoginFormValues = { email: string; password: string; remember?: boolean };

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await api.post('/login', values);
      if (res.data.token) {
        Cookies.set('token', res.data.token, { expires: 7 });
        Cookies.set('email', values.email, { expires: 7 });
        const userRole = res.data.user?.role || 'Admin';
        Cookies.set('role', userRole, { expires: 7 });
        toast.success('Login successful! Redirecting...');
        router.push('/');
      }
    } catch {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>

      {/* ── Decorative blobs ── */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 64px',
          background: 'linear-gradient(160deg, rgba(15,23,42,0.98) 0%, rgba(30,27,75,0.95) 100%)',
          borderRight: '1px solid rgba(99,102,241,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          {/* Logo icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 0 40px rgba(99,102,241,0.5)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h10M4 17h7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 style={{
            margin: 0, marginBottom: 12,
            fontSize: 32, fontWeight: 900, lineHeight: 1.2,
            color: '#f1f5f9', letterSpacing: '-0.03em',
          }}>
            Inventory Management
            <span style={{
              display: 'block', fontSize: 28,
              background: 'linear-gradient(135deg, #a5b4fc, #67e8f9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              System
            </span>
          </h1>

          <p style={{ margin: '0 0 36px', color: '#64748b', fontSize: 15, lineHeight: 1.6 }}>
            Secure and trackable inventory control for your organisation.
          </p>

          {/* Security badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 99, color: '#34d399', fontSize: 13, fontWeight: 600,
          }}>
            <SafetyCertificateOutlined />
            Secured · Restricted Access Only
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        width: '100%',
        maxWidth: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 40px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div
          className="glass-card animate-fade-in-up"
          style={{ width: '100%', maxWidth: 420, padding: '40px 36px' }}
        >
          {/* Card header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}>
              <LockOutlined style={{ fontSize: 20, color: 'white' }} />
            </div>
            <h2 style={{ margin: 0, marginBottom: 6, fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>
              Welcome back
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              Sign in to access the IMS portal
            </p>
          </div>

          <Form name="login_form" layout="vertical" initialValues={{ remember: true }} onFinish={onFinish}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="admin@company.com"
                size="large"
                style={{ height: 46 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
                style={{ height: 46 }}
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: '#94a3b8', fontSize: 13 }}>Remember me</Checkbox>
              </Form.Item>
              <a style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Forgot Password?
              </a>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
                style={{
                  height: 48,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: '0.02em',
                  boxShadow: '0 6px 20px rgba(99,102,241,0.45)',
                }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: '1px solid rgba(99,102,241,0.12)',
            textAlign: 'center',
            color: '#334155',
            fontSize: 12,
          }}>
            No public registration. Contact your System Administrator for access.
          </div>
        </div>
      </div>
    </div>
  );
}