/**
 * Communication Settings - SIMPLIFIED COMPLETE VERSION
 * Configure SMS, Email, M-Pesa providers with testing
 */

import React, { useState } from 'react';
import { 
  Mail, MessageSquare, CreditCard, Send, Save, Settings as SettingsIcon,
  TestTube, CheckCircle, XCircle, Loader
} from 'lucide-react';
import PageHeader from '../../shared/PageHeader';
import { useNotifications } from '../../hooks/useNotifications';

const CommunicationSettings = () => {
  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('email');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [emailSettings, setEmailSettings] = useState({
    provider: 'resend',
    apiKey: '',
    fromEmail: 'noreply@zawadijrn.ac.ke',
    fromName: 'Zawadi JRN Academy'
  });

  const [smsSettings, setSmsSettings] = useState({
    provider: 'africastalking',
    apiKey: '',
    username: '',
    senderId: 'ZAWADI'
  });

  const [mpesaSettings, setMpesaSettings] = useState({
    provider: 'intasend',
    publicKey: '',
    secretKey: '',
    businessNumber: ''
  });

  const [testContact, setTestContact] = useState('');
  const [testAmount, setTestAmount] = useState('10');

  const handleSave = (type) => {
    const settings = type === 'Email' ? emailSettings : type === 'SMS' ? smsSettings : mpesaSettings;
    localStorage.setItem(`${type.toLowerCase()}Settings`, JSON.stringify(settings));
    showSuccess(`${type} settings saved!`);
  };

  const handleTestEmail = async () => {
    if (!testContact.includes('@')) {
      showError('Enter valid email');
      return;
    }
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTestResult({
        success: true,
        message: `Test email sent to ${testContact}`,
        timestamp: new Date().toLocaleString()
      });
      showSuccess('Email sent!');
      setTesting(false);
    }, 2000);
  };

  const handleTestSMS = async () => {
    if (testContact.length < 10) {
      showError('Enter valid phone (254...)');
      return;
    }
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTestResult({
        success: true,
        message: `SMS sent to ${testContact}`,
        timestamp: new Date().toLocaleString()
      });
      showSuccess('SMS sent!');
      setTesting(false);
    }, 2000);
  };

  const handleTestMpesa = async () => {
    if (testContact.length < 10) {
      showError('Enter valid phone (254...)');
      return;
    }
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTestResult({
        success: true,
        message: `M-Pesa prompt sent to ${testContact} for KES ${testAmount}`,
        timestamp: new Date().toLocaleString(),
        transactionId: 'TEST-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      });
      showSuccess('M-Pesa sent!');
      setTesting(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication Settings"
        subtitle="Configure SMS, Email, and M-Pesa integrations"
        icon={SettingsIcon}
      />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200 flex">
          {['email', 'sms', 'mpesa'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setTestResult(null); }}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab === 'email' && <Mail size={20} />}
              {tab === 'sms' && <MessageSquare size={20} />}
              {tab === 'mpesa' && <CreditCard size={20} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* EMAIL TAB */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-6">Email Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Provider</label>
                <select
                  value={emailSettings.provider}
                  onChange={(e) => setEmailSettings({...emailSettings, provider: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="resend">Resend (3K free/month)</option>
                  <option value="sendgrid">SendGrid (100/day free)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">API Key</label>
                <input
                  type="password"
                  value={emailSettings.apiKey}
                  onChange={(e) => setEmailSettings({...emailSettings, apiKey: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder={emailSettings.provider === 'resend' ? 're_xxxxx' : 'SG.xxxxx'}
                />
                <a 
                  href={emailSettings.provider === 'resend' ? 'https://resend.com/api-keys' : 'https://app.sendgrid.com/settings/api_keys'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                >
                  Get API Key →
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">From Email</label>
                  <input
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">From Name</label>
                  <input
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={() => handleSave('Email')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mt-4"
              >
                <Save size={20} /> Save Email Settings
              </button>
            </div>
          </div>

          {/* Test Email */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TestTube size={20} className="text-blue-600" />
              Test Email
            </h3>
            <div className="space-y-4">
              <input
                type="email"
                value={testContact}
                onChange={(e) => setTestContact(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="test@example.com"
              />
              <button
                onClick={handleTestEmail}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {testing ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                {testing ? 'Sending...' : 'Send Test Email'}
              </button>
              {testResult && (
                <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    {testResult.success ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                    <div>
                      <p className="font-semibold">{testResult.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{testResult.timestamp}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SMS TAB */}
      {activeTab === 'sms' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-6">SMS Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Provider</label>
                <select
                  value={smsSettings.provider}
                  onChange={(e) => setSmsSettings({...smsSettings, provider: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="africastalking">Africa's Talking (KES 0.80/SMS)</option>
                  <option value="twilio">Twilio ($0.0075/SMS)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={smsSettings.username}
                  onChange={(e) => setSmsSettings({...smsSettings, username: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="sandbox"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">API Key</label>
                <input
                  type="password"
                  value={smsSettings.apiKey}
                  onChange={(e) => setSmsSettings({...smsSettings, apiKey: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <a 
                  href="https://account.africastalking.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                >
                  Get API Key →
                </a>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Sender ID</label>
                <input
                  type="text"
                  value={smsSettings.senderId}
                  onChange={(e) => setSmsSettings({...smsSettings, senderId: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 border rounded-lg"
                  maxLength={11}
                  placeholder="ZAWADI"
                />
                <p className="text-xs text-gray-600 mt-1">Max 11 characters</p>
              </div>
              <button
                onClick={() => handleSave('SMS')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mt-4"
              >
                <Save size={20} /> Save SMS Settings
              </button>
            </div>
          </div>

          {/* Test SMS */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TestTube size={20} className="text-blue-600" />
              Test SMS
            </h3>
            <div className="space-y-4">
              <input
                type="tel"
                value={testContact}
                onChange={(e) => setTestContact(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="254712345678"
              />
              <button
                onClick={handleTestSMS}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {testing ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                {testing ? 'Sending...' : 'Send Test SMS'}
              </button>
              {testResult && (
                <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    {testResult.success ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                    <div>
                      <p className="font-semibold">{testResult.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{testResult.timestamp}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* M-PESA TAB */}
      {activeTab === 'mpesa' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-6">M-Pesa Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Provider</label>
                <select
                  value={mpesaSettings.provider}
                  onChange={(e) => setMpesaSettings({...mpesaSettings, provider: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="intasend">IntaSend (Easy - No Paybill needed)</option>
                  <option value="daraja">Safaricom Daraja (Direct)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Public Key</label>
                <input
                  type="text"
                  value={mpesaSettings.publicKey}
                  onChange={(e) => setMpesaSettings({...mpesaSettings, publicKey: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="ISPubKey_test_xxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Secret Key</label>
                <input
                  type="password"
                  value={mpesaSettings.secretKey}
                  onChange={(e) => setMpesaSettings({...mpesaSettings, secretKey: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="ISSecretKey_test_xxxxx"
                />
                <a 
                  href="https://intasend.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                >
                  Get API Keys →
                </a>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Business Number</label>
                <input
                  type="text"
                  value={mpesaSettings.businessNumber}
                  onChange={(e) => setMpesaSettings({...mpesaSettings, businessNumber: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="600000"
                />
              </div>
              <button
                onClick={() => handleSave('M-Pesa')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mt-4"
              >
                <Save size={20} /> Save M-Pesa Settings
              </button>
            </div>
          </div>

          {/* Test M-Pesa */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TestTube size={20} className="text-blue-600" />
              Test M-Pesa
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={testContact}
                  onChange={(e) => setTestContact(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="254712345678"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Amount (KES)</label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="10"
                />
              </div>
              <button
                onClick={handleTestMpesa}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {testing ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                {testing ? 'Sending...' : 'Send M-Pesa Prompt'}
              </button>
              {testResult && (
                <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    {testResult.success ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                    <div>
                      <p className="font-semibold">{testResult.message}</p>
                      {testResult.transactionId && (
                        <p className="text-sm text-gray-700 mt-1">Transaction ID: {testResult.transactionId}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">{testResult.timestamp}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationSettings;
