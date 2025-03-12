import { useState } from 'react';
import { 
  Paper, 
  Title, 
  Container, 
  Text,
  Select,
  Group,
  Stack,
  Badge
} from '@mantine/core';
import { useWebSocketContext } from '../../context/WebSocketProvider';

/**
 * ThreeDView - Component for displaying 3D visualizations
 * 
 * This is a placeholder component that will be expanded to include
 * actual 3D visualization capabilities in the future.
 */
export function ThreeDView() {
  const { messagesByTopic, isConnected, messageCount } = useWebSocketContext();
  const [selectedTopic, setSelectedTopic] = useState('');
  
  // Get available topics from messages
  const topicOptions = Object.keys(messagesByTopic).map(topic => ({ 
    value: topic, 
    label: topic 
  }));
  
  // Check if the selected topic has position data
  const hasPositionData = () => {
    if (!selectedTopic || !messagesByTopic[selectedTopic]) return false;
    
    const data = messagesByTopic[selectedTopic].data;
    
    // Check for common position fields - this is a placeholder logic
    // Would need to be customized for actual data format
    const hasPosition = 
      (data.position && typeof data.position === 'object') ||
      (data.pose && typeof data.pose === 'object') ||
      (data.x !== undefined && data.y !== undefined && data.z !== undefined);
      
    return hasPosition;
  };
  
  const positionDataAvailable = hasPositionData();
  
  return (
    <Container size="xl" py="md">
      <Group position="apart" mb="md">
        <Title order={2}>3D Visualization</Title>
        <Badge size="lg" color={isConnected ? 'green' : 'red'}>
          {isConnected ? `Connected (${messageCount} msgs)` : 'Disconnected'}
        </Badge>
      </Group>
      
      <Paper withBorder p="md" mb="lg">
        <Stack spacing="md">
          <Title order={4}>3D Visualization Configuration</Title>
          
          <Select
            label="Select Topic"
            placeholder="Choose a topic for 3D visualization"
            data={topicOptions}
            value={selectedTopic}
            onChange={setSelectedTopic}
            searchable
            clearable
            nothingFound="No topics available"
          />
          
          {selectedTopic && (
            <Text size="sm" c={positionDataAvailable ? 'inherit' : 'dimmed'}>
              {positionDataAvailable 
                ? 'Position data found! Ready for visualization.' 
                : 'No position data found in this topic.'}
            </Text>
          )}
        </Stack>
      </Paper>
      
      <Paper 
        withBorder 
        p="md" 
        h={400} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#1a1b1e'
        }}
      >
        <Stack align="center" spacing="md">
          <Title order={3}>3D Visualization Placeholder</Title>
          <Text c="dimmed" ta="center" maw={400}>
            This component will be expanded to include 3D visualization using a library like Three.js or React Three Fiber.
          </Text>
          {selectedTopic && positionDataAvailable && (
            <Badge size="lg" color="blue">
              Topic "{selectedTopic}" has position data ready for visualization
            </Badge>
          )}
        </Stack>
      </Paper>
    </Container>
  );
} 