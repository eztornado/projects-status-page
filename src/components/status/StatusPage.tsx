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
  Avatar,
  Divider,
  ActionIcon,
  Tooltip as MantineTooltip
} from '@mantine/core';
import type { ThemeIconProps } from '@mantine/core';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import { useServiceMonitor } from '../../hooks/useServiceMonitor';
import { IconCheck, IconX, IconActivity, IconServer, IconClock, IconAlertCircle, IconCloud, IconSparkles, IconRefresh, IconBrandGoogle, IconApi, IconChartBar, IconSettings, IconDeviceDesktop } from '@tabler/icons-react';

export default function StatusPage() {
  const { services, history, loading, error, refetch } = useServiceMonitor();

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
    if (services.length === 0) return { status: 'unknown', percentage: 0, uptime: 0 };
    const upCount = services.filter(s => s.status === 'up').length;
    const percentage = Math.round((upCount / services.length) * 100);
    const status = percentage === 100 ? 'operational' : percentage > 50 ? 'degraded' : 'down';
    return { status, percentage, uptime: percentage };
  }, [services]);

  const getStatusIcon = (status: string) => {
    const props: Partial<ThemeIconProps> = {
      size: 32,
      variant: 'light',
      radius: 'xl',
    };

    if (status === 'up') {
      return (
        <ThemeIcon {...props} style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
          <IconCheck size={16} />
        </ThemeIcon>
      );
    }
    return (
      <ThemeIcon {...props} style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>
        <IconX size={16} />
      </ThemeIcon>
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'up' ? '#4ade80' : '#f87171';
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return '#4ade80';
    if (latency < 200) return '#facc15';
    return '#f87171';
  };

  const getLatencyLabel = (latency: number) => {
    if (latency < 100) return 'EXCELLENT';
    if (latency < 200) return 'GOOD';
    if (latency < 500) return 'ACCEPTABLE';
    return 'SLOW';
  };

  const content = loading && services.length === 0 ? (
    <Container size="md">
      <Stack align="center" gap="xl" py="xl">
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <IconServer size={48} style={{ color: '#60a5fa' }} />
        </div>
        <Stack gap="xs" ta="center">
          <Title order={2} style={{ color: 'var(--text-primary)' }}>Loading Service Status...</Title>
          <Text style={{ color: 'var(--text-secondary)' }}>Checking service availability</Text>
        </Stack>
      </Stack>
    </Container>
  ) : error ? (
    <Container size="md">
      <Stack align="center" gap="xl" py="xl">
        <div style={{
          background: 'rgba(248, 113, 113, 0.15)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(248, 113, 113, 0.3)'
        }}>
          <IconAlertCircle size={48} style={{ color: '#f87171' }} />
        </div>
        <Stack gap="xs" ta="center">
          <Title order={2} style={{ color: '#f87171' }}>Connection Error</Title>
          <Text style={{ color: 'var(--text-secondary)' }}>{error}</Text>
        </Stack>
      </Stack>
    </Container>
  ) : (
    <>
      {/* Hero Section */}
      <Container size="lg" mb="xl">
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
        }}>
          <Stack gap="md">
            {/* Header */}
            <Group justify="space-between" align="center" wrap="nowrap">
              <Group gap="md">
                <div style={{
                  background: 'rgba(96, 165, 250, 0.2)',
                  borderRadius: '10px',
                  padding: '8px',
                  border: '1px solid rgba(96, 165, 250, 0.3)'
                }}>
                  <IconCloud size={24} style={{ color: '#60a5fa' }} />
                </div>
                <Stack gap={0}>
                  <Title order={1} size="h1" style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>
                    System Status
                  </Title>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Real-time monitoring for Reigreen Group services
                  </Text>
                </Stack>
              </Group>

              <Group gap="xs">
                <MantineTooltip label="Refresh Status">
                  <ActionIcon
                    size="lg"
                    radius="lg"
                    variant="light"
                    onClick={refetch}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <IconRefresh size={16} style={{ color: 'var(--text-primary)' }} />
                  </ActionIcon>
                </MantineTooltip>

                <div style={{
                  background: systemStatus.status === 'operational'
                    ? 'rgba(74, 222, 128, 0.2)'
                    : systemStatus.status === 'degraded'
                    ? 'rgba(250, 204, 21, 0.2)'
                    : 'rgba(248, 113, 113, 0.2)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  border: `1px solid ${
                    systemStatus.status === 'operational'
                      ? 'rgba(74, 222, 128, 0.4)'
                      : systemStatus.status === 'degraded'
                      ? 'rgba(250, 204, 21, 0.4)'
                      : 'rgba(248, 113, 113, 0.4)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {systemStatus.status === 'operational' ? (
                    <IconActivity size={16} style={{ color: '#4ade80' }} />
                  ) : (
                    <IconAlertCircle size={16} style={{ color: systemStatus.status === 'degraded' ? '#facc15' : '#f87171' }} />
                  )}
                  <Text style={{
                    color: systemStatus.status === 'operational' ? '#4ade80' : systemStatus.status === 'degraded' ? '#facc15' : '#f87171',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    {systemStatus.status === 'operational' ? 'OPERATIONAL' : systemStatus.status === 'degraded' ? 'DEGRADED' : 'DOWN'}
                  </Text>
                </div>
              </Group>
            </Group>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }} />

            {/* System Metrics */}
            <Grid>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Stack gap={6}>
                    <Text size="xs" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      Uptime
                    </Text>
                    <Text size="lg" fw={700} style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>
                      {systemStatus.uptime}%
                    </Text>
                    <Progress
                      value={systemStatus.uptime}
                      color={systemStatus.status === 'operational' ? '#4ade80' : systemStatus.status === 'degraded' ? '#facc15' : '#f87171'}
                      size="xs"
                      radius="md"
                    />
                  </Stack>
                </div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Stack gap={6}>
                    <Text size="xs" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      Active Services
                    </Text>
                    <Text size="lg" fw={700} style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>
                      {services.filter(s => s.status === 'up').length} / {services.length}
                    </Text>
                    <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                      {services.filter(s => s.status === 'up').length} online, {services.filter(s => s.status === 'down').length} offline
                    </Text>
                  </Stack>
                </div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Stack gap={6}>
                    <Text size="xs" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      Avg Latency
                    </Text>
                    <Text size="lg" fw={700} style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>
                      {services.filter(s => s.status === 'up').length > 0
                        ? Math.round(services.filter(s => s.status === 'up').reduce((acc, s) => acc + s.latency, 0) / services.filter(s => s.status === 'up').length)
                        : 0}ms
                    </Text>
                    <Text size="xs" style={{ color: 'var(--text-secondary)' }}>
                      Across all services
                    </Text>
                  </Stack>
                </div>
              </Grid.Col>
            </Grid>
          </Stack>
        </div>
      </Container>

      {/* Services Grid */}
      <Container size="lg" mb="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <Stack gap="md">
                {/* Header */}
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4}>
                    <Group gap="xs">
                      <div style={{
                        background: service.status === 'up' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                        borderRadius: '8px',
                        padding: '6px',
                        border: service.status === 'up' ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid rgba(248, 113, 113, 0.4)'
                      }}>
                        <IconApi size={14} style={{ color: service.status === 'up' ? '#4ade80' : '#f87171' }} />
                      </div>
                      <Text fw={600} size="md" style={{ color: 'var(--text-primary)' }}>
                        {service.name}
                      </Text>
                    </Group>
                    <Text size="xs" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {service.url}
                    </Text>
                  </Stack>
                  {getStatusIcon(service.status)}
                </Group>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Status & Performance */}
                <Stack gap="sm">
                  <Group gap="xs">
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: service.status === 'up'
                        ? 'rgba(74, 222, 128, 0.2)'
                        : 'rgba(248, 113, 113, 0.2)',
                      border: service.status === 'up'
                        ? '1px solid rgba(74, 222, 128, 0.4)'
                        : '1px solid rgba(248, 113, 113, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {service.status === 'up' ? (
                        <IconCheck size={12} style={{ color: '#4ade80' }} />
                      ) : (
                        <IconX size={12} style={{ color: '#f87171' }} />
                      )}
                      <Text size="xs" fw={600} style={{
                        color: service.status === 'up' ? '#4ade80' : '#f87171',
                        fontSize: '0.7rem'
                      }}>
                        {service.status === 'up' ? 'ONLINE' : 'OFFLINE'}
                      </Text>
                    </div>

                    {service.status === 'up' && (
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: `rgba(${getLatencyColor(service.latency) === '#4ade80' ? '74, 222, 128' : getLatencyColor(service.latency) === '#facc15' ? '250, 204, 21' : '248, 113, 113'}, 0.15)`,
                        border: `1px solid rgba(${getLatencyColor(service.latency) === '#4ade80' ? '74, 222, 128' : getLatencyColor(service.latency) === '#facc15' ? '250, 204, 21' : '248, 113, 113'}, 0.3)`,
                      }}>
                        <Text size="xs" fw={500} style={{
                          color: getLatencyColor(service.latency),
                          fontSize: '0.65rem'
                        }}>
                          {getLatencyLabel(service.latency)}
                        </Text>
                      </div>
                    )}
                  </Group>

                  {/* Latency Metrics */}
                  {service.status === 'up' && (
                    <Stack gap="xs">
                      <Group gap="xs" justify="space-between">
                        <Group gap="xs">
                          <IconClock size={12} style={{ color: 'var(--text-muted)' }} />
                          <Text size="xs" style={{ color: 'var(--text-secondary)' }}>Latency:</Text>
                        </Group>
                        <Text size="xs" fw={700} style={{ color: getLatencyColor(service.latency) }}>
                          {service.latency}ms
                        </Text>
                      </Group>

                      <div style={{ position: 'relative', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${Math.min(service.latency / 5, 100)}%`,
                            background: getLatencyColor(service.latency),
                            transition: 'width 0.3s ease',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </Stack>
                  )}

                  {/* Last Update */}
                  <Group gap="xs">
                    <Text size="xs" style={{ color: 'var(--text-muted)' }}>
                      Updated: {new Date(service.lastCheck).toLocaleTimeString()}
                    </Text>
                  </Group>
                </Stack>
              </Stack>
            </div>
          ))}
        </SimpleGrid>
      </Container>

      {/* Latency Chart Section */}
      <Container size="lg" mb="xl">
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
        }}>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <div style={{
                  background: 'rgba(96, 165, 250, 0.2)',
                  borderRadius: '8px',
                  padding: '6px',
                  border: '1px solid rgba(96, 165, 250, 0.3)'
                }}>
                  <IconChartBar size={16} style={{ color: '#60a5fa' }} />
                </div>
                <Title order={3} style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Latency History - API</Title>
              </Group>
              <Group gap="xs">
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(74, 222, 128, 0.15)',
                  border: '1px solid rgba(74, 222, 128, 0.3)'
                }}>
                  <Text size="xs" style={{ color: '#4ade80', fontSize: '0.65rem', fontWeight: 600 }}>
                    LAST 20 CHECKS
                  </Text>
                </div>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(96, 165, 250, 0.15)',
                  border: '1px solid rgba(96, 165, 250, 0.3)'
                }}>
                  <Text size="xs" style={{ color: '#60a5fa', fontSize: '0.65rem', fontWeight: 600 }}>
                    REAL-TIME
                  </Text>
                </div>
              </Group>
            </Group>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            <Box style={{ height: '350px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="rgba(255, 255, 255, 0.3)"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
                      hide
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.3)"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 60, 114, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        color: '#ffffff',
                        fontSize: '14px',
                        backdropFilter: 'blur(10px)'
                      }}
                      itemStyle={{ color: '#4ade80' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="latency"
                      stroke="#4ade80"
                      strokeWidth={3}
                      fill="url(#colorLatency)"
                      animationDuration={800}
                      activeDot={{ r: 6, fill: '#4ade80', stroke: 'rgba(74, 222, 128, 0.3)', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Center h="100%">
                  <Stack align="center" gap="md">
                    <div style={{
                      background: 'rgba(96, 165, 250, 0.15)',
                      borderRadius: '16px',
                      padding: '20px',
                      border: '1px solid rgba(96, 165, 250, 0.3)'
                    }}>
                      <IconActivity size={40} style={{ color: '#60a5fa' }} />
                    </div>
                    <Text size="lg" style={{ color: 'var(--text-secondary)' }}>No latency data available</Text>
                  </Stack>
                </Center>
              )}
            </Box>
          </Stack>
        </div>
      </Container>

      {/* Footer */}
      <Container size="lg" mb="xl">
        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
        }}>
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="md">
              <Group gap="xs">
                <div style={{
                  background: 'rgba(96, 165, 250, 0.2)',
                  borderRadius: '8px',
                  padding: '6px',
                  border: '1px solid rgba(96, 165, 250, 0.3)'
                }}>
                  <IconDeviceDesktop size={16} style={{ color: '#60a5fa' }} />
                </div>
                <Text size="sm" style={{ color: 'var(--text-secondary)' }}>
                  © 2026 Reigreen Group. Automated service monitoring.
                </Text>
              </Group>
            </Group>
            <Group gap="xs">
              <div style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(96, 165, 250, 0.1))',
                border: '1px solid rgba(96, 165, 250, 0.3)'
              }}>
                <Text size="xs" style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600 }}>
                  v1.0
                </Text>
              </div>
              <div style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(74, 222, 128, 0.15)',
                border: '1px solid rgba(74, 222, 128, 0.3)'
              }}>
                <Text size="xs" style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 600 }}>
                  REAL-TIME
                </Text>
              </div>
              <div style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                <Text size="xs" style={{ color: '#a855f7', fontSize: '0.75rem', fontWeight: 600 }}>
                  5 SERVICES
                </Text>
              </div>
            </Group>
          </Group>
        </div>
      </Container>
    </>
  );

  return (
    <MantineProvider>
      {content}
    </MantineProvider>
  );
}