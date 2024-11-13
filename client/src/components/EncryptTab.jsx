import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "./AuthContext";

// Components
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { FileInput } from './FileInput';

const EncryptTab = () => {
  const [inputFile, setInputFile] = useState(null);
  const [encryptedData, setEncryptedData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  const handleEncrypt = async () => {
    if (!inputFile) {
      setError('Please select a file to encrypt.');
      return;
    }
    const fileSignature = await getFileSignature(inputFile);
    if (fileSignature.startsWith('encryptedbyeys')) {
      setError('File is already encrypted');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      // if detect cyrillic symbols in file name, replace it with transliteration
      const fileName = inputFile.name;
      const fileNameTranslit = cyrillicToTranslit(fileName);
      const newFile = new File([inputFile], fileNameTranslit, { type: inputFile.type });
      formData.append('file', newFile);
      formData.append('token', token);

      const response = await axios.post(import.meta.env.VITE_API_URL + 'files/encrypt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
      }});
      setEncryptedData(response.data.encryptedData);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('An error occurred while encrypting the file.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFileSignature = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = new TextDecoder("utf-8").decode(reader.result);
        resolve(text.slice(0, 14)); // Read only the first part of the file
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file.slice(0, 14)); // Read a small part of the file
    });
  };

  const cyrillicToTranslit = (str) => {
    const ua = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'iu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye', 'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'iu', 'Я': 'Ya',
    };
    return str.split('').map(char => ua[char] || char).join('');
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
