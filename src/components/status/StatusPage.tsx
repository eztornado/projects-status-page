import React from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Badge,
  Group,
  Stack,
  MantineProvider,
  ThemeIcon,
  Progress,
  Paper,
  Center,
  Box,
  SimpleGrid,
  Grid,
  Overlay,
  BackgroundImage,
  Avatar,
  Divider
} from '@mantine/core';
import type { ThemeIconProps } from '@mantine/core';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useServiceMonitor } from '../../hooks/useServiceMonitor';
import { IconCheck, IconX, IconActivity, IconServer, IconClock, IconAlertCircle, IconCloud, IconSparkles, IconBrandGoogle, IconApi } from '@tabler/icons-react';

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
      size: 48,
      variant: 'light',
    };

    if (status === 'up') {
      return (
        <ThemeIcon {...props} color="teal" radius="xl">
          <IconCheck size={24} />
        </ThemeIcon>
      );
    }
    return (
      <ThemeIcon {...props} color="red" radius="xl">
        <IconX size={24} />
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
        <ThemeIcon size={100} variant="light" color="blue" radius="xl">
          <IconServer size={50} />
        </ThemeIcon>
        <Stack gap="xs" ta="center">
          <Title order={2}>Cargando estado de servicios...</Title>
          <Text c="dimmed" size="lg">Verificando disponibilidad de los servicios</Text>
        </Stack>
      </Stack>
    </Container>
  ) : error ? (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl">
        <ThemeIcon size={100} variant="light" color="red" radius="xl">
          <IconAlertCircle size={50} />
        </ThemeIcon>
        <Stack gap="xs" ta="center">
          <Title order={2} c="red">Error de conexión</Title>
          <Text c="dimmed" size="lg">{error}</Text>
        </Stack>
      </Stack>
    </Container>
  ) : (
    <>
      {/* Hero Section */}
      <Box py="xl">
        <Container size="lg">
          <Paper
            radius="xl"
            p="xl"
            withBorder
            shadow="xl"
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Stack gap="lg">
              {/* Header */}
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap="xs">
                  <Group gap="xs">
                    <Avatar size={60} radius="xl" color="blue">
                      <IconCloud size={30} />
                    </Avatar>
                    <Stack gap={0}>
                      <Title order={1} size="h1">Estado del Sistema</Title>
                      <Text c="dimmed" size="md">
                        Monitoreo en tiempo real de los servicios de Reigreen Group
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
                <ThemeIcon
                  size={60}
                  variant="gradient"
                  gradient={{ from: systemStatus.status === 'operational' ? 'teal' : systemStatus.status === 'degraded' ? 'yellow' : 'red', to: systemStatus.status === 'operational' ? 'lime' : systemStatus.status === 'degraded' ? 'orange' : 'pink' }}
                  radius="xl"
                >
                  <IconActivity size={30} />
                </ThemeIcon>
              </Group>

              <Divider />

              {/* System Status */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Paper p="md" radius="md" withBorder bg="gray.0">
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Estado del Sistema</Text>
                      <Group gap="xs">
                        <Badge
                          size="xl"
                          variant="filled"
                          color={systemStatus.status === 'operational' ? 'teal' : systemStatus.status === 'degraded' ? 'yellow' : 'red'}
                          leftSection={systemStatus.status === 'operational' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
                        >
                          {systemStatus.status === 'operational' ? 'Operativo' : systemStatus.status === 'degraded' ? 'Degradado' : 'Caído'}
                        </Badge>
                      </Group>
                    </Stack>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Paper p="md" radius="md" withBorder bg="gray.0">
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Servicios Activos</Text>
                      <Text size="xl" fw={700}>
                        {services.filter(s => s.status === 'up').length} / {services.length}
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Paper p="md" radius="md" withBorder bg="gray.0">
                    <Stack gap={4}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Disponibilidad</Text>
                      <Text size="xl" fw={700} c={systemStatus.status === 'operational' ? 'teal' : systemStatus.status === 'degraded' ? 'yellow' : 'red'}>
                        {systemStatus.percentage}%
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>

              <Progress
                value={systemStatus.percentage}
                color={systemStatus.status === 'operational' ? 'teal' : systemStatus.status === 'degraded' ? 'yellow' : 'red'}
                size="xl"
                radius="xl"
              />
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Services Grid */}
      <Container size="lg" mb="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {services.map((service, index) => (
            <Card
              key={index}
              withBorder
              padding="xl"
              radius="xl"
              shadow="md"
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  background: 'rgba(255, 255, 255, 0.98)',
                },
              }}
            >
              <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4}>
                    <Group gap="xs">
                      <Avatar size={40} radius="md" color={service.status === 'up' ? 'teal' : 'red'}>
                        <IconApi size={20} />
                      </Avatar>
                      <Title order={3} size="h3">{service.name}</Title>
                    </Group>
                    <Text size="sm" c="dimmed">{service.url}</Text>
                  </Stack>
                  {getStatusIcon(service.status)}
                </Group>

                <Divider />

                {/* Status Section */}
                <Stack gap="md">
                  <Group gap="xs">
                    <Badge
                      size="lg"
                      variant="filled"
                      color={getStatusColor(service.status)}
                      leftSection={service.status === 'up' ? <IconCheck size={14} /> : <IconX size={14} />}
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
                    <Stack gap="xs">
                      <Group gap="xs">
                        <IconClock size={18} style={{ color: '#666' }} />
                        <Text size="md" fw={500}>Latencia:</Text>
                        <Text size="md" fw={700} c={getLatencyColor(service.latency)}>
                          {service.latency}ms
                        </Text>
                      </Group>

                      <Progress
                        value={Math.min(service.latency / 5, 100)}
                        color={getLatencyColor(service.latency)}
                        size="md"
                        radius="lg"
                      />
                    </Stack>
                  )}

                  {/* Last Update */}
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">
                      Actualizado: {new Date(service.lastCheck).toLocaleTimeString()}
                    </Text>
                  </Group>
                </Stack>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Latency Chart Section */}
      <Container size="lg" mb="xl">
        <Paper
          withBorder
          padding="xl"
          radius="xl"
          shadow="md"
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon size={40} variant="light" color="blue" radius="md">
                  <IconSparkles size={20} />
                </ThemeIcon>
                <Title order={3}>Historial de Latencia - API</Title>
              </Group>
              <Group gap="xs">
                <Badge size="md" variant="dot" color="teal">Últimas 20 mediciones</Badge>
                <Badge size="md" variant="light" color="blue">Actualizado cada 10s</Badge>
              </Group>
            </Group>

            <Divider />

            <Box h={400}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#42d992" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#42d992" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e1e1e1" vertical={false} />
                    <XAxis
                      dataKey="time"
                      hide
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 13 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e1e1e1',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '14px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="latency"
                      stroke="#42d992"
                      strokeWidth={3}
                      fill="url(#colorLatency)"
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Center h="100%">
                  <Stack align="center" gap="md">
                    <ThemeIcon size={80} variant="light" color="gray" radius="xl">
                      <IconActivity size={40} />
                    </ThemeIcon>
                    <Text size="lg" c="dimmed">No hay datos de latencia disponibles</Text>
                  </Stack>
                </Center>
              )}
            </Box>
          </Stack>
        </Paper>
      </Container>

      {/* Footer */}
      <Container size="lg" mb="xl">
        <Paper
          withBorder
          p="lg"
          radius="xl"
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="xs">
              <Avatar size={32} radius="xl" color="blue">
                <IconBrandGoogle size={16} />
              </Avatar>
              <Text size="md" c="dimmed">© 2026 Reigreen Group. Monitoreo automático de servicios.</Text>
            </Group>
            <Group gap="xs">
              <Badge size="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>v1.0</Badge>
              <Badge size="md" variant="light" color="teal">Tiempo Real</Badge>
              <Badge size="md" variant="light" color="purple">5 Servicios</Badge>
            </Group>
          </Group>
        </Paper>
      </Container>
    </>
  );

  return (
    <MantineProvider>
      <Box sx={{ minHeight: '100vh', py: 'md' }}>
        {content}
      </Box>
    </MantineProvider>
  );
}