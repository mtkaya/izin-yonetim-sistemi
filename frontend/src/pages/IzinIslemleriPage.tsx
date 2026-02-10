import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Select, DatePicker, InputNumber,
  Space, message, Popconfirm, Row, Col, Typography, Card, Statistic, Input,
} from 'antd';
import { PlusOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { izinService } from '../services/izinService';
import { personelService } from '../services/personelService';
import type { IzinKaydi, Personel, IzinTuru, KalanIzin } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

export default function IzinIslemleriPage() {
  const [izinler, setIzinler] = useState<IzinKaydi[]>([]);
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [izinTurleri, setIzinTurleri] = useState<IzinTuru[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [kalanIzin, setKalanIzin] = useState<KalanIzin | null>(null);
  const [hesaplananGun, setHesaplananGun] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [iz, p, t] = await Promise.all([
        izinService.getAll({ yil: new Date().getFullYear() }),
        personelService.getAll(),
        izinService.getIzinTurleri(),
      ]);
      setIzinler(iz);
      setPersoneller(p);
      setIzinTurleri(t);
    } catch {
      message.error('Veriler yuklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePersonelChange = async (personelId: number) => {
    try {
      const kalan = await izinService.kalanIzin(personelId);
      setKalanIzin(kalan);
    } catch {
      setKalanIzin(null);
    }
  };

  const handleDateChange = async () => {
    const baslangic = form.getFieldValue('baslangicTarihi');
    const bitis = form.getFieldValue('bitisTarihi');
    if (baslangic && bitis) {
      try {
        const result = await izinService.hesaplaGun(
          baslangic.format('YYYY-MM-DD'),
          bitis.format('YYYY-MM-DD')
        );
        setHesaplananGun(result.gunSayisi);
        form.setFieldsValue({ gunSayisi: result.gunSayisi });
      } catch {
        setHesaplananGun(null);
      }
    }
  };

  const handleGunSayisiChange = async (gun: number | null) => {
    const baslangic = form.getFieldValue('baslangicTarihi');
    if (baslangic && gun && gun > 0) {
      try {
        const result = await izinService.hesaplaBitis(
          baslangic.format('YYYY-MM-DD'),
          gun
        );
        form.setFieldsValue({ bitisTarihi: dayjs(result.bitisTarihi) });
        setHesaplananGun(gun);
      } catch { /* ignore */ }
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await izinService.create({
        personelId: values.personelId,
        izinTuruId: values.izinTuruId,
        baslangicTarihi: values.baslangicTarihi.format('YYYY-MM-DD'),
        bitisTarihi: values.bitisTarihi.format('YYYY-MM-DD'),
        gunSayisi: values.gunSayisi,
        aciklama: values.aciklama,
      });
      message.success('Izin kaydi olusturuldu');
      setModalOpen(false);
      form.resetFields();
      setKalanIzin(null);
      setHesaplananGun(null);
      fetchData();
    } catch (err: any) {
      if (err.response?.data?.error) {
        message.error(err.response.data.error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await izinService.delete(id);
      message.success('Izin kaydi silindi');
      fetchData();
    } catch {
      message.error('Izin kaydi silinemedi');
    }
  };

  const columns = [
    {
      title: 'Sicil No',
      dataIndex: ['personel', 'sicilNo'],
      key: 'sicilNo',
      width: 90,
    },
    {
      title: 'Ad Soyad',
      key: 'adSoyad',
      render: (_: unknown, r: IzinKaydi) =>
        r.personel ? `${r.personel.ad} ${r.personel.soyad}` : '-',
    },
    {
      title: 'Birim',
      dataIndex: ['personel', 'birim', 'ad'],
      key: 'birim',
    },
    { title: 'Izin Turu', dataIndex: ['izinTuru', 'ad'], key: 'izinTuru' },
    {
      title: 'Baslangic',
      dataIndex: 'baslangicTarihi',
      key: 'baslangic',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Bitis',
      dataIndex: 'bitisTarihi',
      key: 'bitis',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Gun',
      dataIndex: 'gunSayisi',
      key: 'gun',
      width: 60,
      render: (v: number) => Number(v),
    },
    { title: 'Aciklama', dataIndex: 'aciklama', key: 'aciklama', ellipsis: true },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: unknown, record: IzinKaydi) => (
        <Popconfirm title="Silmek istediginize emin misiniz?" onConfirm={() => handleDelete(record.id)}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Izin Islemleri</Title></Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            form.resetFields();
            setKalanIzin(null);
            setHesaplananGun(null);
            setModalOpen(true);
          }}>
            Yeni Izin Kaydi
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={izinler}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Toplam ${t} kayit` }}
      />

      <Modal
        title="Yeni Izin Kaydi"
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); setKalanIzin(null); }}
        okText="Kaydet"
        cancelText="Iptal"
        width={700}
      >
        {kalanIzin && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small"><Statistic title="Toplam Hak" value={kalanIzin.toplam} suffix="gun" /></Card>
            </Col>
            <Col span={8}>
              <Card size="small"><Statistic title="Kullanilan" value={kalanIzin.kullanilan} suffix="gun" /></Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Kalan" value={kalanIzin.kalan} suffix="gun"
                  valueStyle={{ color: kalanIzin.kalan > 0 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="personelId" label="Personel" rules={[{ required: true, message: 'Personel seciniz' }]}>
                <Select
                  showSearch
                  placeholder="Sicil No veya Ad ile ara..."
                  optionFilterProp="label"
                  onChange={handlePersonelChange}
                  options={personeller.map((p) => ({
                    value: p.id,
                    label: `${p.sicilNo} - ${p.ad} ${p.soyad}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="izinTuruId" label="Izin Turu" rules={[{ required: true, message: 'Izin turu seciniz' }]}>
                <Select placeholder="Izin turu seciniz">
                  {izinTurleri.map((t) => (
                    <Select.Option key={t.id} value={t.id}>{t.ad}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="baslangicTarihi" label="Baslangic Tarihi" rules={[{ required: true }]}>
                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} onChange={handleDateChange} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="bitisTarihi" label="Bitis Tarihi" rules={[{ required: true }]}>
                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} onChange={handleDateChange} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gunSayisi" label={`Gun Sayisi${hesaplananGun !== null ? ` (${hesaplananGun} is gunu)` : ''}`} rules={[{ required: true }]}>
                <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} onChange={handleGunSayisiChange} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="aciklama" label="Aciklama">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
