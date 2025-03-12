import { useState, useEffect, useRef } from 'react';
import { 
  Paper, 
  Title, 
  Container, 
  Text,
  Select,
  Group,
  Stack,
  Badge,
  SegmentedControl,
  MultiSelect,
  Button,
  Grid,
  ActionIcon,
  Tooltip,
  ScrollArea
} from '@mantine/core';
import { useWebSocketContext } from '../../context/WebSocketProvider';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { IconRefresh, IconChartLine, IconTable } from '@tabler/icons-react';

/**
 * PlotsView - Component for displaying real-time plots of WebSocket data
 */
export function PlotsView() {
  const { 
    latestMessage, 
    messagesByTopic, 
    isConnected, 
    messageCount 
  } = useWebSocketContext();
  
  // State
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [dataPoints, setDataPoints] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [viewMode, setViewMode] = useState('chart');
  const [debugMode, setDebugMode] = useState(false);
  const [maxPoints, setMaxPoints] = useState(100);
  
  // Generate a consistent color for each field
  const getFieldColor = (field) => {
    const colors = [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    
    // Simple hash function to get a consistent index for each field
    let hash = 0;
    for (let i = 0; i < field.length; i++) {
      hash = ((hash << 5) - hash) + field.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  // Debug logging function (no-op)
  const addDebugLog = () => {};
  
  // Function to parse the specific data format from the server
  const parseDataPoint = (message) => {
    try {
      addDebugLog('Parsing message', message);
      
      // Extract NewDatapoint object
      let datapoint = null;
      
      if (message.NewDatapoint) {
        datapoint = message.NewDatapoint;
      } else if (message.data && message.data.NewDatapoint) {
        datapoint = message.data.NewDatapoint;
      } else {
        addDebugLog('No NewDatapoint found in message');
        return null;
      }
      
      const { topic, time, data_json } = datapoint;
      
      if (!data_json) {
        addDebugLog('No data_json found in datapoint');
        return null;
      }
      
      // Parse the data_json field (it's a string containing an array with JSON strings)
      const dataArray = JSON.parse(data_json);
      addDebugLog('Parsed data_json array', dataArray);
      
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        addDebugLog('data_json did not parse to a valid array');
        return null;
      }
      
      // The array format should be [[timestamp, jsonString]]
      // Get the inner JSON string (index 1 of the first array item)
      const innerData = dataArray[0];
      
      if (!Array.isArray(innerData) || innerData.length < 2) {
        addDebugLog('Inner data array is not valid', innerData);
        return null;
      }
      
      const jsonString = innerData[1];
      addDebugLog('Extracted JSON string', jsonString);
      
      // Parse the inner JSON string to get the actual data
      const parsedData = JSON.parse(jsonString);
      addDebugLog('Parsed inner data', parsedData);
      
      // Extract all fields we're interested in (flattened)
      const result = {
        timestamp: Date.now(),
        serverTime: time,
        topic
      };
      
      // Flatten the nested structure for easier plotting
      
      // Handle pose.position
      if (parsedData.pose && parsedData.pose.position) {
        result['pose.position.x'] = parsedData.pose.position.x;
        result['pose.position.y'] = parsedData.pose.position.y;
        result['pose.position.z'] = parsedData.pose.position.z;
      }
      
      // Handle pose.rotation
      if (parsedData.pose && parsedData.pose.rotation) {
        result['pose.rotation.x'] = parsedData.pose.rotation.x;
        result['pose.rotation.y'] = parsedData.pose.rotation.y;
        result['pose.rotation.z'] = parsedData.pose.rotation.z;
      }
      
      // Handle velocity
      if (parsedData.velocity) {
        result['velocity.x'] = parsedData.velocity.x;
        result['velocity.y'] = parsedData.velocity.y;
        result['velocity.z'] = parsedData.velocity.z;
      }
      
      // Handle acceleration
      if (parsedData.acceleration) {
        result['acceleration.x'] = parsedData.acceleration.x;
        result['acceleration.y'] = parsedData.acceleration.y;
        result['acceleration.z'] = parsedData.acceleration.z;
      }
      
      addDebugLog('Extracted flattened data', result);
      return result;
    } catch (error) {
      addDebugLog('Error parsing data point', error);
      return null;
    }
  };
  
  // Extract available fields from a data point
  const extractFields = (dataPoint) => {
    if (!dataPoint) return [];
    
    const fields = [];
    
    Object.entries(dataPoint).forEach(([key, value]) => {
      // Skip metadata fields
      if (key === 'timestamp' || key === 'serverTime' || key === 'topic') return;
      
      // Only include numeric fields
      if (typeof value === 'number') {
        fields.push({
          value: key,
          label: key
        });
      }
    });
    
    return fields;
  };
  
  // Process latest message
  useEffect(() => {
    if (!latestMessage) return;
    
    const parsed = parseDataPoint(latestMessage);
    if (!parsed) return;
    
    // Only process if it's for our selected topic or we don't have a selected topic yet
    if (!selectedTopic || parsed.topic === selectedTopic) {
      // Set topic if not already set
      if (!selectedTopic) {
        setSelectedTopic(parsed.topic);
        addDebugLog('Auto-selected topic', parsed.topic);
      }
      
      // Extract available fields if we don't have any yet
      if (availableFields.length === 0) {
        const fields = extractFields(parsed);
        setAvailableFields(fields);
        addDebugLog('Extracted available fields', fields);
        
        // Auto-select first few fields if none selected
        if (selectedFields.length === 0 && fields.length > 0) {
          const autoFields = fields.slice(0, 3).map(f => f.value);
          setSelectedFields(autoFields);
          addDebugLog('Auto-selected fields', autoFields);
        }
      }
      
      // Add data point to our buffer (if we have fields selected)
      if (selectedFields.length > 0) {
        setDataPoints(prev => {
          // Only keep the fields we want to display
          const newPoint = { timestamp: parsed.timestamp };
          
          selectedFields.forEach(field => {
            if (parsed[field] !== undefined) {
              newPoint[field] = parsed[field];
            }
          });
          
          const newPoints = [...prev, newPoint];
          // Limit the number of points to avoid memory issues
          return newPoints.slice(-maxPoints);
        });
        
        addDebugLog('Added new data point to buffer', {
          bufferSize: dataPoints.length + 1,
          newPoint: parsed
        });
      }
    }
  }, [latestMessage]);
  
  // Process data from messagesByTopic when selectedTopic changes
  useEffect(() => {
    if (!selectedTopic || !messagesByTopic[selectedTopic]) return;
    
    addDebugLog('Processing data for selected topic', selectedTopic);
    
    // Get the message for this topic
    const message = messagesByTopic[selectedTopic];
    
    // Parse it
    const parsed = parseDataPoint(message);
    if (!parsed) return;
    
    // Extract available fields
    const fields = extractFields(parsed);
    setAvailableFields(fields);
    addDebugLog('Updated available fields', fields);
    
    // If we don't have any fields selected yet, auto-select the first few
    if (selectedFields.length === 0 && fields.length > 0) {
      const autoFields = fields.slice(0, 3).map(f => f.value);
      setSelectedFields(autoFields);
      addDebugLog('Auto-selected fields', autoFields);
    }
    
    // Add initial data point
    if (selectedFields.length > 0) {
      setDataPoints([{
        timestamp: parsed.timestamp,
        ...Object.fromEntries(
          selectedFields
            .filter(field => parsed[field] !== undefined)
            .map(field => [field, parsed[field]])
        )
      }]);
      
      addDebugLog('Added initial data point');
    }
  }, [selectedTopic, messagesByTopic]);
  
  // Handle clearing the graph
  const handleClearData = () => {
    setDataPoints([]);
    addDebugLog('Cleared data points');
  };
  
  // Get list of available topics
  const topicOptions = Object.keys(messagesByTopic).map(topic => ({
    value: topic,
    label: topic
  }));
  
  // Calculate statistics for each field
  const getFieldStats = (field) => {
    const values = dataPoints
      .map(p => p[field])
      .filter(v => v !== undefined);
    
    if (values.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      count: values.length
    };
  };
  
  return (
    <Container size="xl" py="md">
      <Group position="apart" mb="md">
        <Title order={2}>Data Plots</Title>
        <Group spacing="xs">
          <Badge size="lg" color={isConnected ? 'green' : 'red'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Badge size="lg" variant="outline">
            {messageCount.toLocaleString()} messages
          </Badge>
        </Group>
      </Group>
      
      {/* Configuration Panel */}
      <Paper withBorder p="md" mb="lg">
        <Stack spacing="md">
          <Group position="apart">
            <Title order={4}>Plot Configuration</Title>
            <Group>
              <SegmentedControl
                value={viewMode}
                onChange={setViewMode}
                data={[
                  { label: 'Chart', value: 'chart', icon: <IconChartLine size={16} /> },
                  { label: 'Table', value: 'table', icon: <IconTable size={16} /> }
                ]}
              />
              
              <Tooltip label="Clear data">
                <ActionIcon 
                  color="red" 
                  variant="subtle"
                  onClick={handleClearData}
                  disabled={dataPoints.length === 0}
                >
                  <IconRefresh size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
          
          <Group grow>
            <Select
              label="Topic"
              placeholder="Select a topic"
              data={topicOptions}
              value={selectedTopic}
              onChange={setSelectedTopic}
              searchable
              clearable
              nothingFoundMessage="No topics available"
            />
          </Group>
          
          {selectedTopic && (
            <MultiSelect
              label="Fields to Plot"
              placeholder="Select fields to display"
              data={availableFields}
              value={selectedFields}
              onChange={setSelectedFields}
              searchable
              clearable
              nothingFoundMessage="No fields available"
            />
          )}
          
          {selectedFields.length > 0 && (
            <Group spacing="xs">
              {selectedFields.map(field => (
                <Badge 
                  key={field}
                  color={getFieldColor(field)}
                >
                  {field}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Paper>
      
      {/* Chart/Table Display */}
      <Paper withBorder p="md" mb="md">
        {selectedTopic && selectedFields.length > 0 && dataPoints.length > 0 ? (
          viewMode === 'chart' ? (
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataPoints}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value, name) => [value.toFixed(4), name]}
                    labelFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                  />
                  <Legend />
                  <ReferenceLine y={0} stroke="#888" />
                  
                  {selectedFields.map(field => (
                    <Line
                      key={field}
                      type="monotone"
                      dataKey={field}
                      stroke={getFieldColor(field)}
                      activeDot={{ r: 4 }}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ScrollArea h={400}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Time</th>
                    {selectedFields.map(field => (
                      <th 
                        key={field} 
                        style={{ 
                          padding: '8px', 
                          borderBottom: '1px solid #ddd', 
                          textAlign: 'right',
                          color: getFieldColor(field)
                        }}
                      >
                        {field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataPoints.slice().reverse().map((point, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#f9f9f9' : 'transparent' }}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        {new Date(point.timestamp).toLocaleTimeString()}
                      </td>
                      {selectedFields.map(field => (
                        <td 
                          key={field} 
                          style={{ 
                            padding: '8px', 
                            borderBottom: '1px solid #eee', 
                            textAlign: 'right',
                            fontFamily: 'monospace'
                          }}
                        >
                          {point[field] !== undefined ? point[field].toFixed(4) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )
        ) : (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stack align="center" spacing="md">
              {!selectedTopic ? (
                <Text c="dimmed">Select a topic to display data</Text>
              ) : selectedFields.length === 0 ? (
                <Text c="dimmed">Select fields to plot</Text>
              ) : dataPoints.length === 0 ? (
                <Text c="dimmed">Waiting for data...</Text>
              ) : null}
              
              {!isConnected && (
                <Badge color="yellow">Connect to WebSocket server first</Badge>
              )}
            </Stack>
          </div>
        )}
      </Paper>
      
      {/* Field Statistics */}
      {selectedFields.length > 0 && dataPoints.length > 0 && (
        <Paper withBorder p="md">
          <Title order={4} mb="md">Statistics</Title>
          <Grid>
            {selectedFields.map(field => {
              const stats = getFieldStats(field);
              
              return (
                <Grid.Col key={field} span={4}>
                  <Paper withBorder p="sm">
                    <Group position="apart" mb="xs">
                      <Text fw={500} style={{ color: getFieldColor(field) }}>{field}</Text>
                      <Badge>{stats.count} points</Badge>
                    </Group>
                    <Stack spacing={2}>
                      <Group position="apart">
                        <Text size="sm" c="dimmed">Min:</Text>
                        <Text size="sm" ff="monospace">{stats.min.toFixed(4)}</Text>
                      </Group>
                      <Group position="apart">
                        <Text size="sm" c="dimmed">Max:</Text>
                        <Text size="sm" ff="monospace">{stats.max.toFixed(4)}</Text>
                      </Group>
                      <Group position="apart">
                        <Text size="sm" c="dimmed">Avg:</Text>
                        <Text size="sm" ff="monospace">{stats.avg.toFixed(4)}</Text>
                      </Group>
                    </Stack>
                  </Paper>
                </Grid.Col>
              );
            })}
          </Grid>
        </Paper>
      )}
    </Container>
  );
} 