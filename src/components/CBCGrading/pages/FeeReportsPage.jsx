/**
 * Fee Reports Page
 * Generate and view comprehensive fee collection reports
 */

import React, { useState, useEffect } from 'react';
import {
  FileText, Download, TrendingUp, TrendingDown, 
  DollarSign, AlertCircle, CheckCircle, RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';

const FeeReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterTerm, setFilterTerm] = useState('all');
  const { showSuccess, showError } = useNotifications();

  const grades = ['PP1', 'PP2', 'Grade1', 'Grade2', 'Grade3', 'Grade4', 'Grade5', 'Grade6', 'Grade7', 'Grade8', 'Grade9'];
  const terms = ['TERM1', 'TERM2', 'TERM3'];

  const fetchStats = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      if (filterGrade !== 'all') params.grade = filterGrade;
      if (filterTerm !== 'all') params.term = filterTerm;

      const response = await api.fees.getPaymentStats(params);
      setStats(response.data);
    } catch (error) {
      showError('Failed to load fee statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, filterGrade, filterTerm, showError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleExport = (format) => {
    showSuccess(`Exporting report as ${format.toUpperCase()}...`);
    // TODO: Implement actual export functionality
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('600', '100')}`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={20} />
            Export Report
          </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Grade</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Term</label>
            <select
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Terms</option>
              {terms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw size={18} />
            Refresh Data
          </button>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
            <option value="collection">Collection Report</option>
            <option value="defaulters">Defaulters Report</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Expected"
          value={`KES ${(stats?.totalExpected || 0).toLocaleString()}`}
          icon={DollarSign}
          color="text-blue-600"
        />
        <StatCard
          title="Total Collected"
          value={`KES ${(stats?.totalCollected || 0).toLocaleString()}`}
          icon={CheckCircle}
          color="text-green-600"
          trend="up"
          trendValue={`${stats?.collectionRate || 0}%`}
        />
        <StatCard
          title="Outstanding Balance"
          value={`KES ${(stats?.totalOutstanding || 0).toLocaleString()}`}
          icon={AlertCircle}
          color="text-red-600"
        />
        <StatCard
          title="Active Invoices"
          value={stats?.totalInvoices || 0}
          icon={FileText}
          color="text-purple-600"
        />
      </div>

      {/* Collection Rate Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Collection Rate</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              {stats?.collectionRate || 0}%
            </span>
          </div>
        </div>
        
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-blue-600">
                Collected: KES {(stats?.totalCollected || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-gray-600">
                Expected: KES {(stats?.totalExpected || 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200">
            <div
              style={{ width: `${stats?.collectionRate || 0}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {stats?.paymentMethods?.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="text-blue-600" size={20} />
                  </div>
                  <span className="font-medium">{method.method}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">KES {method.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{method.count} transactions</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No payment data available</p>
            )}
          </div>
        </div>

        {/* Invoice Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Invoice Status</h3>
          <div className="space-y-3">
            {[
              { status: 'Paid', count: stats?.paidInvoices || 0, color: 'green' },
              { status: 'Partial', count: stats?.partialInvoices || 0, color: 'blue' },
              { status: 'Pending', count: stats?.pendingInvoices || 0, color: 'yellow' },
              { status: 'Overdue', count: stats?.overdueInvoices || 0, color: 'red' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-${item.color}-100 rounded-full flex items-center justify-center`}>
                    <FileText className={`text-${item.color}-600`} size={20} />
                  </div>
                  <span className="font-medium">{item.status} Invoices</span>
                </div>
                <span className="font-bold text-gray-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade-wise Collection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Collection by Grade</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expected</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Collected</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats?.gradeWiseCollection?.map((grade, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{grade.grade}</td>
                  <td className="px-6 py-4 text-gray-600">{grade.studentCount}</td>
                  <td className="px-6 py-4 text-gray-900">KES {grade.expected.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">KES {grade.collected.toLocaleString()}</td>
                  <td className="px-6 py-4 text-red-600 font-semibold">KES {grade.outstanding.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${grade.collectionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{grade.collectionRate}%</span>
                    </div>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No grade-wise data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Download size={20} />
            Export as PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download size={20} />
            Export as Excel
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={20} />
            Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeReportsPage;
