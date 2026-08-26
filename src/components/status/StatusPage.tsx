import React from 'react';
import { Container, Title, Text, Grid, Card, Badge, Group, Stack, MantineProvider } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useServiceMonitor } from '../../hooks/useServiceMonitor';

export default function StatusPage() {
  const { services, history, loading, error } = useServiceMonitor();

  // Format history for Recharts
  const chartData = React.useMemo(() => {
    const apiHistory = history['API'] || [];
    return apiHistory.map((latency, index) => ({
      time: `${index + 1}`,
      latency,
    }));
  }, [history]);

  const content = loading && services.length === 0 ? (
    <Container size="md" py="xl">
      <Stack align="center">
        <Text size="lg">Cargando estado de servicios...</Text>
      </Stack>
    </Container>
  ) : error ? (
    <Container size="md" py="xl">
      <Stack align="center">
        <Text c="red" size="lg">Error: {error}</Text>
      </Stack>
    </Container>
  ) : (
    <Container size="md" py="xl">
      <Stack align="center" mb="xl">
        <Title order={1}>Estado del Sistema</Title>
        <Text c="dimmed" size="lg" ta="center">
          Monitoreo en tiempo real de los servicios de Reigreen Group.
        </Text>
      </Stack>

      <Grid gutter="md">
        {services.map((service, index) => (
          <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
            <Card withBorder shadow="sm" padding="xl" radius="md">
              <Group justify="space-between" mb="md">
                <Text fw={700} size="lg">{service.name}</Text>
                <Badge
                  variant="filled"
                  color={service.status === 'up' ? 'green' : 'red'}
                  size="sm"
                >
                  {service.status === 'up' ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" mb="md">
                {service.url}
              </Text>
              <Group justify="space-between" mt="md">
                <Text size="sm">Latencia: <span className="font-mono">{service.status === 'up' ? `${service.latency}ms` : 'N/A'}</span></Text>
                <Text size="xs" c="dimmed">
                  Actualizado: {new Date(service.lastCheck).toLocaleTimeString()}
                </Text>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <div style={{ marginTop: '40px' }}>
        <Title order={3} mb="md">Historial de Latencia (API)</Title>
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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

  return (
    <MantineProvider>
      {content}
    </MantineProvider>
  );
}