import React from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Badge,
  Group,
  Stack,
  MantineProvider,
  ThemeIcon,
  Progress,
  Paper,
  Center,
  Anchor,
  Box,
  SimpleGrid
} from '@mantine/core';
import type { ThemeIconProps } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { useServiceMonitor } from '../../hooks/useServiceMonitor';
import { IconCheck, IconX, IconActivity, IconServer, IconClock, IconAlertCircle } from '@tabler/icons-react';

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

  // Calculate overall system status
  const systemStatus = React.useMemo(() => {
    if (services.length === 0) return { status: 'unknown', percentage: 0 };
    const upCount = services.filter(s => s.status === 'up').length;
    const percentage = Math.round((upCount / services.length) * 100);
    const status = percentage === 100 ? 'operational' : percentage > 50 ? 'degraded' : 'down';
    return { status, percentage };
  }, [services]);

  const getStatusIcon = (status: string) => {
    const props: Partial<ThemeIconProps> = {
      size: 40,
      variant: 'light',
    };

    if (status === 'up') {
      return (
        <ThemeIcon {...props} color="teal">
          <IconCheck size={20} />
        </ThemeIcon>
      );
    }
    return (
      <ThemeIcon {...props} color="red">
        <IconX size={20} />
      </ThemeIcon>
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'up' ? 'teal' : 'red';
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'teal';
    if (latency < 200) return 'yellow';
    return 'red';
  };

  const getLatencyLabel = (latency: number) => {
    if (latency < 100) return 'Excelente';
    if (latency < 200) return 'Bueno';
    if (latency < 500) return 'Aceptable';
    return 'Lento';
  };

  const content = loading && services.length === 0 ? (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl">
        <ThemeIcon size={80} variant="light" color="blue">
          <IconServer size={40} />
        </ThemeIcon>
        <Stack gap="xs">
          <Text size="xl" fw={500}>Cargando estado de servicios...</Text>
          <Text c="dimmed" size="sm">Verificando disponibilidad de los servicios</Text>
        </Stack>
      </Stack>
    </Container>
  ) : error ? (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl">
        <ThemeIcon size={80} variant="light" color="red">
          <IconAlertCircle size={40} />
        </ThemeIcon>
        <Stack gap="xs">
          <Text size="xl" fw={500} c="red">Error de conexión</Text>
          <Text c="dimmed" size="sm">{error}</Text>
        </Stack>
      </Stack>
    </Container>
  ) : (
    <Container size="lg" py="xl">
      {/* Header Section */}
      <Stack mb="xl">
        <Paper
          withBorder
          p="xl"
          radius="lg"
          sx={{
            background: 'linear-gradient(135deg, rgba(66, 217, 164, 0.1) 0%, rgba(66, 217, 164, 0.05) 100%)',
            position: 'relative',
          }}
        >
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Title order={1}>Estado del Sistema</Title>
                <Text c="dimmed" size="lg">
                  Monitoreo en tiempo real de los servicios de Reigreen Group
                </Text>
              </Stack>
              <Group gap="xs">
                <ThemeIcon size={48} variant="light" color={systemStatus.status === 'operational' ? 'teal' : systemStatus.status === 'degraded' ? 'yellow' : 'red'}>
                  <IconActivity size={24} />
                </ThemeIcon>
              </Group>
            </Group>

            <Group gap="xl">
              <Stack gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Estado del Sistema</Text>
                <Group gap="xs">
                  <Badge
                    size="lg"
                    variant="filled"
                    color={systemStatus.status === 'operational' ? 'teal' : systemStatus.status === 'degraded' ? 'yellow' : 'red'}
                    leftSection={systemStatus.status === 'operational' ? <IconCheck size={14} /> : <IconAlertCircle size={14} />}
                  >
                    {systemStatus.status === 'operational' ? 'Operativo' : systemStatus.status === 'degraded' ? 'Degradado' : 'Caído'}
                  </Badge>
                </Group>
              </Stack>

              <Stack gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Servicios Activos</Text>
                <Text size="lg" fw={500}>
                  {services.filter(s => s.status === 'up').length} / {services.length}
                </Text>
              </Stack>

              <Stack gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Disponibilidad</Text>
                <Text size="lg" fw={500} c={systemStatus.status === 'operational' ? 'teal' : systemStatus.status === 'degraded' ? 'yellow' : 'red'}>
                  {systemStatus.percentage}%
                </Text>
              </Stack>
            </Group>

            <Progress
              value={systemStatus.percentage}
              color={systemStatus.status === 'operational' ? 'teal' : systemStatus.status === 'degraded' ? 'yellow' : 'red'}
              size="lg"
              radius="xl"
            />
          </Stack>
        </Paper>
      </Stack>

      {/* Services Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
        {services.map((service, index) => (
          <Card
            key={index}
            withBorder
            padding="xl"
            radius="lg"
            shadow="sm"
            sx={{
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Stack gap="md">
              {/* Header */}
              <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                  <Text fw={700} size="lg">{service.name}</Text>
                  <Text size="sm" c="dimmed">{service.url}</Text>
                </Stack>
                {getStatusIcon(service.status)}
              </Group>

              {/* Status Badge */}
              <Group gap="xs">
                <Badge
                  size="lg"
                  variant="filled"
                  color={getStatusColor(service.status)}
                  leftSection={service.status === 'up' ? <IconCheck size={12} /> : <IconX size={12} />}
                >
                  {service.status === 'up' ? 'EN LÍNEA' : 'FUERA DE LÍNEA'}
                </Badge>
                {service.status === 'up' && (
                  <Badge size="lg" variant="light" color={getLatencyColor(service.latency)}>
                    {getLatencyLabel(service.latency)}
                  </Badge>
                )}
              </Group>

              {/* Latency Info */}
              {service.status === 'up' && (
                <Stack gap={4}>
                  <Group gap="xs">
                    <IconClock size={16} style={{ color: '#666' }} />
                    <Text size="sm" c="dimmed">Latencia:</Text>
                    <Text size="sm" fw={600} c={getLatencyColor(service.latency)}>
                      {service.latency}ms
                    </Text>
                  </Group>

                  <Progress
                    value={Math.min(service.latency / 5, 100)}
                    color={getLatencyColor(service.latency)}
                    size="sm"
                    radius="xl"
                  />
                </Stack>
              )}

              {/* Last Update */}
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  Actualizado: {new Date(service.lastCheck).toLocaleTimeString()}
                </Text>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {/* Latency Chart Section */}
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3}>Historial de Latencia - API</Title>
          <Group gap="xs">
            <Badge size="sm" variant="dot" color="teal">Últimas 20 mediciones</Badge>
            <Badge size="sm" variant="light" color="blue">Actualizado cada 10s</Badge>
          </Group>
        </Group>

        <Card withBorder padding="xl" radius="lg" shadow="sm">
          <Box h={350}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#42d992" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#42d992" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="time"
                    hide
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e1e1e1',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="#42d992"
                    strokeWidth={3}
                    fill="url(#colorLatency)"
                    animationDuration={300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Center h="100%">
                <Stack align="center" gap="xs">
                  <IconActivity size={32} style={{ color: '#999' }} />
                  <Text c="dimmed">No hay datos de latencia disponibles</Text>
                </Stack>
              </Center>
            )}
          </Box>
        </Card>
      </Stack>

      {/* Footer */}
      <Box mt="xl">
        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Text size="sm" c="dimmed">© 2026 Reigreen Group. Monitoreo automático de servicios.</Text>
            </Group>
            <Group gap="xs">
              <Badge size="sm" variant="light" color="blue">v1.0</Badge>
              <Badge size="sm" variant="light" color="gray">Actualizado en tiempo real</Badge>
            </Group>
          </Group>
        </Paper>
      </Box>
    </Container>
  );

  return (
    <MantineProvider>
      {content}
    </MantineProvider>
  );
}