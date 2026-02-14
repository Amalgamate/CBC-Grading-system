/**
 * Messages Page
 * Comprehensive Communication Module with Smart Broadcast Capabilities
 * - Selective recipient selection with checkboxes
 * - Test message before bulk sending
 * - Message templating with variable substitution
 * - Real-time delivery tracking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Reply, X, Users, Send, CheckCircle, AlertCircle, Loader2, RefreshCw, MessageSquare, Phone } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';
import { formatPhoneNumber, isValidPhoneNumber, getDisplayPhoneNumber } from '../../../utils/phoneFormatter';

const MessagesPage = () => {
  // Debug logging
  React.useEffect(() => {
    console.log('✅ MessagesPage component mounted');
    console.log('📝 Test message feature loaded and ready');
  }, []);

  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'broadcast'

  // Inbox State
  const [showCompose, setShowCompose] = useState(false);
  const [inboxMessages, setInboxMessages] = useState([]);

  // Broadcast State
  const [activeGrades, setActiveGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [allRecipients, setAllRecipients] = useState([]);  // All parents for the grade
  const [recipients, setRecipients] = useState([]);        // Selected parents
  const [selectedRecipientIds, setSelectedRecipientIds] = useState(new Set());
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [deliveryReport, setDeliveryReport] = useState([]);
  
  // Test Parent State
  const [showTestMode, setShowTestMode] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  // Message Template State
  const [messageTemplate, setMessageTemplate] = useState('');
  const [templateVariables, setTemplateVariables] = useState({}); // {parentName: 'John', etc}
  
  // Preview State
  const [showPreview, setShowPreview] = useState(false);

  // Fetch recipients when grade changes
  const fetchRecipients = useCallback(async () => {
    if (!selectedGrade) {
      setAllRecipients([]);
      setRecipients([]);
      setSelectedRecipientIds(new Set());
      return;
    }

    setLoadingRecipients(true);
    try {
      const response = await api.communication.getRecipients(selectedGrade);

      if (response.success && Array.isArray(response.data)) {
        // Ensure phone numbers are formatted
        const formattedRecipients = response.data.map(r => ({
          ...r,
          phone: formatPhoneNumber(r.phone || ''),
          displayPhone: getDisplayPhoneNumber(r.phone || ''),
          id: r.id || `${r.name}-${r.phone}` // Fallback ID
        })).filter(r => r.phone); // Only keep recipients with valid phone numbers

        setAllRecipients(formattedRecipients);
        setRecipients(formattedRecipients);
        // Select all by default
        const allIds = new Set(formattedRecipients.map(r => r.id));
        setSelectedRecipientIds(allIds);
      } else {
        setAllRecipients([]);
        setRecipients([]);
        setSelectedRecipientIds(new Set());
      }

    } catch (err) {
      console.error('Failed to fetch recipients', err);
      showError('Failed to load recipients. Please try again.');
      setAllRecipients([]);
      setRecipients([]);
      setSelectedRecipientIds(new Set());
    } finally {
      setLoadingRecipients(false);
    }
  }, [selectedGrade, showError]);

  // Fetch active grades on mount
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await api.learners.getAll({ limit: 5000 });
        if (response.success && Array.isArray(response.data)) {
          const learners = response.data;
          // Extract unique grades
          const grades = [...new Set(learners.map(l => l.grade))].filter(Boolean);

          // Sort grades logically
          const gradeOrder = [
            'CRECHE', 'RECEPTION', 'TRANSITION', 'PLAYGROUP', 'PP1', 'PP2',
            'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6',
            'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'
          ];

          const sortedGrades = grades.sort((a, b) => {
            const indexA = gradeOrder.indexOf(a.toUpperCase());
            const indexB = gradeOrder.indexOf(b.toUpperCase());
            // If both found in order list
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only one found, prioritize known ones
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            // Fallback for unknown
            return a.localeCompare(b);
          });

          setActiveGrades(sortedGrades);
        }
      } catch (err) {
        console.error('Failed to fetch grades', err);
      }
    };

    fetchGrades();
  }, []);

  // Fetch recipients when grade changes
  useEffect(() => {
    fetchRecipients();
  }, [selectedGrade, fetchRecipients]);

  // Toggle recipient selection
  const toggleRecipient = (recipientId) => {
    const newSelected = new Set(selectedRecipientIds);
    if (newSelected.has(recipientId)) {
      newSelected.delete(recipientId);
    } else {
      newSelected.add(recipientId);
    }
    setSelectedRecipientIds(newSelected);
    
    // Update recipients array with selected items
    const selected = allRecipients.filter(r => newSelected.has(r.id));
    setRecipients(selected);
  };

  // Select/Deselect all
  const toggleSelectAll = () => {
    if (selectedRecipientIds.size === allRecipients.length) {
      setSelectedRecipientIds(new Set());
      setRecipients([]);
    } else {
      const allIds = new Set(allRecipients.map(r => r.id));
      setSelectedRecipientIds(allIds);
      setRecipients(allRecipients);
    }
  };

  // Process message template variables
  const processMessageTemplate = (template, variables = {}) => {
    let message = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      message = message.replace(regex, variables[key] || `{${key}}`);
    });
    return message;
  };

  // Send test message to test parent
  const handleSendTestMessage = async () => {
    console.log('🧪 Test message initiated');
    console.log('Phone:', testPhoneNumber);
    console.log('Message:', messageTemplate);

    if (!testPhoneNumber) {
      showError('Phone number is required');
      return;
    }

    if (!isValidPhoneNumber(testPhoneNumber)) {
      showError('Invalid phone format. Use format like 0712345678 or +254712345678');
      return;
    }

    if (!messageTemplate.trim()) {
      showError('Message cannot be empty');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const formattedPhone = formatPhoneNumber(testPhoneNumber);
      
      // Get school ID from multiple sources
      let schoolId = localStorage.getItem('currentSchoolId');
      if (!schoolId) {
        schoolId = sessionStorage.getItem('currentSchoolId');
      }
      
      console.log('📞 Formatted phone:', formattedPhone);
      console.log('🏫 School ID:', schoolId);

      if (!schoolId) {
        showError('School ID not found. Please refresh the page and try again.');
        setTestResult({
          success: false,
          message: 'School context missing. Please refresh and try again.',
          timestamp: new Date().toLocaleString()
        });
        setIsSendingTest(false);
        return;
      }

      const messageToSend = processMessageTemplate(messageTemplate, templateVariables);
      console.log('📝 Message to send:', messageToSend);

      console.log('🚀 Calling API...');
      const response = await api.communication.sendTestSMS({
        phoneNumber: formattedPhone,
        message: messageToSend,
        schoolId
      });

      console.log('✅ API Response:', response);

      if (response && response.message) {
        setTestResult({
          success: true,
          message: `✓ Test message sent to ${getDisplayPhoneNumber(testPhoneNumber)}. Message ID: ${response.messageId || 'N/A'}`,
          timestamp: new Date().toLocaleString()
        });
        showSuccess(`Test SMS sent to ${getDisplayPhoneNumber(testPhoneNumber)}`);
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.error('❌ Test message error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.error || error.message || 'Failed to send test message';
      
      setTestResult({
        success: false,
        message: `✗ Failed: ${errorMessage}`,
        timestamp: new Date().toLocaleString()
      });
      showError(`SMS Error: ${errorMessage}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Handle broadcast to selected recipients
  const handleSendBroadcast = async () => {
    if (!messageTemplate.trim()) {
      showError('Please enter a message');
      return;
    }
    if (recipients.length === 0) {
      showError('Please select at least one recipient');
      return;
    }

    const confirmed = window.confirm(
      `Send broadcast to ${recipients.length} recipient(s)?\n\nMessage preview:\n"${messageTemplate.substring(0, 50)}..."`
    );
    if (!confirmed) return;

    setSending(true);
    setProgress({ current: 0, total: recipients.length, success: 0, failed: 0 });
    setDeliveryReport([]);

    const schoolId = localStorage.getItem('currentSchoolId');
    const report = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      let status = 'Pending';
      let error = null;

      try {
        const messageToSend = processMessageTemplate(messageTemplate, {
          parentName: recipient.name,
          studentName: recipient.studentName,
          grade: recipient.grade,
          schoolName: localStorage.getItem('schoolName') || 'School'
        });

        await api.communication.sendTestSMS({
          phoneNumber: recipient.phone,
          message: messageToSend,
          schoolId
        });

        status = 'Sent';
        setProgress(prev => ({ ...prev, current: i + 1, success: prev.success + 1 }));
      } catch (err) {
        console.error(`Failed to send to ${recipient.name}:`, err);
        status = 'Failed';
        error = err.message;
        setProgress(prev => ({ ...prev, current: i + 1, failed: prev.failed + 1 }));
      }

      report.push({ ...recipient, status, error });
      setDeliveryReport([...report]);

      // Small delay to prevent rate limiting
      await new Promise(r => setTimeout(r, 200));
    }

    setSending(false);
    showSuccess(`Broadcast complete. Sent: ${progress.success}, Failed: ${progress.failed}`);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Tabs */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'inbox' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Inbox
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'broadcast' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Broadcast
          </button>
        </div>
        {activeTab === 'inbox' && (
          <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={20} /> Compose
          </button>
        )}
      </div>

      {/* Inbox View */}
      {activeTab === 'inbox' && (
        <div className="bg-white rounded-xl shadow-md divide-y overflow-auto flex-1">
          {inboxMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No messages in inbox.</div>
          ) : (
            inboxMessages.map(msg => (
              <div key={msg.id} className={`p-6 hover:bg-gray-50 cursor-pointer ${!msg.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800">{msg.subject}</h3>
                      {!msg.read && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                    </div>
                    <p className="text-sm text-gray-600">From: {msg.sender} ({msg.senderRole})</p>
                    <p className="text-gray-600 mt-2">{msg.preview}</p>
                    <p className="text-xs text-gray-500 mt-2">{msg.date}</p>
                  </div>
                  <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Reply size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Broadcast View */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
          {/* Left Col: Composition */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 overflow-auto">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Send size={20} className="text-purple-600" /> New Broadcast
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-gray-50"
                disabled={sending}
              >
                <option value="">Select Grade Level...</option>
                <option value="All Grades">All Grades (Entire School)</option>
                {activeGrades.map(g => (
                  <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Recipient Summary */}
            <div className={`p-4 rounded-lg border ${recipients.length > 0 ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
              {loadingRecipients ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 size={16} className="animate-spin" /> Fetching recipients...
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Recipients Found:</span>
                  <span className="text-lg font-bold text-purple-700">{recipients.length}</span>
                </div>
              )}
              {selectedGrade && !loadingRecipients && recipients.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No parents found with phone numbers for this group.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message Template</label>
              <p className="text-xs text-gray-500 mb-2">Available variables: {'{parentName}'}, {'{studentName}'}, {'{grade}'}, {'{schoolName}'}</p>
              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows="6"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                placeholder="Type your message here... Use {parentName}, {studentName}, etc. for dynamic content"
                disabled={sending}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {messageTemplate.length} characters
              </div>
            </div>

            {/* Test Parent Section */}
            <div className={`p-4 border rounded-lg ${showTestMode ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => setShowTestMode(!showTestMode)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-white rounded transition"
              >
                <span className="flex items-center gap-2">
                  <Phone size={16} /> Test Message First
                </span>
                {showTestMode ? '−' : '+'}
              </button>

              {showTestMode && (
                <div className="mt-3 space-y-3 pt-3 border-t border-blue-200">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Test Parent Phone</label>
                    <input
                      type="tel"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      placeholder="e.g., 0712345678"
                      className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                      disabled={isSendingTest}
                    />
                  </div>

                  <button
                    onClick={(e) => {
                      console.log('🔵 Send Test button clicked!');
                      console.log('testPhoneNumber:', testPhoneNumber);
                      console.log('messageTemplate:', messageTemplate);
                      console.log('Button disabled:', isSendingTest || !testPhoneNumber);
                      handleSendTestMessage();
                    }}
                    disabled={isSendingTest || !testPhoneNumber}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {isSendingTest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {isSendingTest ? 'Sending...' : 'Send Test'}
                  </button>

                  {testResult && (
                    <div className={`p-3 rounded text-xs ${testResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      <p className="font-semibold mb-1">{testResult.success ? '✓ Success' : '✗ Failed'}</p>
                      <p>{testResult.message}</p>
                      <p className="text-xs opacity-75 mt-1">{testResult.timestamp}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-auto">
              {sending ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Sending...</span>
                    <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    {progress.current} of {progress.total} processed
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleSendBroadcast}
                  disabled={recipients.length === 0 || !messageTemplate.trim()}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Send size={18} /> Send to {recipients.length} {recipients.length === 1 ? 'Recipient' : 'Recipients'}
                </button>
              )}
            </div>
          </div>

          {/* Right Col: Reports / Preview */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Users size={18} /> Recipient List & Status
              </h3>
              <button onClick={fetchRecipients} disabled={sending} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <RefreshCw size={14} /> Refresh List
              </button>
            </div>

            <div className="flex-1 overflow-auto p-0">
              {allRecipients.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p>Select a grade to load recipients</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        <input
                          type="checkbox"
                          checked={selectedRecipientIds.size === allRecipients.length && allRecipients.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 cursor-pointer"
                          title="Select all recipients"
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">Parent / Guardian</th>
                      <th className="px-4 py-3 font-semibold">Phone</th>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(deliveryReport.length > 0 ? deliveryReport : allRecipients).map((r) => {
                      const isSelected = selectedRecipientIds.has(r.id);
                      const status = deliveryReport.find(d => d.id === r.id)?.status;
                      
                      return (
                        <tr key={r.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-purple-50' : ''}`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRecipient(r.id)}
                              disabled={sending}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.displayPhone || r.phone}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{r.studentName} <span className="text-gray-400">({r.grade})</span></td>
                          <td className="px-4 py-3 text-center">
                            {status === 'Sent' && <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium"><CheckCircle size={12} /> Sent</span>}
                            {status === 'Failed' && <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium"><AlertCircle size={12} /> Failed</span>}
                            {!status && <span className="text-gray-300 text-xs">−</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {deliveryReport.length > 0 && (
              <div className="p-4 bg-gray-50 border-t flex gap-4 text-xs font-medium">
                <span className="text-green-600">Successful: {progress.success}</span>
                <span className="text-red-600">Failed: {progress.failed}</span>
                <span className="text-gray-600">Total: {progress.total}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal (Inbox Only) */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Compose Message</h3>
              <button onClick={() => setShowCompose(false)} className="text-white"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Recipient</label>
                <select className="w-full px-4 py-2 border rounded-lg">
                  <option>Select recipient</option>
                  <option>Hassan Mohamed (Parent)</option>
                  <option>Mary Wanjiru (Parent)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Subject</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Enter subject" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea rows="6" className="w-full px-4 py-2 border rounded-lg" placeholder="Type your message..." />
              </div>
              <button onClick={() => { showSuccess('Message sent!'); setShowCompose(false); }} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
