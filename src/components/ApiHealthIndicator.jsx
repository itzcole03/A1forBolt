import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ApiHealthIndicator = () => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    axios.get('/api/health')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('down'));
  }, []);

  let color = 'gray';
  let text = 'Checking...';
  if (status === 'ok') { color = 'green'; text = 'API Online'; }
  if (status === 'down') { color = 'red'; text = 'API Down'; }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-${color}-100 text-${color}-700`} title="Backend API health">
      <span className={`w-2 h-2 rounded-full bg-${color}-500 mr-2 inline-block`}></span>
      {text}
    </span>
  );
};

export default ApiHealthIndicator;
