import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "./AuthContext";

// Components
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Table } from './Table';
import { Button } from './Button';

const columns = [
  { header: 'FileName', accessor: 'filename' },
  { header: 'UploadDate', accessor: 'date' },
  { header: 'Status', accessor: 'status' },
  { header: 'Actions', accessor: 'actions' },
];



export const HistoryTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const { token } = useContext(AuthContext);
  const [error, setError] = useState('');

  const handleDownload = async (fileId) => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + `service/download`, {
        responseType: 'blob',
        // header with token
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: fileId,
        },        
      });
      const disposition = response.headers['content-disposition'];
      let downloadFileName = 'encrypted_file';
      if (disposition && disposition.includes('filename=')) {
        downloadFileName = disposition.split('filename=')[1].replace(/"/g, ''); // Remove quotes if present
      }
      console.log('Download file:', downloadFileName);
  
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'encrypted-' + downloadFileName);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('An error occurred while downloading the file.');
      }
    }
  };


  useEffect(() => {
    const fetchEncryptionHistory = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL + 'service/history',{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const history = response.data.history;
        if (history.length === 0) {
          setData([]);
          setError('So empty here...');
          return;
        } else {setError('');}
        const data = history.map((file) => ({
          filename: file.original_filename,
          date: new Date(file.created_at).toLocaleString(),
          status: file.original_filename.split('.').pop() == 'eys' ? 'Encrypted' : 'Decrypted',
          actions: (<Button onClick={() =>handleDownload(file.id)}>Download</Button>)
        }));
        setData(data);
      } catch (err) {
        console.error('Error fetching encryption history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    //repeat the fetchEncryptionHistory function every 10 seconds
    fetchEncryptionHistory();
    const interval = setInterval(fetchEncryptionHistory, 1000);
    return () => clearInterval(interval);
  }, []);

  
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
        <span className="error">{error}</span>
      </CardContent>
    </Card>
  );
};

export default HistoryTab;
