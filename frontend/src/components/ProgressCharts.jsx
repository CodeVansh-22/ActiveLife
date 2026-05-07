import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line
} from 'recharts';
import '../styles/components.css';

const ProgressCharts = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data-msg">Start your journey to see performance analytics!</div>;
  }

  // Create cumulative progress data
  let cumulative = 0;
  const trendData = data.map((item, index) => {
    cumulative += 1;
    return { ...item, cumulativeProgress: cumulative };
  });

  return (
    <div className="progress-charts-container">
      <div className="progress-chart-item">
        <h4 className="progress-chart-title">Daily XP Earnings</h4>
        <div className="progress-chart-wrapper">
          <ResponsiveContainer>
            <BarChart data={data.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0a1923', border: '1px solid rgba(255,122,32,0.3)', borderRadius: '8px', color: 'white' }}
                itemStyle={{ color: '#ff7a20' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="xpEarned" fill="var(--accent-orange)" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="progress-chart-item">
        <h4 className="progress-chart-title">Days Completed Trend</h4>
        <div className="progress-chart-wrapper">
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0a1923', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
              />
              <Line type="monotone" dataKey="cumulativeProgress" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#0a1923' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProgressCharts;
