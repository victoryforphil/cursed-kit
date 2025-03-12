import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Stack, 
  Group, 
  Badge, 
  Button, 
  Divider,
  Textarea,
  Card,
  Grid,
  Code
} from '@mantine/core';
import { useWebSocketContext } from '../../context/WebSocketProvider';
import { CodeHighlight } from '@mantine/code-highlight';
import { IconSend, IconRefresh } from '@tabler/icons-react';

/**
 * Format time duration from milliseconds to a readable string
 */
const formatDuration = (ms) => {
  if (!ms) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * DebugView - Component for displaying WebSocket connection and message statistics
 */
export function DebugView() {
  const { 
    isConnected, 
    connectionStatus, 
    readyState,
    messageCount,
    messageRate,
    messagesByTopic,
    startTime,
    address,
    port,
    connect,
    disconnect
  } = useWebSocketContext();
  
  const [uptime, setUptime] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Calculate and update uptime
  useEffect(() => {
    if (!isConnected || !startTime) {
      setUptime(0);
      return;
    }
    
    const interval = setInterval(() => {
      setUptime(Date.now() - startTime);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isConnected, startTime]);
  
  // Force a refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Map WebSocket readyState to a human-readable string
  const getReadyStateText = (state) => {
    switch(state) {
      case WebSocket.CONNECTING: return 'Connecting (0)';
      case WebSocket.OPEN: return 'Open (1)';
      case WebSocket.CLOSING: return 'Closing (2)';
      case WebSocket.CLOSED: return 'Closed (3)';
      default: return `Unknown (${state})`;
    }
  };
  
  // Count topics
  const topicCount = Object.keys(messagesByTopic).length;
  
  return (
    <Container size="xl" py="md" key={refreshKey}>
      <Group position="apart" mb="md">
        <Title order={2}>WebSocket Debug</Title>
        <Group spacing="xs">
          <Button 
            variant="light" 
            size="xs"
            leftIcon={<IconRefresh size={16} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Badge size="lg" color={isConnected ? 'green' : 'red'}>
            {connectionStatus}
          </Badge>
        </Group>
      </Group>
      
      <Grid gutter="md">
        {/* Connection Status */}
        <Grid.Col span={12} md={6} lg={4}>
          <Card withBorder p="md">
            <Title order={4} mb="md">Connection</Title>
            <Stack spacing="xs">
              <Group position="apart">
                <Text c="dimmed">Status:</Text>
                <Badge color={isConnected ? 'green' : 'red'}>
                  {connectionStatus}
                </Badge>
              </Group>
              <Group position="apart">
                <Text c="dimmed">WebSocket State:</Text>
                <Text>{getReadyStateText(readyState)}</Text>
              </Group>
              <Group position="apart">
                <Text c="dimmed">Server:</Text>
                <Text>{`${address}:${port}`}</Text>
              </Group>
              <Group position="apart">
                <Text c="dimmed">Uptime:</Text>
                <Text>{formatDuration(uptime)}</Text>
              </Group>
              <Divider my="xs" />
              <Group grow>
                <Button
                  color={isConnected ? 'red' : 'blue'}
                  onClick={isConnected ? disconnect : connect}
                  size="xs"
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </Button>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
        
        {/* Message Statistics */}
        <Grid.Col span={12} md={6} lg={4}>
          <Card withBorder p="md">
            <Title order={4} mb="md">Message Statistics</Title>
            <Stack spacing="xs">
              <Group position="apart">
                <Text c="dimmed">Total Messages:</Text>
                <Text>{messageCount.toLocaleString()}</Text>
              </Group>
              <Group position="apart">
                <Text c="dimmed">Message Rate:</Text>
                <Text>{messageRate} msg/s</Text>
              </Group>
              <Group position="apart">
                <Text c="dimmed">Topics:</Text>
                <Text>{topicCount}</Text>
              </Group>
              {isConnected && uptime > 0 && (
                <Group position="apart">
                  <Text c="dimmed">Avg Rate:</Text>
                  <Text>
                    {(messageCount / (uptime / 1000)).toFixed(2)} msg/s
                  </Text>
                </Group>
              )}
            </Stack>
          </Card>
        </Grid.Col>
        
        {/* Topic List */}
        <Grid.Col span={12} md={12} lg={4}>
          <Card withBorder p="md">
            <Title order={4} mb="md">Active Topics</Title>
            {topicCount > 0 ? (
              <Stack spacing="xs">
                {Object.entries(messagesByTopic).map(([topic, { timestamp }]) => (
                  <Group key={topic} position="apart" noWrap>
                    <Text size="sm" truncate>{topic}</Text>
                    <Text size="xs" c="dimmed">
                      {new Date(timestamp).toLocaleTimeString()}
                    </Text>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed" ta="center" py="md">
                No topics available
              </Text>
            )}
          </Card>
        </Grid.Col>
        
        {/* WebSocket Details */}
        <Grid.Col span={12}>
          <Card withBorder p="md">
            <Title order={4} mb="md">WebSocket Details</Title>
            <Code block>
{`WebSocket Connection:
URL: ws://${address}:${port}
Status: ${connectionStatus}
ReadyState: ${getReadyStateText(readyState)}
Connected: ${isConnected ? 'Yes' : 'No'}
Uptime: ${formatDuration(uptime)}
Messages Received: ${messageCount}
Message Rate: ${messageRate} msg/s
Topics: ${topicCount}
`}
            </Code>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 