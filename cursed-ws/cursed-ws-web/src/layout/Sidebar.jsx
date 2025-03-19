import { 
  Stack, 
  Text, 
  Group, 
  UnstyledButton, 
  rem, 
  Title, 
  Divider, 
  ScrollArea,
  Badge,
  Accordion,
  Flex,
  Tooltip,
  Loader,
  Center,
  Box,
  TextInput,
  Button,
  ActionIcon,
  NumberInput,
  Switch,
  Modal
} from '@mantine/core'
import { 
  IconFolderOpen,
  IconGitCompare,
  IconHistory,
  IconFiles,
  IconFile,
  IconFileText,
  IconStar,
  IconFolderFilled,
  IconFolder,
  IconMessage,
  IconChartLine,
  IconCube,
  IconBug,
  IconPlugConnected,
  IconPlugConnectedX,
  IconPlugX,
  IconSettings
} from '@tabler/icons-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useWebSocketContext } from '../context/WebSocketProvider'
import { ReadyState } from 'react-use-websocket'
import SettingsPanel from '../components/SettingsPanel'

/**
 * NavbarLink - Navigation link component for sidebar
 * 
 * @param {Object} props - Component properties
 * @param {React.Component} props.icon - Icon component to display
 * @param {string} props.label - Label text
 * @param {string} props.to - Route path
 * @param {boolean} props.active - Whether this link is active
 */
function NavbarLink({ icon: Icon, label, to, active, count }) {
  return (
    <NavLink 
      to={to}
      style={{ textDecoration: 'none' }}
    >
      {({ isActive }) => (
        <UnstyledButton
          sx={(theme) => ({
            display: 'block',
            width: '100%',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
            backgroundColor: isActive 
              ? theme.colorScheme === 'dark' 
                ? theme.colors.dark[6] 
                : theme.colors.gray[1]
              : 'transparent',
            '&:hover': {
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            },
          })}
        >
          <Group spacing="xs">
            <Icon size={16} />
            <Text size="sm">{label}</Text>
            {count !== undefined && count > 0 && (
              <Badge size="xs" variant="filled">
                {count}
              </Badge>
            )}
          </Group>
        </UnstyledButton>
      )}
    </NavLink>
  )
}

/**
 * Converts flat file list from API to hierarchical tree structure
 * This is a simplified version of the same function from FileView.jsx
 */
const convertFilesToTreeFormat = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return null;
  }
  
  // Create root node
  const rootNode = {
    uri: '/root',
    type: 'directory',
    expanded: true,
    children: [],
    originalData: {}
  };
  
  // Map to store created directories
  const dirMap = {
    '/root': rootNode
  };
  
  // Process each file and create directories as needed
  files.forEach(file => {
    if (!file.path) {
      return;
    }
    
    // Normalize path and split into segments
    let path = file.path.startsWith('/') ? file.path : '/' + file.path;
    const segments = path.split('/').filter(Boolean);
    
    // Start from root directory
    let currentPath = '/root';
    let parentNode = rootNode;
    
    // Create directories as needed
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      const dirPath = `${currentPath}/${segment}`;
      
      if (!dirMap[dirPath]) {
        // Create new directory node
        const dirNode = {
          uri: dirPath,
          type: 'directory',
          expanded: false, // Default to collapsed in sidebar 
          children: [],
          originalData: {}
        };
        
        // Add to parent and update map
        parentNode.children.push(dirNode);
        dirMap[dirPath] = dirNode;
      }
      
      // Update current directory
      currentPath = dirPath;
      parentNode = dirMap[dirPath];
    }
    
    // Add file node to its parent directory
    const fileName = segments[segments.length - 1];
    const filePath = `${currentPath}/${fileName}`;
    
    // Create file node
    const fileNode = {
      uri: filePath,
      type: 'file',
      children: [],
      originalData: {
        path: file.path,
        comparisonResult: file.comparison_result || 'baseline'
      }
    };
    
    // Add to parent
    parentNode.children.push(fileNode);
  });
  
  return rootNode;
};

/**
 * Recursive component to render a file tree
 */
function FileTreeNode({ node, level = 0, onToggle, onFileClick }) {
  const indentation = level * 16;
  const isDirectory = node.type === 'directory';
  const fileName = node.uri.split('/').pop();
  
  // Handle status color/label for files
  let statusColor = null;
  let labelStyle = {};
  
  if (node.originalData?.comparisonResult) {
    const status = node.originalData.comparisonResult.toLowerCase();
    switch (status) {
      case 'added':
        statusColor = 'green';
        labelStyle = { color: '#4caf50' };
        break;
      case 'modified':
        statusColor = 'yellow';
        labelStyle = { color: '#ff9800' };
        break;
      case 'removed':
        statusColor = 'red';
        labelStyle = { color: '#f44336', textDecoration: 'line-through' };
        break;
      case 'baseline':
        statusColor = 'blue';
        break;
      default:
        statusColor = null;
    }
  }
  
  return (
    <Box>
      <Tooltip label={node.originalData?.path || node.uri} position="right" withArrow>
        <UnstyledButton 
          onClick={() => isDirectory ? onToggle(node) : onFileClick(node)} 
          px={4} 
          py={4}
          style={{ 
            width: '100%', 
            textAlign: 'left',
            borderRadius: 4,
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          <Group pl={indentation} spacing="xs" nowrap>
            {isDirectory ? (
              node.expanded ? <IconFolderOpen size={14} /> : <IconFolder size={14} />
            ) : (
              <IconFileText size={14} />
            )}
            <Text 
              size="xs" 
              truncate 
              style={{ 
                ...labelStyle, 
                fontWeight: isDirectory ? 500 : 400,
                maxWidth: `calc(100% - ${indentation + 30}px)`
              }}
            >
              {fileName}
            </Text>
            {!isDirectory && statusColor && (
              <Badge size="xs" color={statusColor} variant="dot" />
            )}
          </Group>
        </UnstyledButton>
      </Tooltip>
      
      {/* Render children if directory is expanded */}
      {isDirectory && node.expanded && node.children.map((child, index) => (
        <FileTreeNode 
          key={child.uri || index} 
          node={child} 
          level={level + 1}
          onToggle={onToggle}
          onFileClick={onFileClick}
        />
      ))}
    </Box>
  );
}

/**
 * Component to render a file tree section
 */
function FileTreeSection({ title, files, isLoading }) {
  const [treeData, setTreeData] = useState(null);
  const navigate = useNavigate();
  
  // Process files into tree format
  useEffect(() => {
    if (files && files.length > 0) {
      const processedTree = convertFilesToTreeFormat(files);
      setTreeData(processedTree);
    }
  }, [files]);
  
  // Toggle directory expanded state
  const handleToggle = (node) => {
    if (node.type === 'directory') {
      node.expanded = !node.expanded;
      // Force update by creating a new reference
      setTreeData({ ...treeData });
    }
  };
  
  // Handle file click to view diff
  const handleFileClick = (node) => {
    if (node.type === 'file' && node.originalData?.path) {
      // For files in Folder A
      if (node.originalData.comparisonResult === 'baseline' || 
          node.originalData.comparisonResult === 'modified' ||
          node.originalData.comparisonResult === 'removed') {
        const pathA = node.originalData.path;
        const pathB = node.originalData.comparisonResult === 'removed' ? '' : pathA;
        navigate(`/diff/${encodeURIComponent(pathA)}/${encodeURIComponent(pathB)}`);
      }
      // For files in Folder B
      else if (node.originalData.comparisonResult === 'added') {
        const pathB = node.originalData.path;
        navigate(`/diff//${encodeURIComponent(pathB)}`);
      }
    }
  };
  
  return (
    <Box>
      <Accordion.Item value={title.toLowerCase().replace(/\s+/g, '-')}>
        <Accordion.Control icon={<IconFolderOpen size={16} />}>
          {title}
        </Accordion.Control>
        <Accordion.Panel>
          {isLoading ? (
            <Center py="sm">
              <Loader size="xs" />
            </Center>
          ) : treeData && treeData.children && treeData.children.length > 0 ? (
            <Box>
              {treeData.children.map((child, index) => (
                <FileTreeNode 
                  key={child.uri || index} 
                  node={child} 
                  onToggle={handleToggle}
                  onFileClick={handleFileClick}
                />
              ))}
            </Box>
          ) : (
            <Text size="xs" color="dimmed" ta="center" py="sm">
              No files available
            </Text>
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Box>
  );
}

/**
 * WebSocketConnectionPanel - Panel for connecting to a WebSocket server
 */
export function WebSocketConnectionPanel() {
  const { 
    address, setAddress,
    port, setPort,
    path, setPath,
    isConnected,
    connect, disconnect,
    connectionStatus,
    readyState,
    messageCount,
    messageRate
  } = useWebSocketContext();

  const [addressInput, setAddressInput] = useState(address);
  const [portInput, setPortInput] = useState(port.toString());
  const [pathInput, setPathInput] = useState(path || '');
  
  // Update local state when context values change
  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  useEffect(() => {
    setPortInput(port.toString());
  }, [port]);
  
  useEffect(() => {
    setPathInput(path || '');
  }, [path]);
  
  // Handle connection toggle
  const handleConnect = () => {
    if (isConnected) {
      disconnect();
    } else {
      // Update address and port from inputs before connecting
      setAddress(addressInput);
      setPort(parseInt(portInput, 10));
      setPath(pathInput);
      connect();
    }
  };
  
  return (
    <Stack spacing="xs">
      <Group position="apart">
        <Text fw={500}>WebSocket Connection</Text>
        <Badge 
          size="sm" 
          color={isConnected ? 'green' : 'red'}
        >
          {connectionStatus}
        </Badge>
      </Group>
      
      <TextInput
        size="xs"
        label="Server Address"
        placeholder="127.0.0.1"
        value={addressInput}
        onChange={(e) => setAddressInput(e.target.value)}
        disabled={isConnected}
      />
      
      <TextInput
        size="xs"
        label="Port"
        value={portInput}
        onChange={(e) => setPortInput(e.target.value)}
        disabled={isConnected}
      />
      
      <TextInput
        size="xs"
        label="Path"
        placeholder="ws"
        value={pathInput}
        onChange={(e) => setPathInput(e.target.value)}
        disabled={isConnected}
      />
      
      {isConnected && (
        <Group position="apart" mt="xs">
          <Text size="xs" c="dimmed">Messages: {messageCount}</Text>
          <Text size="xs" c="dimmed">Rate: {messageRate}/s</Text>
        </Group>
      )}
      
      <Button
        fullWidth
        size="sm"
        mt="xs"
        color={isConnected ? 'red' : 'blue'}
        leftIcon={isConnected ? <IconPlugX size={16} /> : <IconPlugConnected size={16} />}
        onClick={handleConnect}
      >
        {isConnected ? 'Disconnect' : 'Connect'}
      </Button>
    </Stack>
  );
}

/**
 * Sidebar - Main sidebar navigation component
 * 
 * Provides navigation between views and WebSocket connection options
 */
export function Sidebar() {
  const location = useLocation()
  const [activeLink, setActiveLink] = useState(location.pathname)
  
  // Update active link when location changes
  useEffect(() => {
    setActiveLink(location.pathname)
  }, [location.pathname])
  
  return (
    <Stack h="100%" spacing={0}>

      <ScrollArea flex={1}>
        <Stack spacing="xs">
          <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={5}>Navigation</Text>
          
          <NavbarLink
            icon={IconMessage}
            label="Messages"
            to="/messages"
            active={activeLink === '/messages'}
          />
          
          <NavbarLink
            icon={IconChartLine}
            label="Plots"
            to="/plots"
            active={activeLink === '/plots'}
          />
          
          <NavbarLink
            icon={IconCube}
            label="3D View"
            to="/3d"
            active={activeLink === '/3d'}
          />
          
          <NavbarLink
            icon={IconBug}
            label="Debug"
            to="/debug"
            active={activeLink === '/debug'}
          />
        </Stack>
      </ScrollArea>
      
      <Divider my="md" />
      
      <WebSocketConnectionPanel />
    </Stack>
  )
} 