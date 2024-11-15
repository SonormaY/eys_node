import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from "./AuthContext";

// Components
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { FileInput } from './FileInput';

const DecryptTab = () => {
  const [inputDecryptFile, setInputDecryptFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultFileId, setResultFileId] = useState('');
  const { token } = useContext(AuthContext);

  const handleDecrypt = async () => {
    if (!inputDecryptFile) {
      setError('Please select a file to decrypt.');
      return;
    }
    if (!inputDecryptFile.name.endsWith('.eys')) {
      setError('File is not encrypted');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', inputDecryptFile);
      formData.append('token', token);
      
      const response = await axios.post(import.meta.env.VITE_API_URL + 'files/decrypt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
      }});
      setResultFileId(response.data.fileId);
    } catch (err) {
      setError('An error occurred while decrypting the file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resultFileId) {
      setError('No file to download');
      return;
    }

    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + `service/download`, {
        responseType: 'blob',
        // header with token
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: resultFileId,
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
      link.setAttribute('download', 'decrypted-' + downloadFileName);
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
    if (error) {
      setTimeout(() => setError(''), 4000);
    }
  }, [error]);

  return (
    <Card className="decrypt-tab">
      <CardHeader>
        <CardTitle>Decrypt File</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid">
          <FileInput
            onChange={(file) => setInputDecryptFile(file)}
          />
          <Button onClick={handleDecrypt}>
            Add file to decryption queue
          </Button>
          <Button onClick={handleDownload} disabled={!resultFileId}>
            {isLoading  ? 'Decrypting...' : 'Download last decrypted file'}
          </Button>
          {error && <div className="error">{error}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default DecryptTab;

