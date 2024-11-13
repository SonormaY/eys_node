import React, { useState, useContext } from 'react';
import Sidebar from './Sidebar';
import EncryptTab from './EncryptTab';
import DecryptTab from './DecryptTab';
import HistoryTab from './HistoryTab';
import { Navigate } from 'react-router-dom';
import { AuthContext } from "./AuthContext";
// import AllEncryptionsTab from './AllEncryptionsTab';

const Dashboard = () => {
  const { token, loading } = useContext(AuthContext);
  const [currentModule, setCurrentModule] = useState('encrypt');
  if (loading) {
    return null;
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleModuleChange = (module) => {
    setCurrentModule(module);
  };

  return (
    <div className="dashboard flex">
      <Sidebar onModuleChange={handleModuleChange} />
      <div className="content flex-1">
        <div style={{ display: currentModule === 'encrypt' ? 'block' : 'none' }}><EncryptTab /></div>
        <div style={{ display: currentModule === 'decrypt' ? 'block' : 'none' }}><DecryptTab /></div>
        <div style={{ display: currentModule === 'history' ? 'block' : 'none' }}><HistoryTab /></div>
        {/* <div><AllEncryptionsTab /></div> */}
      </div>
    </div>
  );
};

export default Dashboard;