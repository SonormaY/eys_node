import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';

export const FileInput = ({ label, onChange, className, maxSize = 200 * 1024 * 1024 }) => {
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB.`);
      onChange(null);
      setFileName('');
    } else {
      setError(null);
      onChange(file);
      setFileName(file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.size <= maxSize) {
      setError(null);
      onChange(file);
      setFileName(file.name);
    } else {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB.`);
      onChange(null);
      setFileName('');
    }
  };

  const handleClick = () => {
    
  };

  return (
    <div
      className={`file-input-wrapper ${isDragOver ? 'drag-over' : ''} ${className || ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        className="file-input"
        onChange={handleFileChange}
      />
      <label className="file-label">
        <FaUpload className="icon" />
        <span>Drag and drop or click to upload</span>
      </label>
      {fileName && <div className="file-name">{fileName}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default FileInput;