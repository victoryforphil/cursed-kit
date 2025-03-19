import { Component } from 'react';
import { Paper, Title, Text, Button, Stack, Code, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

/**
 * ErrorBoundary - A component that catches JavaScript errors anywhere in its child component tree
 * and displays a fallback UI instead of crashing the entire app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <Paper p="xl" withBorder shadow="md" m="md">
          <Stack>
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Component Error" 
              color="red"
            >
              An error occurred in this component
            </Alert>
            
            <Title order={3}>Something went wrong</Title>
            <Text>
              {this.state.error?.toString() || 'Unknown error'}
            </Text>
            
            {this.state.errorInfo && (
              <Code block>
                {this.state.errorInfo.componentStack}
              </Code>
            )}
            
            <Button onClick={this.handleReset} color="blue">
              Try Again
            </Button>
          </Stack>
        </Paper>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 