import React from 'react';

/**
 * ArrowDataViewer - Component to display Arrow IPC data
 * 
 * @param {Object} props
 * @param {Object} props.data - The parsed Arrow data
 */
const ArrowDataViewer = ({ data }) => {
  if (!data || !data.isArrowIPC) {
    return <div>No Arrow data available</div>;
  }

  // Extract fields from the data
  const { topic, time, table } = data;
  
  // Format the time (milliseconds since connection)
  // Handle BigInt by converting to Number first
  const formattedTime = `${(Number(time) / 1000).toFixed(3)}s`;
  
  return (
    <div className="arrow-data-viewer">
      <h3>Arrow IPC Data</h3>
      <div className="arrow-metadata">
        <div><strong>Topic:</strong> {topic}</div>
        <div><strong>Time:</strong> {formattedTime}</div>
        <div><strong>Schema Fields:</strong> {table.schema.fields.map(f => f.name).join(', ')}</div>
      </div>
      
      <h4>Data Values</h4>
      <table className="arrow-data-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data.data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>
                {typeof value === 'bigint' 
                  ? value.toString() 
                  : typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArrowDataViewer; 