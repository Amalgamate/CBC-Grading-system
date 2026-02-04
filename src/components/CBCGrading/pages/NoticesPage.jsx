import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Eye, Cake, Bell, Megaphone, RefreshCw, Send, Save, CheckCircle, Loader, User, Smartphone, Check, XCircle, MessageCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import api, { communicationAPI } from '../../../services/api';
import { getAdminSchoolId, getStoredUser } from '../../../services/tenantContext';

const cakeEmoji = String.fromCodePoint(0x1F382);
const balloonEmoji = String.fromCodePoint(0x1F388);
const confettiEmoji = String.fromCodePoint(0x1F38A);
const sparkleEmoji = String.fromCodePoint(0x2728);
const defaultBirthdayTemplate = `*Happy Birthday {firstName}!* ${cakeEmoji}${balloonEmoji}\n\n{schoolName} is thrilled to celebrate you on your *{ageOrdinal} birthday* today, {birthdayDate}! ${confettiEmoji} \n\nWe are so proud of your progress in *{grade}*. May your day be filled with joy, laughter, and wonderful memories. Keep shining bright! ${sparkleEmoji}\n\nBest wishes,\n*The {schoolName} Family*`;

const NoticesPage = () => {
  const { showSuccess, showError } = useNotifications();

  // Get initial tab from localStorage or URL, default to 'notices'
  const getInitialTab = () => {
    // First check URL params
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    if (urlTab && ['notices', 'birthdays'].includes(urlTab)) {
      return urlTab;
    }
    // Then check localStorage
    const savedTab = localStorage.getItem('noticesPage_activeTab');
    if (savedTab && ['notices', 'birthdays'].includes(savedTab)) {
      return savedTab;
    }
    return 'notices';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [showModal, setShowModal] = useState(false);
  const [loadingBirthdays, setLoadingBirthdays] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [notices, setNotices] = useState([
    { id: 1, title: 'Term 1 Examination Schedule', content: 'Exams will begin on March 10, 2026...', author: 'Sarah Muthoni', date: '2026-01-10', category: 'Academic', priority: 'High', status: 'Published' },
    { id: 2, title: 'Parent-Teacher Meeting', content: 'All parents are invited...', author: 'John Kamau', date: '2026-01-15', category: 'Event', priority: 'Medium', status: 'Published' }
  ]);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'Academic', priority: 'Medium' });

  // Birthday features states
  const [schoolId, setSchoolId] = useState(null);
  const [birthdaySettings, setBirthdaySettings] = useState({
    enabled: false,
    template: defaultBirthdayTemplate
  });
  const [selectedLearners, setSelectedLearners] = useState([]);
  const [isBulkSendingWhatsApp, setIsBulkSendingWhatsApp] = useState(false);
  const [sendingWhatsAppWishes, setSendingWhatsAppWishes] = useState({}); // { id: true/false }
  const [editingPhone, setEditingPhone] = useState(null); // { id, phone }
  const [sendingWishes, setSendingWishes] = useState({}); // { id: true/false }
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [birthdaysToday, setBirthdaysToday] = useState([]);

  // Update localStorage and URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('noticesPage_activeTab', tab);
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  };

  const formatTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(/[_\s]+/).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  };

  // Refresh function that maintains current tab
  const handleRefresh = () => {
    if (activeTab === 'birthdays') {
      fetchBirthdays();
    }
    showSuccess('Page refreshed!');
  };

  useEffect(() => {
    // Determine School ID
    let sid = getAdminSchoolId();
    if (!sid) {
      const user = getStoredUser();
      sid = user?.schoolId || user?.school?.id;
    }
    setSchoolId(sid);

    if (sid) {
      loadBirthdayConfig(sid);
    }

    if (activeTab === 'birthdays') {
      fetchBirthdays();
      if (sid) fetchBirthdaysToday(sid);
    }
  }, [activeTab]);

  const loadBirthdayConfig = async (sid) => {
    try {
      const response = await communicationAPI.getConfig(sid);
      const data = response.data;
      if (data && data.birthdays) {
        setBirthdaySettings({
          enabled: data.birthdays.enabled,
          template: data.birthdays.template || defaultBirthdayTemplate
        });
      }
    } catch (error) {
      console.error('Error loading birthday config:', error);
    }
  };

  const fetchBirthdaysToday = async (sid) => {
    try {
      const response = await communicationAPI.getBirthdaysToday(sid);
      setBirthdaysToday(response.data || []);
    } catch (error) {
      console.error('Error fetching birthdays today:', error);
    }
  };

  const fetchBirthdays = async () => {
    setLoadingBirthdays(true);
    try {
      const resp = await api.learners.getBirthdays();
      if (resp.success) {
        setBirthdays(resp.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch birthdays:', error);
    } finally {
      setLoadingBirthdays(false);
    }
  };

  const handleSaveBirthdaySettings = async () => {
    if (!schoolId) return;
    setSavingSettings(true);
    try {
      await communicationAPI.saveConfig({
        schoolId,
        birthdays: {
          enabled: birthdaySettings.enabled,
          template: birthdaySettings.template
        }
      });
      showSuccess('Birthday settings saved!');
    } catch (error) {
      console.error('Error saving birthday settings:', error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendWish = async (learnerId, isBulk = false) => {
    if (!schoolId) return;

    try {
      if (isBulk) {
        setIsBulkSending(true);
      } else {
        setSendingWishes(prev => ({ ...prev, [learnerId]: true }));
      }

      const learnerIds = isBulk ? (selectedLearners.length > 0 ? selectedLearners : birthdaysToday.map(b => b.id)) : [learnerId];

      const response = await communicationAPI.sendBirthdayWishes({
        schoolId,
        learnerIds,
        template: birthdaySettings.template,
        channel: 'sms'
      });

      showSuccess(response.message || 'Birthday wishes sent!');
      if (isBulk) setSelectedLearners([]);
    } catch (error) {
      console.error('Send Birthday Wish Error:', error);
      showSuccess('Wishes process completed');
    } finally {
      if (isBulk) {
        setIsBulkSending(false);
      } else {
        setSendingWishes(prev => ({ ...prev, [learnerId]: false }));
      }
    }
  };

  const handleSendWhatsApp = async (learner, isBulk = false) => {
    if (!schoolId) return;

    if (isBulk) {
      // Server-side bulk WhatsApp
      try {
        setIsBulkSendingWhatsApp(true);
        const learnerIds = selectedLearners.length > 0 ? selectedLearners : birthdaysToday.map(b => b.id);

        const response = await communicationAPI.sendBirthdayWishes({
          schoolId,
          learnerIds,
          template: birthdaySettings.template,
          channel: 'whatsapp'
        });

        showSuccess(response.message || 'WhatsApp birthday wishes sent!');
        setSelectedLearners([]);
      } catch (error) {
        console.error('Bulk WhatsApp Error:', error);
        showSuccess('WhatsApp process completed');
      } finally {
        setIsBulkSendingWhatsApp(false);
      }
    } else {
      // Client-side single WhatsApp (Better for individual interaction)
      const phone = learner.guardianPhone;
      if (!phone) {
        showError(`Phone number missing for ${learner.name}`);
        return;
      }

      setSendingWhatsAppWishes(prev => ({ ...prev, [learner.id]: true }));

      try {
        const user = getStoredUser();
        const schoolName = user?.school?.name || 'our school';

        const birthday = new Date(learner.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const m = today.getMonth() - birthday.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
          age--;
        }

        const gradeName = formatTitleCase(learner.grade || '');
        const firstName = formatTitleCase(learner.name.split(' ')[0]);
        const lastName = formatTitleCase(learner.name.split(' ').slice(1).join(' '));
        const fullName = `${firstName} ${lastName}`;

        const message = birthdaySettings.template
          .replace(/{learnerName}/g, fullName)
          .replace(/{firstName}/g, firstName)
          .replace(/{lastName}/g, lastName)
          .replace(/{schoolName}/g, schoolName)
          .replace(/{grade}/g, gradeName)
          .replace(/{age}/g, age)
          .replace(/{ageOrdinal}/g, getOrdinal(age))
          .replace(/{birthdayDate}/g, formatDate(learner.dateOfBirth));

        // Format for WhatsApp: International format, no '+' or leading '0'
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '254' + formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
          // Add 254 if it's 9 digits starting with 7 or 1
          if (formattedPhone.length === 9) {
            formattedPhone = '254' + formattedPhone;
          }
        }

        const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        showSuccess('Opening WhatsApp...');
      } finally {
        // Delay clearing the loader to show it actually happened
        setTimeout(() => {
          setSendingWhatsAppWishes(prev => ({ ...prev, [learner.id]: false }));
        }, 1000);
      }
    }
  };

  const handleUpdatePhone = async (learnerId, newPhone) => {
    try {
      // Optimistic update
      setBirthdays(prev => prev.map(b => b.id === learnerId ? { ...b, guardianPhone: newPhone } : b));
      setBirthdaysToday(prev => prev.map(b => b.id === learnerId ? { ...b, guardianPhone: newPhone } : b));

      // Call API to update learner phone - using learnerAPI if available
      await api.learners.update(learnerId, { guardianPhone: newPhone });
      showSuccess('Phone number updated!');
      setEditingPhone(null);
    } catch (error) {
      console.error('Error updating phone:', error);
      fetchBirthdays(); // Rollback
    }
  };

  const toggleSelectLearner = (id) => {
    setSelectedLearners(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllBirthdays = () => {
    if (selectedLearners.length === birthdays.length && birthdays.length > 0) {
      setSelectedLearners([]);
    } else {
      setSelectedLearners(birthdays.map(b => b.id));
    }
  };

  const handleSave = () => {
    setNotices(prev => [...prev, { ...formData, id: prev.length + 1, author: 'Current User', date: new Date().toISOString().split('T')[0], status: 'Published' }]);
    showSuccess('Notice published successfully!');
    setShowModal(false);
    setFormData({ title: '', content: '', category: 'Academic', priority: 'Medium' });
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector with Refresh Button */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 justify-between items-center">
        <div className="flex">
          <button
            onClick={() => handleTabChange('notices')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'notices' ? 'border-brand-teal text-brand-teal' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Megaphone size={16} />
            <span>School Notices</span>
          </button>
          <button
            onClick={() => handleTabChange('birthdays')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'birthdays' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Cake size={16} />
            <span>This Week's Birthdays</span>
            {birthdays.length > 0 && <span className="bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full text-[10px]">{birthdays.length}</span>}
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className="text-gray-600" />
        </button>
      </div>

      {activeTab === 'notices' ? (
        <div className="space-y-6">
          <div className="flex justify-end mb-4 pt-2">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 shadow-md font-bold">
              <Plus size={20} />
              <span>Create Notice</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {notices.map(notice => (
              <div key={notice.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-brand-teal hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{notice.title}</h3>
                      <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${notice.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-brand-teal/10 text-brand-teal'}`}>{notice.priority}</span>
                      <span className="px-2 py-1 text-[10px] font-black uppercase bg-gray-100 text-gray-800 rounded">{notice.category}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{notice.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-medium">By {notice.author}</span>
                      <span>•</span>
                      <span>{notice.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-brand-teal hover:bg-brand-teal/10 rounded-lg"><Eye size={18} /></button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Edit size={18} /></button>
                    <button onClick={() => { setNotices(prev => prev.filter(n => n.id !== notice.id)); showSuccess('Notice deleted'); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-b-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-purple/10 rounded-2xl">
                <Cake size={32} className="text-brand-purple" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">Birthday Celebrations</h2>
                <p className="text-gray-500 text-sm">Upcoming birthdays for current week (within next 7 days)</p>
              </div>
            </div>

            {/* Automation Settings */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-3 w-full md:w-auto">
              <div className="flex items-center justify-between gap-8">
                <span className="text-sm font-bold text-gray-700">Automation</span>
                <button
                  onClick={() => setBirthdaySettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${birthdaySettings.enabled ? 'bg-brand-teal' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${birthdaySettings.enabled ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
              <button
                onClick={() => setEditingPhone({ type: 'settings' })}
                className="text-xs text-brand-teal hover:underline flex items-center gap-1 font-bold"
              >
                <Edit size={12} /> Edit Template
              </button>
            </div>
          </div>

          {/* Birthdays Today Quick Actions */}
          {birthdaysToday.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-brand-purple/5 to-brand-teal/5 rounded-xl border border-brand-purple/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-purple text-white rounded-full">
                  <Cake size={18} />
                </div>
                <div>
                  <p className="font-bold text-brand-purple">{birthdaysToday.length} Celebrations Today!</p>
                  <p className="text-xs text-brand-purple/70">Send wishes to all parents with one click.</p>
                </div>
              </div>
              <button
                onClick={() => handleSendWish(null, true)}
                disabled={isBulkSending}
                className="flex items-center gap-2 px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition font-bold shadow-md disabled:opacity-50"
              >
                {isBulkSending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                Send Wishes to All
              </button>
            </div>
          )}

          {loadingBirthdays ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading upcoming celebrations...</p>
            </div>
          ) : birthdays.length > 0 ? (
            <div className="space-y-4">
              {/* Bulk Action Bar */}
              {(selectedLearners.length > 0 || birthdaysToday.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 mb-4 bg-brand-teal/5 p-3 rounded-lg border border-brand-teal/10 animate-in slide-in-from-top duration-300">
                  <div className="flex-1 flex items-center gap-2">
                    <CheckCircle className="text-brand-teal" size={18} />
                    <span className="text-sm font-bold text-brand-teal">
                      {selectedLearners.length > 0 ? `${selectedLearners.length} students selected` : `All students of today (${birthdaysToday.length})`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendWish(null, true)}
                      disabled={isBulkSending || isBulkSendingWhatsApp}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition font-bold text-sm disabled:opacity-50"
                    >
                      {isBulkSending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                      <span>Send SMS</span>
                    </button>
                    {/* Bulk WhatsApp hidden until backend implementation is finalized */}
                    {/* <div className="flex flex-col items-center">
                      <button
                        onClick={() => handleSendWhatsApp(null, true)}
                        disabled={isBulkSending || isBulkSendingWhatsApp}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all active:scale-95 font-bold text-sm shadow-md disabled:opacity-50"
                      >
                        {isBulkSendingWhatsApp ? <Loader size={16} className="animate-spin" /> : <MessageCircle size={16} className="animate-pulse" />}
                        <span>Send WhatsApp</span>
                      </button>
                      <span className="text-[9px] text-green-700 font-bold mt-1 uppercase tracking-wider opacity-60">Bulk API Channel</span>
                    </div> */}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedLearners.length === birthdays.length && birthdays.length > 0}
                            onChange={selectAllBirthdays}
                            className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade/Stream</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Guardian Phone</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {birthdays.map((b) => (
                        <tr
                          key={b.id}
                          className={`hover:bg-gray-50 transition ${b.isToday ? 'bg-brand-purple/5' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedLearners.includes(b.id)}
                              onChange={() => toggleSelectLearner(b.id)}
                              className="rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple font-bold text-xs">
                                {b.name?.charAt(0) || 'L'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{b.name}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{b.admissionNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-bold text-gray-700">{b.grade?.replace('GRADE_', 'Grade ') || 'N/A'}</p>
                            <p className="text-[10px] text-gray-500">Stream {b.stream || 'N/A'}</p>
                          </td>
                          <td className="px-4 py-3">
                            {b.isToday ? (
                              <div className="flex flex-col">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-600 text-white w-fit">
                                  Today! 🎉
                                </span>
                                <span className="text-[10px] text-pink-700 font-bold mt-1">Turning {b.turningAge}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-600 w-fit">
                                  In {b.daysUntil} day{b.daysUntil !== 1 ? 's' : ''}
                                </span>
                                <span className="text-[10px] text-gray-500 mt-1">{new Date(b.dateOfBirth).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative group min-w-[130px]">
                              <Smartphone className={`absolute left-2 top-1/2 -translate-y-1/2 transition-colors ${b.guardianPhone ? 'text-gray-300 group-focus-within:text-blue-500' : 'text-red-300'}`} size={14} />
                              <input
                                type="tel"
                                key={`${b.id}-${b.guardianPhone}`}
                                defaultValue={b.guardianPhone || ''}
                                onBlur={(e) => {
                                  if (e.target.value !== (b.guardianPhone || '')) {
                                    handleUpdatePhone(b.id, e.target.value);
                                  }
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                placeholder="Add contact..."
                                className={`w-full pl-8 pr-2 py-1.5 text-xs font-mono font-bold bg-transparent border-2 border-transparent hover:border-brand-teal/20 focus:border-brand-teal focus:bg-white focus:ring-4 focus:ring-brand-teal/5 rounded-lg transition-all outline-none ${!b.guardianPhone ? 'placeholder-red-300' : 'text-gray-700'}`}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleSendWhatsApp(b)}
                                disabled={sendingWhatsAppWishes[b.id]}
                                title={b.guardianPhone ? "Send WhatsApp" : "Phone number missing"}
                                className={`p-2 rounded-lg transition-all active:scale-90 ${b.guardianPhone ? 'text-green-600 hover:bg-green-100 hover:scale-110 shadow-sm border border-green-50' : 'text-gray-300 hover:bg-red-50 hover:text-red-400'}`}
                              >
                                {sendingWhatsAppWishes[b.id] ? <Loader size={14} className="animate-spin" /> : <MessageCircle size={16} />}
                              </button>
                              <button
                                onClick={() => handleSendWish(b.id)}
                                disabled={sendingWishes[b.id] || !b.guardianPhone}
                                title="Send SMS"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                              >
                                {sendingWishes[b.id] ? <Loader size={14} className="animate-spin" /> : <Send size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Cake size={14} className="text-pink-600" />
                    <span className="font-semibold text-gray-700">Total: {birthdays.length} this week</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-brand-purple"></div> Today: {birthdays.filter(b => b.isToday).length}</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300"></div> Upcoming: {birthdays.filter(b => !b.isToday).length}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Bell size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-600">No Birthdays This Week</h3>
              <p className="text-gray-400 max-w-sm mx-auto mt-2">There are no student birthdays scheduled for the next 7 days. Check back next week!</p>
            </div>
          )}
        </div>
      )}

      {/* Birthday Settings Modal */}
      {editingPhone?.type === 'settings' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-pink-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Cake size={20} />
                Birthday Settings
              </h3>
              <button onClick={() => setEditingPhone(null)}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-bold text-gray-800">Automated Wishes</p>
                  <p className="text-xs text-gray-500 italic">Send SMS/WhatsApp automatically on birthdays</p>
                </div>
                <button
                  onClick={() => setBirthdaySettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${birthdaySettings.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${birthdaySettings.enabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="block text-sm font-bold text-gray-700">Message Template</label>
                  <button
                    onClick={() => setBirthdaySettings(prev => ({ ...prev, template: defaultBirthdayTemplate }))}
                    className="text-[10px] text-pink-600 font-bold hover:underline py-1"
                  >
                    Reset to Recommended
                  </button>
                </div>
                <textarea
                  value={birthdaySettings.template}
                  onChange={(e) => setBirthdaySettings({ ...birthdaySettings, template: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 min-h-[120px]"
                  placeholder="Enter message template..."
                />
                <div className="flex flex-wrap gap-2 mt-3 text-[10px]">
                  <span className="text-gray-500 font-bold uppercase py-1">Placeholders:</span>
                  {['{learnerName}', '{firstName}', '{lastName}', '{schoolName}', '{grade}', '{age}', '{ageOrdinal}', '{birthdayDate}'].map(p => (
                    <button
                      key={p}
                      onClick={() => setBirthdaySettings(prev => ({ ...prev, template: prev.template + (prev.template.endsWith(' ') || prev.template === '' ? '' : ' ') + p }))}
                      className="px-2 py-1 bg-brand-purple/5 text-brand-purple border border-brand-purple/10 rounded hover:bg-brand-purple/10 transition font-mono"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Section */}
              <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                <p className="text-[10px] uppercase font-bold text-pink-700 mb-2">Live Preview (John Doe)</p>
                <div className="bg-white p-3 rounded-lg border border-pink-100 text-sm text-gray-700 relative shadow-sm">
                  {birthdaySettings.template
                    .replace(/{learnerName}/g, 'John Doe')
                    .replace(/{firstName}/g, 'John')
                    .replace(/{lastName}/g, 'Doe')
                    .replace(/{schoolName}/g, getStoredUser()?.school?.name || 'Our School')
                    .replace(/{grade}/g, 'Grade 1')
                    .replace(/{age}/g, '7')
                    .replace(/{ageOrdinal}/g, '7th')
                    .replace(/{birthdayDate}/g, 'February 10th')
                  }
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingPhone(null)}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { handleSaveBirthdaySettings(); setEditingPhone(null); }}
                disabled={savingSettings}
                className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingSettings ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notices Modal - outside the tab logic */}
      {
        showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Create New Notice</h3>
                <button onClick={() => setShowModal(false)} className="text-white"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Content</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows="6" className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                      {['Academic', 'Event', 'Administrative', 'Sports', 'General'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Priority</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                      {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleSave} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-md">Publish Notice</button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default NoticesPage;
