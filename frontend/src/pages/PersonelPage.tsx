import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber,
  Space, message, Popconfirm, Card, Row, Col, Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { personelService } from '../services/personelService';
import client from '../api/client';
import type { Personel, Birim } from '../types';

const { Title } = Typography;

export default function PersonelPage() {
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [birimler, setBirimler] = useState<Birim[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, b] = await Promise.all([
        personelService.getAll(),
        client.get<Birim[]>('/birim').then((r) => r.data),
      ]);
      setPersoneller(p);
      setBirimler(b);
    } catch {
      message.error('Veriler yuklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = async () => {
    if (!searchText.trim()) {
      fetchData();
      return;
    }
    setLoading(true);
    try {
      const result = await personelService.search(searchText);
      setPersoneller(result);
    } catch {
      message.error('Arama yapilamadi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        hakTarih: values.hakTarih?.format('YYYY-MM-DD'),
        goreveBaslamaTarihi: values.goreveBaslamaTarihi?.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await personelService.update(editingId, data);
        message.success('Personel guncellendi');
      } else {
        await personelService.create(data);
        message.success('Personel eklendi');
      }

      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      if (err.response?.data?.error) {
        message.error(err.response.data.error);
      }
    }
  };

  const handleEdit = (record: Personel) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      hakTarih: record.hakTarih ? dayjs(record.hakTarih) : null,
      goreveBaslamaTarihi: record.goreveBaslamaTarihi ? dayjs(record.goreveBaslamaTarihi) : null,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await personelService.delete(id);
      message.success('Personel silindi');
      fetchData();
    } catch {
      message.error('Personel silinemedi');
    }
  };

  const columns = [
    { title: 'Sicil No', dataIndex: 'sicilNo', key: 'sicilNo', width: 100 },
    { title: 'Ad', dataIndex: 'ad', key: 'ad' },
    { title: 'Soyad', dataIndex: 'soyad', key: 'soyad' },
    { title: 'Birim', dataIndex: ['birim', 'ad'], key: 'birim' },
    { title: 'Telefon', dataIndex: 'telefon', key: 'telefon' },
    {
      title: 'Hak Tarihi',
      dataIndex: 'hakTarih',
      key: 'hakTarih',
      render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '-',
    },
    { title: 'Hizmet (Yil)', dataIndex: 'hizmetSuresi', key: 'hizmetSuresi', width: 100 },
    { title: 'Puantor', dataIndex: 'puantor', key: 'puantor' },
    {
      title: 'Islemler',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Personel) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Popconfirm title="Silmek istediginize emin misiniz?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Personel Yonetimi</Title></Col>
        <Col>
          <Space>
            <Input
              placeholder="Sicil No veya Ad ile ara..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 250 }}
              suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer' }} />}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setEditingId(null);
              form.resetFields();
              setModalOpen(true);
            }}>
              Yeni Personel
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={personeller}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Toplam ${t} kayit` }}
      />

      <Modal
        title={editingId ? 'Personel Duzenle' : 'Yeni Personel'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingId(null); }}
        okText="Kaydet"
        cancelText="Iptal"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sicilNo" label="Sicil No" rules={[{ required: true, message: 'Sicil no giriniz' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ad" label="Ad" rules={[{ required: true, message: 'Ad giriniz' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="soyad" label="Soyad" rules={[{ required: true, message: 'Soyad giriniz' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="birimId" label="Birim">
                <Select allowClear placeholder="Birim seciniz">
                  {birimler.map((b) => (
                    <Select.Option key={b.id} value={b.id}>{b.ad}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="telefon" label="Telefon">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="puantor" label="Puantor">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="hakTarih" label="Hak Tarihi">
                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="goreveBaslamaTarihi" label="Goreve Baslama Tarihi">
                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hizmetSuresi" label="Hizmet Suresi (Yil)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
