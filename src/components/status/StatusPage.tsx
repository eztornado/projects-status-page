import React, { useState, useEffect } from 'react';
import { Container, Title, Text, Grid, Card, Badge, Group, Stack, ResponsiveGroup, ScrollArea } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { IconActivity, IconRefresh, IconAlertCircle, IconCheck } from '@tabler/icons-react';

const services = [
  { id: 'api', name: "API Reigreen", url: "https://api.reigreengroup.com" },
  { id: 'clientes', name: "Clientes Reigreen", url: "https://clientes.reigreengroup.com" },
  { id: 'ocr', name: "OCR Reigreen", url: "https://ocr.reigreengroup.com" },
  { id: 'magika', name: "Magika Reigreen", url: "https://magika.reigreengroup.com" },
  { id: 'n8n', name: "n8n Reigreen", url: "https://n8n.reigreengroup.com" }
];

export default function StatusPage() {
  const [statuses, setStatuses] = useState(
    services.map(s => ({ ...s, status: 'checking', latency: 0, lastChecked: new Date().toLocaleTimeString() }))
  );
  const [history, setHistory] = useState({});

  useEffect(() => {
    const checkAll = async () => {
      const newStatuses = await Promise.all(services.map(async (service) => {
        try {
          const start = performance.now();
          // Use no-cors mode to check reachability
          await fetch(service.url, { mode: 'no-cors', cache: 'no-store' });
          const end = performance.now();
          const latency = Math.round(end - start);

          const currentHistory = history[service.id] || [];
          const newHistory = [...currentHistory, { time: new Date().toLocaleTimeString(), latency }];
          setHistory(prev => ({ ...prev, [service.id]: newHistory.slice(-20) }));

          return { ...service, status: 'online', latency, lastChecked: new Date().toLocaleTimeString() };
        } catch (err) {
          return { ...service, status: 'offline', latency: 0, lastChecked: new Date().toLocaleTimeString() };
        }
      }));
      setStatuses(newStatuses);
    };

    const interval = setInterval(checkAll, 10000);
    checkAll();
    return () => clearInterval(interval);
  }, [history]);

  return (
    <Container size="md" py="xl">
      <Stack align="center" mb="xl">
        <Title order={1} className="text-center">Estado del Sistema</Title>
        <Text c="dimmed" size="lg" τα="center">
          Monitoreo en tiempo real de los servicios de Reigreen Group.
        </Text>
      </Stack>

      <Grid gutter="md">
        {statuses.map((service) => (
          <Grid.Col key={service.id} span={{ base: 12, md: 6, lg: 4 }}>
            <Card withBorder shadow="sm" padding="xl" radius="md" withShadow>
              <Group justify="space-between" mb="md">
                <Text fw={700} size="lg">{service.name}</Text>
                <Badge
                  variant={service.status === 'online' ? 'filled' : service.status === 'offline' ? 'filled' : 'light'}
                  color={service.status === 'online' ? 'green' : service.status === 'offline' ? 'red' : 'orange'}
                  size="sm"
                >
                  {service.status.toUpperCase()}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="md" wrapper="label">
                {service.url}
              </Text>
              <Group justify="space-between" mt="md">
                <Text size="sm">Latencia: <span className="font-mono">{service.latency}ms</span></Text>
                <Text size="xs" c="dimmed">
                  Último check: {service.lastChecked}
                </Text>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <div style={{ marginTop: '40px' }}>
        <Title order={3} mb="md">Historial de Latencia (API Reigreen)</Title>
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history['api'] || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="latency"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Container>
  );
}
