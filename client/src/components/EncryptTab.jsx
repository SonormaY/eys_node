import React, { useState } from 'react';
import axios from 'axios';

// Components
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { FileInput } from './FileInput';

const EncryptTab = () => {
  const [inputFile, setInputFile] = useState(null);
  const [encryptedData, setEncryptedData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    if (!inputFile) {
      setError('Please select a file to encrypt.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', inputFile);
      const response = await axios.post('/api/encrypt', formData);
      setEncryptedData(response.data.encryptedData);
    } catch (err) {
      setError('An error occurred while encrypting the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="encrypt-tab">
      <CardHeader>
        <CardTitle>Encrypt File</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid">
          <FileInput
            label="Select File"
            onChange={(file) => setInputFile(file)}
          />
          <Button onClick={handleEncrypt} disabled={isLoading}>
            {isLoading ? 'Encrypting...' : 'Encrypt'}
          </Button>
          {encryptedData && (
            <div className="encrypted-data">
              <h4>Encrypted Data:</h4>
              <p>{encryptedData}</p>
            </div>
          )}
          {error && <div className="error">{error}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default EncryptTab;
