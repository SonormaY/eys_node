import React, { useState,  useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

// Icons
import logo_detailed from './../assets/eys-logo-detailed.svg';
import { MdEnhancedEncryption } from "react-icons/md";
import { TbLockOpen, TbUsers, TbClipboardList } from "react-icons/tb";
import { FiLogOut } from "react-icons/fi";

const Sidebar = ({ onModuleChange }) => {
  const [activeModule, setActiveModule] = useState('encrypt');
  const { setToken, role, setRole } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleModuleClick = (module) => {
    setActiveModule(module);
    onModuleChange(module);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="sidebar flex">
      <div className="logoDiv">
        <div className="logo flex">
          <img src={logo_detailed} alt="EYS Logo" />
        </div>
      </div>

      <div className="menuDiv">
        <h3 className="divTitle">MENU</h3>

        <ul className="menuLists grid">
          <li className={`listItem ${activeModule === 'encrypt' ? 'active' : ''}`} >
            <div
              className="menuLink flex"
              onClick={() => handleModuleClick('encrypt')}
            >
              <MdEnhancedEncryption className="icon" />
              <span className="smallText">Encrypt</span>
            </div>
          </li>
          <li className={`listItem ${activeModule === 'decrypt' ? 'active' : ''}` }>
            <div
              className="menuLink flex"
              onClick={() => handleModuleClick('decrypt')}
            >
              <TbLockOpen className="icon" />
              <span className="smallText">Decrypt</span>
            </div>
          </li>
          <li className={`listItem ${activeModule === 'history' ? 'active' : ''}`}>
            <div
              className="menuLink flex"
              onClick={() => handleModuleClick('history')}
            >
              <TbClipboardList className="icon" />
              <span className="smallText">History</span>
            </div>
          </li>
          {role === 'admin' ? <li className={`listItem ${activeModule === 'all-encryptions' ? 'active' : ''}`}>
            <div
              className="menuLink flex"
              onClick={() => handleModuleClick('all-encryptions')}
            >
              <TbUsers className="icon" />
              <span className="smallText">All Encryptions</span>
            </div>
          </li> : null}
          <li className='logoutItem'>
            <div
              className="menuLink flex"
              onClick={handleLogout}
            >
              <FiLogOut className="icon" />
              <span className="smallText">Logout</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
