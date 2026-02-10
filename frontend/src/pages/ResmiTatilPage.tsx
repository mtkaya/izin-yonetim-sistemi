import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, DatePicker, InputNumber,
  Space, message, Popconfirm, Row, Col, Typography, Select,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import client from '../api/client';
import type { ResmiTatil } from '../types';

const { Title } = Typography;

export default function ResmiTatilPage() {
  const [tatiller, setTatiller] = useState<ResmiTatil[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [yil, setYil] = useState(new Date().getFullYear());
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get<ResmiTatil[]>('/resmi-tatil', { params: { yil } });
      setTatiller(res.data);
    } catch {
      message.error('Tatiller yuklenemedi');
    } finally {
      setLoading(false);
    }
  }, [yil]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await client.post('/resmi-tatil', {
        ad: values.ad,
        tarih: values.tarih.format('YYYY-MM-DD'),
        gunSayisi: values.gunSayisi || 1,
      });
      message.success('Resmi tatil eklendi');
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch {
      message.error('Resmi tatil eklenemedi');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await client.delete(`/resmi-tatil/${id}`);
      message.success('Resmi tatil silindi');
      fetchData();
    } catch {
      message.error('Silinemedi');
    }
  };

  const yillar = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 3 + i);

  const columns = [
    { title: 'Tatil Adi', dataIndex: 'ad', key: 'ad' },
    {
      title: 'Tarih',
      dataIndex: 'tarih',
      key: 'tarih',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
      width: 120,
    },
    {
      title: 'Gun Sayisi',
      dataIndex: 'gunSayisi',
      key: 'gunSayisi',
      width: 100,
      render: (v: number) => Number(v),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: unknown, record: ResmiTatil) => (
        <Popconfirm title="Silmek istediginize emin misiniz?" onConfirm={() => handleDelete(record.id)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Resmi Tatiller</Title></Col>
        <Col>
          <Space>
            <Select
              value={yil}
              onChange={setYil}
              style={{ width: 100 }}
              options={yillar.map((y) => ({ value: y, label: String(y) }))}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              form.resetFields();
              setModalOpen(true);
            }}>
              Yeni Tatil Ekle
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={tatiller}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={false}
      />

      <Modal
        title="Yeni Resmi Tatil"
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="Kaydet"
        cancelText="Iptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ad" label="Tatil Adi" rules={[{ required: true, message: 'Tatil adi giriniz' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tarih" label="Tarih" rules={[{ required: true, message: 'Tarih seciniz' }]}>
            <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="gunSayisi" label="Gun Sayisi" initialValue={1}>
            <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
