import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Components
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Table } from './Table';

export const HistoryTab = () => {
  const [encryptionHistory, setEncryptionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEncryptionHistory = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/history');
        setEncryptionHistory(response.data.history);
      } catch (err) {
        console.error('Error fetching encryption history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEncryptionHistory();
  }, []);

  const columns = [
    { header: 'FileName', accessor: 'filename' },
    { header: 'UploadDate', accessor: 'date' },
    { header: 'Actions', accessor: 'actions' },
  ];
  const data = [
    { filename: 'test.txt', date: '2021-08-01', actions: <a href={history.downloadUrl} download>Download</a> },
    { filename: 'test2.txt', date: '2021-08-02', actions: <a href={history.downloadUrl} download>Download</a> },
  ];

  return (
    <Card className="history-tab">
      <CardHeader>
        <CardTitle>Encryption History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
            <Table columns={columns} data={data} />
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryTab;