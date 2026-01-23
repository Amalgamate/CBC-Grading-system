/**
 * Fee Collection Page
 * Record payments and view invoices
 */

import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Eye,
  FileText, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';

const FeeCollectionPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showSuccess, showError } = useNotifications();

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: ''
  });

  const fetchInvoices = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter.toUpperCase() } : {};
      const response = await api.fees.getAllInvoices(params);
      setInvoices(response.data || []);
    } catch (error) {
      showError('Failed to load invoices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showError]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleRecordPayment = async () => {
    if (!selectedInvoice || !paymentData.amount) {
      showError('Please enter payment amount');
      return;
    }

    try {
      const response = await api.fees.recordPayment({
        invoiceId: selectedInvoice.id,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber || null,
        notes: paymentData.notes || null
      });

      showSuccess('Payment recorded successfully!');
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentData({ amount: '', paymentMethod: 'CASH', referenceNumber: '', notes: '' });
      fetchInvoices();
    } catch (error) {
      showError(error.message || 'Failed to record payment');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      PARTIAL: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Partial' },
      PAID: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      OVERPAID: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Overpaid' },
      WAIVED: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Waived' }
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    const learnerName = `${invoice.learner?.firstName} ${invoice.learner?.lastName}`.toLowerCase();
    const admissionNo = invoice.learner?.admissionNumber?.toLowerCase() || '';
    return learnerName.includes(searchLower) || admissionNo.includes(searchLower) || invoice.invoiceNumber.toLowerCase().includes(searchLower);
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-800">{invoices.length}</p>
            </div>
            <FileText className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter(i => i.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Partial Payments</p>
              <p className="text-2xl font-bold text-blue-600">
                {invoices.filter(i => i.status === 'PARTIAL').length}
              </p>
            </div>
            <AlertCircle className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fully Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(i => i.status === 'PAID').length}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by student name, admission number, or invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Invoices Found"
          message={searchTerm ? "No invoices match your search." : "No invoices have been created yet."}
        />
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {invoice.learner?.firstName} {invoice.learner?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{invoice.learner?.admissionNumber}</p>
                      <p className="text-xs text-gray-500">{invoice.learner?.grade} {invoice.learner?.stream}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{invoice.feeStructure?.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    KES {Number(invoice.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600">
                    KES {Number(invoice.paidAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">
                    KES {Number(invoice.balance).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setPaymentData({ ...paymentData, amount: invoice.balance });
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {invoice.status !== 'PAID' && invoice.status !== 'WAIVED' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPaymentData({ ...paymentData, amount: invoice.balance });
                            setShowPaymentModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Record Payment"
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Record Payment</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Invoice Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Invoice Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Student:</span>
                    <span className="ml-2 font-semibold">
                      {selectedInvoice.learner?.firstName} {selectedInvoice.learner?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Invoice #:</span>
                    <span className="ml-2 font-semibold">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-2 font-semibold">KES {Number(selectedInvoice.totalAmount).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="ml-2 font-semibold text-green-600">KES {Number(selectedInvoice.paidAmount).toLocaleString()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Outstanding Balance:</span>
                    <span className="ml-2 font-bold text-red-600 text-lg">
                      KES {Number(selectedInvoice.balance).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div>
                <label className="block text-sm font-semibold mb-2">Amount to Pay *</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Enter amount"
                  step="0.01"
                  max={selectedInvoice.balance}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Payment Method *</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="CASH">Cash</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARD">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Reference Number {paymentData.paymentMethod === 'MPESA' && '*'}
                </label>
                <input
                  type="text"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder={paymentData.paymentMethod === 'MPESA' ? 'M-Pesa transaction code' : 'Reference number (optional)'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Notes</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRecordPayment}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Record Payment
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentData({ amount: '', paymentMethod: 'CASH', referenceNumber: '', notes: '' });
                  }}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCollectionPage;
