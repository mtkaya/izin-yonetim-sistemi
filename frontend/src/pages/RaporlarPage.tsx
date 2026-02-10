import { useState, useEffect } from 'react';
import {
  Table, Card, Row, Col, Typography, Select, Button, Tabs, Tag, Space, message,
} from 'antd';
import { DownloadOutlined, CalendarOutlined, BarChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { raporService } from '../services/raporService';
import type { YillikIzinOzet, TakvimVerisi, PivotRapor } from '../types';

const { Title } = Typography;

export default function RaporlarPage() {
  const [yil, setYil] = useState(new Date().getFullYear());
  const [ozet, setOzet] = useState<YillikIzinOzet[]>([]);
  const [takvim, setTakvim] = useState<TakvimVerisi[]>([]);
  const [pivot, setPivot] = useState<PivotRapor | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [o, t, p] = await Promise.all([
        raporService.yillikIzinOzet(yil),
        raporService.takvim(yil),
        raporService.pivot(yil),
      ]);
      setOzet(o);
      setTakvim(t);
      setPivot(p);
    } catch {
      message.error('Rapor verileri yuklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [yil]);

  const yillar = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const ozetColumns = [
    { title: 'Sicil No', dataIndex: 'sicilNo', key: 'sicilNo', width: 90 },
    { title: 'Ad Soyad', dataIndex: 'adSoyad', key: 'adSoyad' },
    { title: 'Birim', dataIndex: 'birim', key: 'birim' },
    { title: 'Hizmet (Yil)', dataIndex: 'hizmetSuresi', key: 'hizmet', width: 100 },
    { title: 'Toplam Hak', dataIndex: 'toplam', key: 'toplam', width: 100 },
    { title: 'Kullanilan', dataIndex: 'kullanilan', key: 'kullanilan', width: 100 },
    {
      title: 'Kalan',
      dataIndex: 'kalan',
      key: 'kalan',
      width: 100,
      render: (v: number) => (
        <Tag color={v > 5 ? 'green' : v > 0 ? 'orange' : 'red'}>{v} gun</Tag>
      ),
    },
  ];

  const takvimColumns = [
    { title: 'Personel', dataIndex: 'personel', key: 'personel' },
    { title: 'Izin Turu', dataIndex: 'izinTuru', key: 'izinTuru' },
    {
      title: 'Baslangic',
      dataIndex: 'start',
      key: 'start',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Bitis',
      dataIndex: 'end',
      key: 'end',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    { title: 'Gun', dataIndex: 'gunSayisi', key: 'gun', width: 60 },
  ];

  // Pivot tablo kolonları
  const pivotColumns = pivot
    ? [
        { title: 'Izin Turu', dataIndex: 'izinTuru', key: 'izinTuru', fixed: 'left' as const },
        ...pivot.aylar.map((ay) => ({
          title: ay,
          dataIndex: ay,
          key: ay,
          width: 80,
          render: (v: number) => v || '-',
        })),
        {
          title: 'Toplam',
          key: 'toplam',
          width: 80,
          render: (_: unknown, record: Record<string, unknown>) => {
            const total = pivot.aylar.reduce((sum, ay) => sum + (Number(record[ay]) || 0), 0);
            return <strong>{total}</strong>;
          },
        },
      ]
    : [];

  const pivotData = pivot
    ? Object.entries(pivot.pivot).map(([izinTuru, ayVerileri]) => ({
        key: izinTuru,
        izinTuru,
        ...ayVerileri,
      }))
    : [];

  const tabItems = [
    {
      key: 'ozet',
      label: 'Yillik Izin Ozet',
      icon: <BarChartOutlined />,
      children: (
        <Table
          columns={ozetColumns}
          dataSource={ozet}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={false}
          summary={() => {
            const toplamHak = ozet.reduce((s, r) => s + r.toplam, 0);
            const toplamKullanilan = ozet.reduce((s, r) => s + r.kullanilan, 0);
            const toplamKalan = ozet.reduce((s, r) => s + r.kalan, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}><strong>Toplam</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={4}><strong>{toplamHak}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={5}><strong>{toplamKullanilan}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={6}><strong>{toplamKalan}</strong></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      ),
    },
    {
      key: 'takvim',
      label: 'Izin Takvimi',
      icon: <CalendarOutlined />,
      children: (
        <Table
          columns={takvimColumns}
          dataSource={takvim}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 20 }}
        />
      ),
    },
    {
      key: 'pivot',
      label: 'Aylik Dagilim (Pivot)',
      icon: <BarChartOutlined />,
      children: (
        <Table
          columns={pivotColumns}
          dataSource={pivotData}
          loading={loading}
          size="middle"
          pagination={false}
          scroll={{ x: 1100 }}
        />
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Raporlar</Title></Col>
        <Col>
          <Space>
            <Select
              value={yil}
              onChange={setYil}
              style={{ width: 100 }}
              options={yillar.map((y) => ({ value: y, label: String(y) }))}
            />
            <Button icon={<DownloadOutlined />} onClick={() => window.open(raporService.exportPersonelExcel())}>
              Personel Excel
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => window.open(raporService.exportIzinExcel(yil))}>
              Izin Raporu Excel
            </Button>
          </Space>
        </Col>
      </Row>

      <Tabs items={tabItems} />
    </>
  );
}
