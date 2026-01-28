import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../services/api';

const counties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang’a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

const passwordStrength = (pwd) => {
  const length = pwd.length >= 12;
  const upper = /[A-Z]/.test(pwd);
  const lower = /[a-z]/.test(pwd);
  const digit = /\d/.test(pwd);
  const special = /[^A-Za-z0-9]/.test(pwd);
  const banned = /(password|qwerty|1234|admin|school)/i.test(pwd);
  const score = [length, upper, lower, digit, special, !banned].filter(Boolean).length;
  return score;
};

const RegistrationFull = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [ward, setWard] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolType, setSchoolType] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const strength = useMemo(() => passwordStrength(password), [password]);

  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem('registrationDraft') || '{}');
    if (draft && draft.schoolName) {
      setFullName(draft.fullName || '');
      setEmail(draft.email || '');
      setPhone(draft.phone || '');
      setAddress(draft.address || '');
      setCounty(draft.county || '');
      setSubCounty(draft.subCounty || '');
      setWard(draft.ward || '');
      setSchoolName(draft.schoolName || '');
      setSchoolType(draft.schoolType || '');
      setPassword(draft.password || '');
      setConfirm(draft.confirm || '');
      setStep(draft.step || 1);
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem('registrationDraft', JSON.stringify({
      fullName, email, phone, address, county, subCounty, ward, schoolName, schoolType, password, confirm, step
    }));
  };

  const next = () => {
    saveDraft();
    setStep((s) => Math.min(s + 1, 4));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const csrfRes = await fetch(`${API_BASE_URL}/auth/csrf`);
      const csrfData = await csrfRes.json();
      const res = await fetch(`${API_BASE_URL}/onboarding/register-full`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData?.token || '' },
        body: JSON.stringify({ fullName, email, phone, address, county, subCounty, ward, schoolName, schoolType, password, passwordConfirm: confirm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      setResult({ success: true, data });
      localStorage.setItem('prefillEmail', email);
    } catch (e) {
      setResult({ success: false, error: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">School Registration</h1>
      <p className="text-sm text-gray-600 mb-4">Complete all steps to create your account and start a 30-day trial.</p>
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 h-2 rounded ${step >= i ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>
      {step === 1 && (
        <div className="space-y-4 bg-white border rounded-xl p-6">
          <div>
            <label className="text-xs font-semibold text-gray-700">Full Name</label>
            <input className="mt-1 w-full p-2 border rounded" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="First Last" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Email</label>
              <input className="mt-1 w-full p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Phone</label>
              <input className="mt-1 w-full p-2 border rounded" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2547XXXXXXXX or 07XXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Physical Address</label>
            <input className="mt-1 w-full p-2 border rounded" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, Town" />
          </div>
          <div className="flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={saveDraft}>Save as Draft</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={next}>Next</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4 bg-white border rounded-xl p-6">
          <div>
            <label className="text-xs font-semibold text-gray-700">County</label>
            <select className="mt-1 w-full p-2 border rounded" value={county} onChange={(e) => setCounty(e.target.value)}>
              <option value="">Select County</option>
              {counties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Sub-County</label>
              <input className="mt-1 w-full p-2 border rounded" value={subCounty} onChange={(e) => setSubCounty(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Ward</label>
              <input className="mt-1 w-full p-2 border rounded" value={ward} onChange={(e) => setWard(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={back}>Back</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={next}>Next</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4 bg-white border rounded-xl p-6">
          <div>
            <label className="text-xs font-semibold text-gray-700">School Name</label>
            <input className="mt-1 w-full p-2 border rounded" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">School Type</label>
            <select className="mt-1 w-full p-2 border rounded" value={schoolType} onChange={(e) => setSchoolType(e.target.value)}>
              <option value="">Select Type</option>
              <option>Public Primary School</option>
              <option>Public Secondary School</option>
              <option>Private Primary School</option>
              <option>Private Secondary School</option>
              <option>International School</option>
              <option>Special Needs School</option>
              <option>Technical Training Institute</option>
              <option>University/College</option>
            </select>
          </div>
          <div className="flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={back}>Back</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={next}>Next</button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4 bg-white border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <div className="flex gap-2">
                <input className="mt-1 w-full p-2 border rounded" type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="mt-1 px-3 rounded border" type="button" onClick={() => setShowPwd(s => !s)}>{showPwd ? 'Hide' : 'Show'}</button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 rounded bg-gray-200">
                  <div className={`h-2 rounded ${strength >= 1 ? 'bg-red-500' : ''}`} style={{ width: `${Math.min(strength, 5) / 5 * 100}%` }} />
                </div>
                <span className="text-xs">{['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][Math.max(0, strength - 1)] || 'Weak'}</span>
              </div>
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li>Minimum 12 characters</li>
                <li>Include uppercase, lowercase, number, special character</li>
                <li>No common patterns</li>
              </ul>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Confirm Password</label>
              <input className="mt-1 w-full p-2 border rounded" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-between">
            <button className="px-4 py-2 rounded border" onClick={back}>Back</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={submit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
          </div>
        </div>
      )}
      {result && (
        <div className={`mt-4 p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {result.success ? (
            <div className="text-sm text-green-800">
              <p className="font-semibold">Registration successful.</p>
              <p>Check your email for a confirmation link.</p>
              <p>We also sent a phone verification code.</p>
              <div className="mt-3 flex gap-2">
                {result.data?.meta?.emailVerificationToken && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={async () => {
                    await fetch(`${API_BASE_URL}/onboarding/verify-email?token=${result.data.meta.emailVerificationToken}`);
                    window.location.href = '/?view=auth';
                  }}>Simulate Email Verification</button>
                )}
                <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => { window.location.href = '/?view=auth'; }}>Go to Login</button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-red-800">
              <p className="font-semibold">Registration failed</p>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistrationFull;
