import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/analytics/summary', { meta: { scope: 'admin' } })
      .then((res) => {
        const payload = res?.data || res;
        setData(payload || null);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load analytics payload. Admins only.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-gray-500 tracking-widest uppercase">Fetching Diagnostics...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500 text-xl">{error}</div>;
  if (!data || !data.kpis) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500 text-xl">No analytics data available.</div>;

  const { kpis, revenueBySource = [], revenueTrend = [] } = data;

  const pieChartData = {
    labels: revenueBySource.map(e => e.source),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: revenueBySource.map(e => e.amount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)'
        ],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const barChartData = {
    labels: revenueTrend.length ? revenueTrend.map((e) => e.month) : ['Current'],
    datasets: [
      {
        label: 'Gross Revenue (₹)',
        data: revenueTrend.length ? revenueTrend.map((e) => Number(e.amount || 0)) : [Number(kpis.totalRevenue || 0)],
        backgroundColor: 'rgba(52, 211, 153, 0.8)',
        borderRadius: 4,
      }
    ]
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 flex-1 max-w-7xl">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-4">Global Overview Dashboard</h1>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-lg transition transform hover:-translate-y-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Total Revenue</h3>
            <p className="text-4xl lg:text-5xl font-black text-emerald-500">₹{parseFloat(kpis.totalRevenue).toLocaleString()}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-lg transition transform hover:-translate-y-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Lead Conversion</h3>
            <p className="text-4xl lg:text-5xl font-black text-blue-500">{kpis.conversionRate}%</p>
            <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-50 px-3 py-1 rounded-full">Total Leads: {kpis.totalLeads}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-lg transition transform hover:-translate-y-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Avg Test Score</h3>
            <p className="text-4xl lg:text-5xl font-black text-purple-500">{kpis.avgTestScore}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-50 px-3 py-1 rounded-full">Points</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-lg transition transform hover:-translate-y-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Global Attempts</h3>
            <p className="text-4xl lg:text-5xl font-black text-amber-500">{kpis.totalAttempts}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-50 px-3 py-1 rounded-full">Exams Evaluated</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 flex flex-col rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-800 mb-6 text-center tracking-wide">Revenue by Source</h3>
            {revenueBySource.length === 0 ? (
               <div className="flex-1 flex justify-center items-center bg-gray-50 border border-dashed rounded-xl p-8">
                 <p className="text-gray-400 font-medium">No enrollment data to graph.</p>
               </div>
            ) : (
               <div className="w-full flex-1 flex justify-center min-h-[300px]">
                 <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
               </div>
            )}
          </div>
          <div className="bg-white p-8 flex flex-col rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-800 mb-6 text-center tracking-wide">Platform Revenue Trajectory</h3>
            <div className="w-full flex-1 min-h-[300px]">
              <Bar 
                data={barChartData} 
                options={{ 
                  maintainAspectRatio: false, 
                  scales: { 
                    y: { 
                      beginAtZero: true,
                      grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                      grid: { display: false }
                    }
                  },
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
