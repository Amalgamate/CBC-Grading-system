import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Loader, MessageSquare, CheckCircle, XCircle, Search } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';
import { getAdminSchoolId, getStoredUser } from '../../../services/tenantContext';

const MessageHistoryPage = () => {
    const { showSuccess, showError } = useNotifications();

    // State
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState({ totalSent: 0, successRate: 0, failed: 0, estimatedCost: 0 });
    const [schoolId, setSchoolId] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        channel: 'all',
        status: 'all',
        search: ''
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 50;

    useEffect(() => {
        let sid = getAdminSchoolId();
        if (!sid) {
            const user = getStoredUser();
            sid = user?.schoolId || user?.school?.id;
        }
        setSchoolId(sid);

        if (sid) {
            fetchLogs(sid);
        }
    }, [page, filters]);

    const fetchLogs = async (sid) => {
        setLoading(true);
        try {
            const response = await api.notifications.getAuditLogs({
                schoolId: sid,
                startDate: filters.startDate,
                endDate: filters.endDate,
                channel: filters.channel === 'all' ? undefined : filters.channel,
                status: filters.status === 'all' ? undefined : filters.status,
                search: filters.search || undefined,
                page,
                limit
            });

            if (response.success) {
                setLogs(response.data.logs || []);
                setSummary(response.data.summary || { totalSent: 0, successRate: 0, failed: 0, estimatedCost: 0 });
                setTotalPages(Math.ceil((response.data.total || 0) / limit));
            }
        } catch (error) {
            console.error('Failed to fetch message history:', error);
            showError('Failed to load message history');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (schoolId) {
            fetchLogs(schoolId);
            showSuccess('Refreshed!');
        }
    };

    const handleExportCSV = () => {
        if (logs.length === 0) {
            showError('No data to export');
            return;
        }

        const headers = ['Date/Time', 'Learner Name', 'Parent Phone', 'Channel', 'Status', 'Sent By', 'Term'];
        const rows = logs.map(log => [
            new Date(log.createdAt).toLocaleString(),
            log.learner?.firstName + ' ' + log.learner?.lastName || 'N/A',
            log.phoneNumber || 'N/A',
            log.channel || 'N/A',
            log.status || 'N/A',
            log.sentBy?.firstName + ' ' + log.sentBy?.lastName || 'System',
            log.term || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `message_history_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        showSuccess('CSV exported successfully!');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-3">
            {/* Compact Header with Inline Filters and Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Title Row */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-600" />
                        <h2 className="text-base font-bold text-gray-800">Message History</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Compact Metrics */}
                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-600">
                                <span className="font-bold text-gray-800">{summary.totalSent}</span> sent
                            </span>
                            <span className="text-green-600">
                                <span className="font-bold">{summary.successRate}%</span> success
                            </span>
                            <span className="text-red-600">
                                <span className="font-bold">{summary.failed}</span> failed
                            </span>
                            <span className="text-purple-600">
                                <span className="font-bold">{summary.estimatedCost}</span> parts
                            </span>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            disabled={logs.length === 0}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                            <Download size={13} />
                            CSV
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="p-1.5 hover:bg-gray-100 rounded"
                        >
                            <RefreshCw size={15} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Inline Filters */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-gray-400 text-xs">to</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <select
                            value={filters.channel}
                            onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
                            className="px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">All Channels</option>
                            <option value="SMS">SMS</option>
                            <option value="WhatsApp">WhatsApp</option>
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="SENT">Sent</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Search name or phone..."
                                className="w-full pl-7 pr-2 py-1 border rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Compact Table */}
                {loading ? (
                    <div className="p-8 text-center">
                        <Loader className="animate-spin mx-auto mb-3 text-blue-600" size={28} />
                        <p className="text-gray-500 text-xs">Loading...</p>
                    </div>
                ) : logs.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Date/Time</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Learner</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Phone</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Channel</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Status</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Sent By</th>
                                        <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase">Term</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="px-3 py-2 text-xs text-gray-700 font-mono">{formatDate(log.createdAt)}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-[9px]">
                                                        {log.learner?.firstName?.charAt(0) || 'L'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">{log.learner?.firstName} {log.learner?.lastName}</p>
                                                        <p className="text-[9px] text-gray-500">{log.learner?.admissionNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-xs font-mono text-gray-700">{log.phoneNumber || 'N/A'}</td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${log.channel === 'SMS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {log.channel || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                {log.status === 'SENT' ? (
                                                    <CheckCircle size={12} className="text-green-600" />
                                                ) : (
                                                    <XCircle size={12} className="text-red-600" />
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-gray-700">{log.sentBy?.firstName} {log.sentBy?.lastName || 'System'}</td>
                                            <td className="px-3 py-2 text-xs text-gray-700">{log.term || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Compact Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 flex items-center justify-between">
                                <div className="text-xs text-gray-600">
                                    Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-2 py-1 bg-white border rounded text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-2 py-1 bg-white border rounded text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-8 text-center">
                        <MessageSquare size={28} className="text-gray-300 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-gray-600">No Messages Found</h3>
                        <p className="text-gray-400 text-xs mt-1">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageHistoryPage;
