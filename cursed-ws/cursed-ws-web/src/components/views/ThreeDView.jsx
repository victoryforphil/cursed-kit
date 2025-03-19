import { useState, useRef } from 'react';
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
import { Canvas, useFrame } from '@react-three/fiber';
import { useWebSocketContext } from '../../context/WebSocketProvider';

/**
 * A 3D box component that rotates and responds to interaction
 */
function Box(props) {
  // This reference gives us direct access to the mesh
  const meshRef = useRef();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  
  // Position data from props if available
  const position = props.position || props.defaultPosition || [0, 0, 0];
  const color = props.color || 'orange';
  
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });
  
  return (
    <mesh
      {...props}
      position={position}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
    </mesh>
  );
}

/**
 * ThreeDView - Component for displaying 3D visualizations using React Three Fiber
 */
export function ThreeDView() {
  const { messagesByTopic, isConnected, messageCount } = useWebSocketContext();
  const [selectedTopic, setSelectedTopic] = useState('');
  
  // Get available topics from messages
  const topicOptions = Object.keys(messagesByTopic).map(topic => ({ 
    value: topic, 
    label: topic 
  }));
  
  // Extract position data from the selected topic if available
  const getPositionData = () => {
    if (!selectedTopic || !messagesByTopic[selectedTopic]) return null;
    
    const data = messagesByTopic[selectedTopic].data;
    
    // Try to find position data in common formats
    if (data.position && typeof data.position === 'object') {
      const { x, y, z } = data.position;
      if (x !== undefined && y !== undefined && z !== undefined) {
        return [x, y, z];
      }
    }
    
    if (data.pose && data.pose.position && typeof data.pose.position === 'object') {
      const { x, y, z } = data.pose.position;
      if (x !== undefined && y !== undefined && z !== undefined) {
        return [x, y, z];
      }
    }
    
    if (data.x !== undefined && data.y !== undefined && data.z !== undefined) {
      return [data.x, data.y, data.z];
    }
    
    return null;
  };
  
  const positionData = getPositionData();
  const positionDataAvailable = positionData !== null;
  
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
          background: '#1a1b1e',
          overflow: 'hidden'
        }}
      >
        <Canvas>
          {/* Basic lighting setup */}
          <ambientLight intensity={Math.PI / 2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
          <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
          
          {/* Primary box that uses position data if available */}
          <Box 
            position={positionDataAvailable ? positionData : [0, 0, 0]} 
            color={positionDataAvailable ? "#4dabf7" : "orange"} 
          />
          
          {/* Add some decorative boxes if no specific data is being visualized */}
          {!positionDataAvailable && (
            <>
              <Box defaultPosition={[-1.5, 0, 0]} color="#fd7e14" />
              <Box defaultPosition={[1.5, 0, 0]} color="#20c997" />
            </>
          )}
        </Canvas>
        
        {/* Optional overlay for instructions */}
        <div style={{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.5)', 
          padding: '5px 10px', 
          borderRadius: '4px',
          pointerEvents: 'none'
        }}>
          <Text size="xs" c="white">Click to resize • Hover to change color</Text>
        </div>
      </Paper>
    </Container>
  );
} 