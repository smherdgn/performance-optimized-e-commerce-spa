import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Category A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Category B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Category C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Category D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Category E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Category F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Category G', uv: 3490, pv: 4300, amt: 2100 },
];

const HeavyCharts: React.FC = () => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-center">Sales Performance by Category</h3>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pv" fill="#8884d8" />
            <Bar dataKey="uv" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// This is a large comment block to simulate a larger file size for this module.
// In a real-world scenario, the library itself (recharts) would contribute
// significantly to the bundle size, making dynamic import valuable.
// Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
// Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.
// ... (imagine many more lines of code or comments here)
// Total simulated size: ~150KB

export default HeavyCharts;
