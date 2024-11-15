import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from "./AuthContext";

// Components
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { FileInput } from './FileInput';


const EncryptTab = () => {
  const [inputEncryptFile, setInputEncryptFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultFileId, setResultFileId] = useState('');
  const { token } = useContext(AuthContext);

  const handleEncrypt = async () => {
    if (!inputEncryptFile) {
      setError('Please select a file to encrypt.');
      return;
    }
    const fileSignature = await getFileSignature(inputEncryptFile);
    if (fileSignature.startsWith('encryptedbyeys')) {
      setError('File is already encrypted');
      return;
    }
    setIsLoading(true);

    try {
      const formData = new FormData();
      // if detect cyrillic symbols in file name, replace it with transliteration
      const fileName = inputEncryptFile.name;
      const fileNameTranslit = cyrillicToTranslit(fileName);
      const newFile = new File([inputEncryptFile], fileNameTranslit, { type: inputEncryptFile.type });
      formData.append('file', newFile);
      formData.append('token', token);

      const response = await axios.post(import.meta.env.VITE_API_URL + 'files/encrypt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
      }});
      setResultFileId(response.data.fileId);
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

  useEffect(() => {
    if (error) {
      setTimeout(() => setError(''), 4000);
    }
  }, [error]);

  return (
    <Card className="encrypt-tab">
      <CardHeader>
        <CardTitle>Encrypt File</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid">
          <FileInput
            onChange={(file) => setInputEncryptFile(file)}
          />
          <Button onClick={handleEncrypt}>
            Add file to encryption queue
          </Button>
          <Button onClick={handleDownload} disabled={!resultFileId || isLoading}>
            {isLoading ? 'Encrypting...' : 'Download encrypted file'}
          </Button>
          {error && <div className="error">{error}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default EncryptTab;

