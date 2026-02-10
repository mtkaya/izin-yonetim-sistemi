import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Select, DatePicker, InputNumber,
  Space, message, Popconfirm, Row, Col, Typography, Tabs, Tag, Input, Card, Statistic,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
  ClockCircleOutlined, BarChartOutlined, FilterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { mesaiService } from '../services/mesaiService';
import { personelService } from '../services/personelService';
import type { MesaiKaydi, MesaiNedeni, MesaiOzet, Personel, MesaiOzetResponse } from '../types';

const { Title } = Typography;
const { TextArea } = Input;

const aylar = [
  { value: 1, label: 'Ocak' }, { value: 2, label: 'Subat' },
  { value: 3, label: 'Mart' }, { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayis' }, { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' }, { value: 8, label: 'Agustos' },
  { value: 9, label: 'Eylul' }, { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasim' }, { value: 12, label: 'Aralik' },
];

const yillar = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - 2 + i;
  return { value: y, label: String(y) };
});

export default function MesaiPage() {
  const [kayitlar, setKayitlar] = useState<MesaiKaydi[]>([]);
  const [personeller, setPersoneller] = useState<Personel[]>([]);
  const [nedenler, setNedenler] = useState<MesaiNedeni[]>([]);
  const [ozetResponse, setOzetResponse] = useState<MesaiOzetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [yil, setYil] = useState(new Date().getFullYear());
  const [ay, setAy] = useState(new Date().getMonth() + 1);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [k, p, n, o] = await Promise.all([
        mesaiService.getAll({ yil, ay }),
        personelService.getAll(),
        mesaiService.getNedenler(),
        mesaiService.getOzet({ yil, ay }),
      ]);
      setKayitlar(k);
      setPersoneller(p);
      setNedenler(n);
      setOzetResponse(o);
    } catch {
      message.error('Veriler yuklenemedi');
    } finally {
      setLoading(false);
    }
  }, [yil, ay]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        personelId: values.personelId,
        mesaiNedeniId: values.mesaiNedeniId,
        tarih: values.tarih.format('YYYY-MM-DD'),
        saat: values.saat,
        aciklama: values.aciklama,
      };

      if (editingId) {
        await mesaiService.update(editingId, data);
        message.success('Mesai kaydi guncellendi');
      } else {
        await mesaiService.create(data);
        message.success('Mesai kaydi olusturuldu');
      }

      setModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchData();
    } catch {
      // validation error
    }
  };

  const handleEdit = (record: MesaiKaydi) => {
    setEditingId(record.id);
    form.setFieldsValue({
      personelId: record.personelId,
      mesaiNedeniId: record.mesaiNedeniId,
      tarih: dayjs(record.tarih),
      saat: Number(record.saat),
      aciklama: record.aciklama,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await mesaiService.delete(id);
      message.success('Mesai kaydi silindi');
      fetchData();
    } catch {
      message.error('Silme islemi basarisiz');
    }
  };

  // --- DETAY TAB KOLONLARI ---
  const detayColumns = [
    {
      title: 'Sicil No', dataIndex: ['personel', 'sicilNo'], key: 'sicilNo', width: 90,
      sorter: (a: MesaiKaydi, b: MesaiKaydi) =>
        (a.personel?.sicilNo || '').localeCompare(b.personel?.sicilNo || ''),
    },
    {
      title: 'Ad Soyad', key: 'adSoyad',
      render: (_: unknown, r: MesaiKaydi) =>
        r.personel ? `${r.personel.ad} ${r.personel.soyad}` : '-',
    },
    { title: 'Birim', dataIndex: ['personel', 'birim', 'ad'], key: 'birim' },
    {
      title: 'Tarih', dataIndex: 'tarih', key: 'tarih', width: 110,
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
      sorter: (a: MesaiKaydi, b: MesaiKaydi) =>
        new Date(a.tarih).getTime() - new Date(b.tarih).getTime(),
    },
    {
      title: 'Saat', dataIndex: 'saat', key: 'saat', width: 80,
      render: (v: number) => Number(v),
      sorter: (a: MesaiKaydi, b: MesaiKaydi) => Number(a.saat) - Number(b.saat),
    },
    {
      title: 'Mesai Nedeni', dataIndex: ['mesaiNedeni', 'ad'], key: 'neden', width: 150,
      filters: nedenler.map((n) => ({ text: n.ad, value: n.ad })),
      onFilter: (value: unknown, record: MesaiKaydi) => record.mesaiNedeni?.ad === value,
    },
    { title: 'Aciklama', dataIndex: 'aciklama', key: 'aciklama', ellipsis: true },
    {
      title: 'Islemler', key: 'actions', width: 100,
      render: (_: unknown, record: MesaiKaydi) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Popconfirm title="Silmek istediginize emin misiniz?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- OZET TAB KOLONLARI ---
  const ozetColumns = [
    { title: 'Sicil No', dataIndex: 'sicilNo', key: 'sicilNo', width: 90 },
    { title: 'Ad Soyad', dataIndex: 'adSoyad', key: 'adSoyad' },
    { title: 'Birim', dataIndex: 'birim', key: 'birim' },
    {
      title: 'Fazla Mesai', dataIndex: 'fazlaMesaiSaati', key: 'fm', width: 120,
      render: (v: number) => v > 0 ? <Tag color="blue">{v} saat</Tag> : '-',
      sorter: (a: MesaiOzet, b: MesaiOzet) => a.fazlaMesaiSaati - b.fazlaMesaiSaati,
    },
    {
      title: 'Pazar', dataIndex: 'pazarSaati', key: 'pazar', width: 100,
      render: (v: number) => v > 0 ? <Tag color="orange">{v} saat</Tag> : '-',
    },
    {
      title: 'Bayram', dataIndex: 'bayramCalismasi', key: 'bayram', width: 100,
      render: (v: number) => v > 0 ? <Tag color="red">{v} saat</Tag> : '-',
    },
    {
      title: 'Servis', dataIndex: 'servisSaati', key: 'servis', width: 100,
      render: (v: number) => v > 0 ? <Tag color="green">{v} saat</Tag> : '-',
    },
    {
      title: 'FM + Servis', dataIndex: 'toplamFazlaMesaiVeServisSaati', key: 'fmServis', width: 120,
      render: (v: number) => <strong>{v} saat</strong>,
    },
    {
      title: 'Toplam', dataIndex: 'genelToplam', key: 'toplam', width: 110,
      render: (v: number) => <Tag color="purple">{v} saat</Tag>,
      sorter: (a: MesaiOzet, b: MesaiOzet) => a.genelToplam - b.genelToplam,
    },
  ];

  const ozetSummary = () => {
    const data = ozetResponse?.ozetler || [];
    if (data.length === 0) return undefined;
    const toplam = data.reduce(
      (acc, o) => ({
        fm: acc.fm + o.fazlaMesaiSaati,
        pazar: acc.pazar + o.pazarSaati,
        bayram: acc.bayram + o.bayramCalismasi,
        servis: acc.servis + o.servisSaati,
        fmServis: acc.fmServis + o.toplamFazlaMesaiVeServisSaati,
        genel: acc.genel + o.genelToplam,
      }),
      { fm: 0, pazar: 0, bayram: 0, servis: 0, fmServis: 0, genel: 0 }
    );
    return (
      <Table.Summary.Row>
        <Table.Summary.Cell index={0} colSpan={3}><strong>TOPLAM</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={3}><strong>{toplam.fm}</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={4}><strong>{toplam.pazar}</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={5}><strong>{toplam.bayram}</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={6}><strong>{toplam.servis}</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={7}><strong>{toplam.fmServis}</strong></Table.Summary.Cell>
        <Table.Summary.Cell index={8}><Tag color="purple"><strong>{toplam.genel} saat</strong></Tag></Table.Summary.Cell>
      </Table.Summary.Row>
    );
  };

  const tabItems = [
    {
      key: 'detay',
      label: 'Detay Kayitlar',
      icon: <ClockCircleOutlined />,
      children: (
        <Table
          columns={detayColumns}
          dataSource={kayitlar}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t: number) => `Toplam ${t} kayit` }}
        />
      ),
    },
    {
      key: 'ozet',
      label: 'Donem Ozeti',
      icon: <BarChartOutlined />,
      children: (
        <Table
          columns={ozetColumns}
          dataSource={ozetResponse?.ozetler || []}
          rowKey="personelId"
          loading={loading}
          size="middle"
          pagination={false}
          summary={ozetSummary}
        />
      ),
    },
    {
      key: 'filtreli',
      label: 'Filtreli (Saat > 0)',
      icon: <FilterOutlined />,
      children: (
        <Table
          columns={detayColumns}
          dataSource={kayitlar.filter((k) => Number(k.saat) > 0)}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t: number) => `Toplam ${t} kayit` }}
        />
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Mesai Islemleri</Title>
        </Col>
        <Col>
          <Space>
            <Select value={yil} onChange={setYil} style={{ width: 100 }} options={yillar} />
            <Select value={ay} onChange={setAy} style={{ width: 120 }} options={aylar} />
            <Button icon={<DownloadOutlined />} onClick={() => window.open(mesaiService.exportDetayExcel(yil, ay))}>
              Detay Excel
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => window.open(mesaiService.exportOzetExcel(yil, ay))}>
              Ozet Excel
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>
              Yeni Mesai Kaydi
            </Button>
          </Space>
        </Col>
      </Row>

      {ozetResponse?.donem && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="Odeme Donemi" value={ozetResponse.donem.etiket} />
            </Col>
            <Col span={8}>
              <Statistic title="Donem Baslangici" value={dayjs(ozetResponse.donem.baslangic).format('DD.MM.YYYY')} />
            </Col>
            <Col span={8}>
              <Statistic title="Donem Bitisi" value={dayjs(ozetResponse.donem.bitis).format('DD.MM.YYYY')} />
            </Col>
          </Row>
        </Card>
      )}

      <Tabs items={tabItems} />

      <Modal
        title={editingId ? 'Mesai Kaydi Duzenle' : 'Yeni Mesai Kaydi'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingId(null); }}
        okText="Kaydet"
        cancelText="Iptal"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="personelId" label="Personel" rules={[{ required: true, message: 'Personel seciniz' }]}>
                <Select
                  showSearch
                  placeholder="Sicil No veya Ad ile ara..."
                  optionFilterProp="label"
                  options={personeller.map((p) => ({
                    value: p.id,
                    label: `${p.sicilNo} - ${p.ad} ${p.soyad}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mesaiNedeniId" label="Mesai Nedeni" rules={[{ required: true, message: 'Neden seciniz' }]}>
                <Select placeholder="Mesai nedeni seciniz">
                  {nedenler.map((n) => (
                    <Select.Option key={n.id} value={n.id}>{n.ad}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="tarih" label="Tarih" rules={[{ required: true, message: 'Tarih seciniz' }]}>
                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="saat" label="Saat" rules={[{ required: true, message: 'Saat giriniz' }]}>
                <InputNumber min={0} max={24} step={0.5} style={{ width: '100%' }} placeholder="Ornegin: 2.5" />
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
