import { useState } from 'react';
import { 
  Paper, 
  Text, 
  Title, 
  Container,
  Group,
  Badge,
  Code,
  Button,
  TextInput,
  Stack,
  Flex,
  Tabs,
  ScrollArea,
  Accordion
} from '@mantine/core';
import { useWebSocketContext } from '../../context/WebSocketProvider';
import { IconPlugConnected, IconPlugX, IconRefresh } from '@tabler/icons-react';

// Format message data for display
const formatData = (data) => {
  if (!data) return "No data";
  try {
    // Handle the special case of NewDatapoint with data_json field
    if (data.NewDatapoint && data.NewDatapoint.data_json) {
      try {
        const topic = data.NewDatapoint.topic;
        const time = data.NewDatapoint.time;
        
        // Parse the nested data_json array
        const dataJson = JSON.parse(data.NewDatapoint.data_json);
        if (Array.isArray(dataJson) && dataJson[0] && dataJson[0][1]) {
          // Parse the inner JSON string
          const innerData = JSON.parse(dataJson[0][1]);
          
          // Return a cleaner formatted version
          return JSON.stringify({
            topic,
            time,
            data: innerData
          }, null, 2);
        }
      } catch (innerError) {
        // If parsing fails, fall back to standard formatting
        console.error("Error parsing inner JSON:", innerError);
      }
    }
    
    // Default formatting for other message types
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return String(data);
  }
};

export function MessagesView() {
  const { 
    latestMessage, 
    messagesByTopic,
    isConnected, 
    connectionStatus,
    connect,
    disconnect,
    clearMessage,
    address,
    setAddress,
    port,
    setPort,
    path,
    setPath,
    messageCount,
    messageRate
  } = useWebSocketContext();
  
  const [addressInput, setAddressInput] = useState(address);
  const [portInput, setPortInput] = useState(port.toString());
  const [pathInput, setPathInput] = useState(path || '');
  
  // Handle connection toggle
  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      // Update settings before connecting
      setAddress(addressInput);
      setPort(parseInt(portInput, 10));
      setPath(pathInput);
      connect();
    }
  };
  
  // Handle clear
  const handleClear = () => {
    clearMessage();
  };

  // Get topics from messages
  const topics = Object.keys(messagesByTopic);
  
  return (
    <Container size="xl" py="md">
      <Group position="apart" mb="md">
        <Title order={2}>WebSocket Messages</Title>
        <Group spacing="xs">
          <Badge size="lg" color={isConnected ? 'green' : 'red'}>
            {isConnected ? `Connected (${messageRate} msg/s)` : 'Disconnected'}
          </Badge>
          <Badge size="lg" variant="outline">
            {messageCount.toLocaleString()} total
          </Badge>
        </Group>
      </Group>
      
      {/* Connection Panel */}
      <Paper withBorder p="md" mb="lg">
        <Stack spacing="sm">
          <Group position="apart">
            <Title order={4}>Connection</Title>
            <Badge 
              size="lg" 
              color={isConnected ? 'green' : 'red'}
            >
              {connectionStatus}
            </Badge>
          </Group>
          
          <Flex gap="md">
            <TextInput
              label="Server Address"
              placeholder="127.0.0.1"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              style={{ flex: 2 }}
              disabled={isConnected}
            />
            <TextInput
              label="Port"
              placeholder="3030"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              style={{ flex: 1 }}
              disabled={isConnected}
            />
          </Flex>
          
          <TextInput
            label="Path (optional)"
            placeholder="ws"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            disabled={isConnected}
            description="Leave empty to connect to root path (/)"
          />
          
          <Group position="right" mt="sm">
            <Button
              onClick={handleToggleConnection}
              color={isConnected ? 'red' : 'blue'}
              leftIcon={isConnected ? <IconPlugX size={16} /> : <IconPlugConnected size={16} />}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </Group>
        </Stack>
      </Paper>
      
      {/* Message Display */}
      <Tabs defaultValue="latest">
        <Tabs.List mb="md">
          <Tabs.Tab value="latest">Latest Message</Tabs.Tab>
          <Tabs.Tab value="by-topic" disabled={topics.length === 0}>By Topic ({topics.length})</Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="latest">
          <Paper withBorder p="md">
            <Group position="apart" mb="md">
              <Title order={4}>Latest Message</Title>
              <Button 
                variant="light" 
                size="xs"
                leftIcon={<IconRefresh size={16} />}
                onClick={handleClear}
              >
                Clear
              </Button>
            </Group>
            
            {latestMessage ? (
              <Code block style={{ whiteSpace: 'pre-wrap' }}>
                {formatData(latestMessage)}
              </Code>
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                {isConnected 
                  ? 'Waiting for messages...' 
                  : 'Connect to the WebSocket server to see messages'}
              </Text>
            )}
          </Paper>
        </Tabs.Panel>
        
        <Tabs.Panel value="by-topic">
          <Paper withBorder p="md">
            <Group position="apart" mb="md">
              <Title order={4}>Messages by Topic</Title>
              <Text size="sm" c="dimmed">
                {topics.length} topics available
              </Text>
            </Group>
            
            {topics.length > 0 ? (
              <ScrollArea h={400}>
                <Accordion>
                  {topics.map(topic => {
                    const { data, timestamp } = messagesByTopic[topic];
                    const formattedTime = new Date(timestamp).toLocaleTimeString();
                    
                    return (
                      <Accordion.Item key={topic} value={topic}>
                        <Accordion.Control>
                          <Group position="apart" noWrap>
                            <Text>{topic}</Text>
                            <Text size="xs" c="dimmed">
                              {formattedTime}
                            </Text>
                          </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                          <Code block style={{ whiteSpace: 'pre-wrap' }}>
                            {formatData(data)}
                          </Code>
                        </Accordion.Panel>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </ScrollArea>
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                No messages received yet
              </Text>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
} 