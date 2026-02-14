/**
 * Fee Collection Page
 * Record payments and view invoices
 */

import React, { useState, useEffect } from 'react';
import {
  Plus, Eye,
  CheckCircle, AlertCircle, Clock, FileText
} from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';
import SmartLearnerSearch from '../shared/SmartLearnerSearch';

const FeeCollectionPage = ({ learnerId }) => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLearnerId, setSearchLearnerId] = useState(learnerId || null);
  const [statusFilter, setStatusFilter] = useState('all');
  const { showSuccess, showError } = useNotifications();

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: ''
  });

  // Update learner search if prop changes
  useEffect(() => {
    if (learnerId) {
      setSearchLearnerId(learnerId);
    }
  }, [learnerId]);

  const fetchInvoices = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter.toUpperCase() } : {};
      const response = await api.fees.getAllInvoices(params);
      setInvoices(response.data || []);
    } catch (error) {
      showError('Failed to load invoices');
      console.error(error);
      setInvoices([]);
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
      await api.fees.recordPayment({
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
      WAIVED: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Waived' }
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

  const uniqueLearners = React.useMemo(() => {
    const learnersMap = new Map();
    invoices.forEach(inv => {
      if (inv.learner && !learnersMap.has(inv.learner.id)) {
        learnersMap.set(inv.learner.id, inv.learner);
      }
    });
    return Array.from(learnersMap.values());
  }, [invoices]);

  const filteredInvoices = React.useMemo(() => invoices.filter(invoice => {
    if (!searchLearnerId) return true;
    return invoice.learner?.id === searchLearnerId;
  }), [invoices, searchLearnerId]);

  // Create Invoice State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feeStructures, setFeeStructures] = useState([]);
  const [allLearners, setAllLearners] = useState([]);
  const [newInvoice, setNewInvoice] = useState({
    learnerId: '',
    feeStructureId: '',
    term: 'TERM1',
    academicYear: new Date().getFullYear(),
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  // Fetch fee structures when modal opens
  useEffect(() => {
    if (showCreateModal) {
      const loadFeeStructures = async () => {
        try {
          const response = await api.fees.getAllFeeStructures({ status: 'ACTIVE' });
          setFeeStructures(response.data || []);

          // Load Learners
          const learnerResponse = await api.learners.getAll({ status: 'ACTIVE' });
          setAllLearners(Array.isArray(learnerResponse.data) ? learnerResponse.data : []);
        } catch (error) {
          console.error('Failed to load fee structures:', error);
          showError('Failed to load fee structures');
        }
      };
      loadFeeStructures();
    }
  }, [showCreateModal, showError]);

  const handleCreateInvoice = async () => {
    const targetLearnerId = newInvoice.learnerId || searchLearnerId;
    if (!targetLearnerId) {
      showError('Please select a student');
      return;
    }
    if (!newInvoice.feeStructureId || !newInvoice.term || !newInvoice.dueDate) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.fees.createInvoice({
        ...newInvoice,
        learnerId: targetLearnerId
      });
      showSuccess('Invoice created successfully');
      setShowCreateModal(false);
      fetchInvoices();
      // Reset form (keep year and term defaults)
      setNewInvoice(prev => ({
        ...prev,
        learnerId: '',
        feeStructureId: ''
      }));
    } catch (error) {
      showError(error.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showCreateModal && !showPaymentModal) return <LoadingSpinner />;

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ... (existing stats cards) ... */}
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
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <div className="relative">
              <SmartLearnerSearch
                learners={uniqueLearners}
                selectedLearnerId={searchLearnerId}
                onSelect={setSearchLearnerId}
                placeholder="Search invoices by student..."
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      {/* ... (existing table code) ... */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Invoices Found"
          message={searchLearnerId ? "No invoices found for selected learner." : "No invoices have been created yet."}
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create Invoice
            </button>
          }
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

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Create New Invoice</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:bg-blue-700 p-1 rounded-full"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Student *</label>
                {!searchLearnerId ? (
                  <select
                    value={newInvoice.learnerId}
                    onChange={(e) => setNewInvoice({ ...newInvoice, learnerId: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg max-h-48 overflow-y-auto"
                  >
                    <option value="">Select Student</option>
                    {allLearners.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.firstName} {l.lastName} ({l.admissionNumber})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2 bg-gray-50 border rounded-lg text-sm text-gray-700 flex justify-between items-center">
                    <span>
                      Selected: {uniqueLearners.find(l => l.id === searchLearnerId)?.firstName || 'Current Selection'}
                      {uniqueLearners.find(l => l.id === searchLearnerId)?.lastName}
                    </span>
                    <button
                      onClick={() => setSearchLearnerId(null)}
                      className="ml-2 text-blue-600 text-xs hover:underline"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Fee Structure *</label>
                <select
                  value={newInvoice.feeStructureId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, feeStructureId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Fee Structure</option>
                  {feeStructures.map(fs => (
                    <option key={fs.id} value={fs.id}>
                      {fs.name} ({fs.period || fs.term}) - {fs.academicYear}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Term *</label>
                  <select
                    value={newInvoice.term}
                    onChange={(e) => setNewInvoice({ ...newInvoice, term: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="TERM1">Term 1</option>
                    <option value="TERM2">Term 2</option>
                    <option value="TERM3">Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Year *</label>
                  <input
                    type="number"
                    value={newInvoice.academicYear}
                    onChange={(e) => setNewInvoice({ ...newInvoice, academicYear: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Due Date *</label>
                <input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateInvoice}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
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
