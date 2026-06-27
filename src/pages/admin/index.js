import Link from 'next/link';
import { useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { useDashboardStore } from '../../stores/dashboardStore';
import { formatCurrency } from '../../utils/format';

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

export default function Dashboard() {
  const { summary, isLoading, fetchSummary } = useDashboardStore();

  useEffect(() => {
    fetchSummary().catch(() => {});
  }, [fetchSummary]);

  const kpis = summary?.kpis || {};
  const trend = summary?.revenueTrend || [];
  const sourceData = summary?.revenueBySource || [];

  const cards = [
    { label: 'Total Revenue', value: formatCurrency(kpis.totalRevenue), accent: 'text-emerald-600' },
    { label: 'Course Revenue', value: formatCurrency(kpis.courseRevenue), accent: 'text-blue-600' },
    { label: 'Test Series Revenue', value: formatCurrency(kpis.testSeriesRevenue), accent: 'text-amber-600' },
    { label: 'Book Revenue', value: formatCurrency(kpis.bookRevenue), accent: 'text-fuchsia-600' },
    { label: 'Students', value: kpis.totalStudents || 0, accent: 'text-slate-900' },
    { label: 'Active Test Series', value: kpis.activeTestSeries || 0, accent: 'text-slate-900' },
    { label: 'Live Books', value: kpis.liveBooks || 0, accent: 'text-slate-900' },
    { label: 'Lead Conversion', value: `${kpis.conversionRate || 0}%`, accent: 'text-slate-900' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Revenue Command Center</h1>
          <p className="mt-2 text-sm text-slate-500">
            Admissions, digital assessments, books, and institute operations in one connected dashboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/test-series/create" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            Create Test Series
          </Link>
          <Link href="/admin/products" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Manage Store
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className={`mt-3 text-3xl font-extrabold ${card.accent}`}>
              {isLoading ? '...' : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Monthly Revenue Trend</h2>
            <p className="text-sm text-slate-500">Combined revenue from admissions, test series, and books.</p>
          </div>
          <div className="h-[320px]">
            <Bar
              data={{
                labels: trend.map((item) => item.month),
                datasets: [{
                  label: 'Revenue',
                  data: trend.map((item) => item.amount),
                  backgroundColor: '#2563eb',
                  borderRadius: 10,
                }],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Revenue Mix</h2>
          <p className="mb-6 text-sm text-slate-500">Current source contribution across the platform.</p>
          <div className="h-[220px]">
            <Doughnut
              data={{
                labels: sourceData.map((item) => item.source),
                datasets: [{
                  data: sourceData.map((item) => item.amount),
                  backgroundColor: ['#2563eb', '#f59e0b', '#10b981'],
                  borderWidth: 0,
                }],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
          <div className="mt-6 space-y-3">
            {sourceData.map((item) => (
              <div key={item.source} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">{item.source}</span>
                <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
