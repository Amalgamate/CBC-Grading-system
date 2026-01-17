/**
 * Formative Assessment Page  
 * Record formative assessments using CBC rubrics
 */

import React, { useState } from 'react';
import { ClipboardList, Save } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useNotifications } from '../hooks/useNotifications';

const FormativeAssessment = ({ learners }) => {
  const { showSuccess } = useNotifications();
  const [selectedGrade, setSelectedGrade] = useState('Grade 3');
  const [selectedStream, setSelectedStream] = useState('A');
  const [selectedArea, setSelectedArea] = useState('Mathematics Activities');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [assessmentType, setAssessmentType] = useState('Classwork');
  const [strand, setStrand] = useState('Numbers');
  const [topic, setTopic] = useState('Addition and Subtraction');
  
  const [assessments, setAssessments] = useState({});

  const learningAreas = ['Mathematics Activities', 'Literacy Activities', 'Kiswahili Activities', 
    'Environmental Activities', 'Hygiene & Nutrition', 'Creative Activities', 'Movement & Health'];

  const rubrics = [
    { code: 'EE', label: 'Exceeds Expectations', color: 'bg-green-600' },
    { code: 'ME', label: 'Meets Expectations', color: 'bg-blue-600' },
    { code: 'AE', label: 'Approaches Expectations', color: 'bg-yellow-600' },
    { code: 'BE', label: 'Below Expectations', color: 'bg-red-600' }
  ];

  const classLearners = learners.filter(l => l.grade === selectedGrade && l.stream === selectedStream && l.status === 'Active');

  const handleAssessment = (learnerId, rubric) => {
    setAssessments(prev => ({ ...prev, [learnerId]: { ...prev[learnerId], rubric, comment: prev[learnerId]?.comment || '' } }));
  };

  const handleComment = (learnerId, comment) => {
    setAssessments(prev => ({ ...prev, [learnerId]: { ...prev[learnerId], comment, rubric: prev[learnerId]?.rubric || '' } }));
  };

  const handleSave = () => {
    showSuccess('Formative assessment saved successfully!');
  };

  const stats = {
    total: classLearners.length,
    assessed: Object.keys(assessments).filter(id => assessments[id].rubric).length,
    ee: Object.values(assessments).filter(a => a.rubric === 'EE').length,
    me: Object.values(assessments).filter(a => a.rubric === 'ME').length,
    ae: Object.values(assessments).filter(a => a.rubric === 'AE').length,
    be: Object.values(assessments).filter(a => a.rubric === 'BE').length
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Formative Assessment" subtitle="Record daily formative assessments using CBC rubrics" icon={ClipboardList} />

      {/* Selection Panel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Assessment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stream</label>
            <select value={selectedStream} onChange={(e) => setSelectedStream(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              {['A', 'B', 'C'].map(s => <option key={s} value={s}>Stream {s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Type</label>
            <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              {['Classwork', 'Homework', 'Project', 'Quiz', 'Observation'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area</label>
            <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              {learningAreas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Strand</label>
            <select value={strand} onChange={(e) => setStrand(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Numbers</option>
              <option>Measurements</option>
              <option>Geometry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Topic</label>
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter topic" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 text-sm font-semibold">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm font-semibold">Assessed</p>
          <p className="text-2xl font-bold text-blue-800">{stats.assessed}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm font-semibold">EE</p>
          <p className="text-2xl font-bold text-green-800">{stats.ee}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm font-semibold">ME</p>
          <p className="text-2xl font-bold text-blue-800">{stats.me}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 text-sm font-semibold">AE</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.ae}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm font-semibold">BE</p>
          <p className="text-2xl font-bold text-red-800">{stats.be}</p>
        </div>
      </div>

      {/* Rubric Legend */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="font-bold text-gray-800 mb-3">CBC Assessment Rubric</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {rubrics.map(r => (
            <div key={r.code} className="flex items-center gap-2">
              <span className={`${r.color} text-white px-3 py-1 rounded font-bold text-sm`}>{r.code}</span>
              <span className="text-sm text-gray-700">{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Grid */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-6">Mark Assessments - {selectedGrade} {selectedStream}</h3>
        <div className="space-y-4">
          {classLearners.map(learner => (
            <div key={learner.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{learner.avatar}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{learner.firstName} {learner.lastName}</p>
                  <p className="text-sm text-gray-500">{learner.admNo}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rubrics.map(r => (
                      <button key={r.code} onClick={() => handleAssessment(learner.id, r.code)} className={`px-4 py-2 rounded-lg transition font-semibold ${assessments[learner.id]?.rubric === r.code ? `${r.color} text-white` : `${r.color.replace('600', '100')} ${r.color.replace('bg-', 'text-').replace('100', '700')} hover:${r.color.replace('600', '200')}`}`}>
                        {r.code}
                      </button>
                    ))}
                  </div>
                  <textarea value={assessments[learner.id]?.comment || ''} onChange={(e) => handleComment(learner.id, e.target.value)} rows="2" className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Add comment for learner..." />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      {classLearners.length > 0 && (
        <div className="flex justify-end">
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            <Save size={20} /> Save Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default FormativeAssessment;
