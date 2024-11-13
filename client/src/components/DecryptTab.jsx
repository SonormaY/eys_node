import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "./AuthContext";

// Components
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { FileInput } from './FileInput';

const DecryptTab = () => {
  const [inputFile, setInputFile] = useState(null);
  const [decryptedData, setDecryptedData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  const handleDecrypt = async () => {
    if (!inputFile) {
      setError('Please select a file to decrypt.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', inputFile);
      formData.append('token', token);
      
      const response = await axios.post(import.meta.env.VITE_API_URL + 'files/decrypt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
      }});
      setDecryptedData(response.data.decryptedData);
    } catch (err) {
      setError('An error occurred while decrypting the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="decrypt-tab">
      <CardHeader>
        <CardTitle>Decrypt File</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid">
          <FileInput
            label="Select File"
            onChange={(file) => setInputFile(file)}
          />
          <Button onClick={handleDecrypt} disabled={isLoading}>
            {isLoading ? 'Decrypting...' : 'Decrypt'}
          </Button>
          {decryptedData && (
            <div className="decrypted-data">
              <h4>Decrypted Data:</h4>
              <p>{decryptedData}</p>
            </div>
          )}
          {error && <div className="error">{error}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default DecryptTab;
