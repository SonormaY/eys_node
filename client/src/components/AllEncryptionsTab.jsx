import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from "./AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

const AllEncryptionsTab = () => {
  const [workerData, setWorkerData] = useState([]);
  const [error, setError] = useState('');
  const [systemInfo, setSystemInfo] = useState({
    totalWorkers: 0,
    maxWorkers: 0,
    maxTasks: 0,
    runningTasks: 0,
  });
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL + 'workers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { workers, totalWorkers, maxWorkers, maxTasks } = response.data;
        
        // Transform worker data for the chart
        const transformedData = workers.map(worker => ({
          name: `Worker ${worker.id}`,
          tasks: worker.tasks ? worker.tasks : 0,
          fill: '#8884d8'
        }));

        setWorkerData(transformedData);
        // calculate running tasks
        const runningTasks = workers.reduce((acc, worker) => acc + worker.tasks, 0);
        console.log('runningTasks', runningTasks);
        console.log('maxTasks', maxTasks);
        console.log('maxWorkers', maxWorkers);
        setSystemInfo({
          totalWorkers,
          maxWorkers,
          maxTasks,
          runningTasks,
        });
        setError('');
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Failed to fetch server data');
        }
      }
    };

    const interval = setInterval(fetchWorkerData, 1000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="all-encryptions-tab">
      <Card>
        <CardHeader>
          <CardTitle>Server Load Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              <div className="system-info grid">
                <div className="info-card">
                  <h3>Active Workers</h3>
                  <p>{systemInfo.totalWorkers}</p>
                </div>
                <div className="info-card">
                  <h3>Maximum Workers</h3>
                  <p>{systemInfo.maxWorkers}</p>
                </div>
                <div className="info-card">
                  <h3>Utilization</h3>
                  <p>{Math.round(systemInfo.runningTasks / (systemInfo.maxWorkers * systemInfo.maxTasks) * 100)}%</p>
                </div>
              </div>
              
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={workerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tasks" name="Active Tasks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllEncryptionsTab;