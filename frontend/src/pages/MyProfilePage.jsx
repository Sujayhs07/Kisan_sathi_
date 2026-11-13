import React, { useState } from 'react';
import {
  User,
  Phone,
  Calendar,
  Users,
  Tag,
  MapPin,
  Edit3,
  Check,
  X,
  FileCheck2,
  Landmark,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';
import { getStates, getDistricts, getTaluks } from '../data/locationData';

export default function MyProfilePage() {
  const { profile, setProfile, setWizardData, evaluateEligibility, t, language } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile, state: profile.state || 'Karnataka' });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStartEdit = () => {
    setEditForm({ ...profile, state: profile.state || 'Karnataka' });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(editForm);
    setWizardData(prev => ({
      ...prev,
      fullName: editForm.name || prev.fullName,
      category: editForm.category || prev.category,
      state: editForm.state || prev.state,
      district: editForm.district || prev.district,
      taluk: editForm.taluk || prev.taluk,
      landHolding: editForm.landHolding || prev.landHolding,
      landType: editForm.landType || prev.landType,
      cropType: editForm.cropType || prev.cropType,
      irrigationType: editForm.irrigation || prev.irrigationType
    }));
    evaluateEligibility({
      fullName: editForm.name,
      category: editForm.category,
      state: editForm.state,
      district: editForm.district,
      taluk: editForm.taluk,
      landHolding: editForm.landHolding,
      landType: editForm.landType,
      cropType: editForm.cropType,
      irrigationType: editForm.irrigation
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader />

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-5xl w-full mx-auto space-y-4 sm:space-y-6">

        {/* Title Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
            {language === 'kn' ? 'ನನ್ನ ಪ್ರೊಫೈಲ್' : 'My Profile'}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            {language === 'kn'
              ? 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮತ್ತು ಕೃಷಿ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ.'
              : 'View and manage your personal and farming details.'}
          </p>
        </div>

        {/* Profile Container matching 09_My_Profile_Settings.png */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-stretch">

          {/* Left Avatar Card */}
          <div className="w-full md:w-1/3 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-stone-200/90 shadow-xs flex flex-col items-center justify-center text-center">
            {/* Official Brand Farmer Portrait */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 sm:p-2 bg-gradient-to-tr from-emerald-600 to-amber-300 shadow-xl mb-4 sm:mb-5 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-white p-2.5 sm:p-3 shadow-inner">
                <img
                  src="/logo-emblem.png"
                  alt={profile.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-serif-heading">
              {profile.name}
            </h3>
            <p className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mt-2">
              ✓ FRUITS Verified Farmer
            </p>
            <p className="text-xs text-stone-500 mt-2">
              FID: {profile.fruitsId}
            </p>
          </div>

          {/* Right Personal Information Card matching 09_My_Profile_Settings.png */}
          <div className="w-full md:w-2/3 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-stone-200/90 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header with Edit Button */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <h2 className="text-xl font-bold font-serif-heading text-stone-900">
                  {t.personalInfo}
                </h2>

                <button
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                    } else {
                      handleStartEdit();
                    }
                  }}
                  className="px-5 py-1.5 rounded-full border border-maroon-700 text-maroon-700 hover:bg-maroon-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? (language === 'kn' ? 'ರದ್ದು' : 'Cancel') : t.edit}</span>
                </button>
              </div>

              {/* Save Success Alert */}
              {saveSuccess && (
                <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>
                    {language === 'kn'
                      ? 'ಪ್ರೊಫೈಲ್ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!'
                      : 'Profile details updated successfully!'}
                  </span>
                </div>
              )}

              {/* Information Grid */}
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">

                  {/* Full Name */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {t.fullName}
                      </span>
                      <p className="text-base font-bold text-stone-900 mt-0.5">
                        {profile.name}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {t.mobileNumber}
                      </span>
                      <p className="text-base font-bold text-stone-900 mt-0.5">
                        {profile.mobile}
                      </p>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 flex-shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {t.dateOfBirth}
                      </span>
                      <p className="text-base font-bold text-stone-900 mt-0.5">
                        {profile.dob}
                      </p>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 flex-shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {t.gender}
                      </span>
                      <p className="text-base font-bold text-stone-900 mt-0.5">
                        {profile.gender}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 flex-shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {t.category}
                      </span>
                      <p className="text-base font-bold text-stone-900 mt-0.5">
                        {profile.category}
                      </p>
                    </div>
                  </div>

                  {/* State */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 flex-shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {t.state || (language === 'kn' ? 'ರಾಜ್ಯ' : 'State')}
                      </span>
                      <p className="text-base font-bold text-stone-900 mt-0.5">
                        {profile.state || 'Karnataka'}
                      </p>
                    </div>
                  </div>

                  {/* District */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {t.district || (language === 'kn' ? 'ಜಿಲ್ಲೆ' : 'District')}
                      </span>
                      <p className="text-base font-bold text-stone-900 mt-0.5">
                        {profile.district}
                      </p>
                    </div>
                  </div>

                  {/* Taluk */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-stone-100 text-stone-600 flex-shrink-0">
                      <MapPin className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        {t.taluk || (language === 'kn' ? 'ತಾಲೂಕು' : 'Taluk')}
                      </span>
                      <p className="text-base font-bold text-stone-900 mt-0.5">
                        {profile.taluk}
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                /* Editable Form with Cascading State -> District -> Taluk Dropdowns */
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                        {t.fullName}
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                        {t.mobileNumber}
                      </label>
                      <input
                        type="text"
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none"
                        required
                      />
                    </div>

                    {/* State Dropdown */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                        {t.state || (language === 'kn' ? 'ರಾಜ್ಯ' : 'State')} <span className="text-maroon-700">*</span>
                      </label>
                      <select
                        value={editForm.state || 'Karnataka'}
                        onChange={(e) => {
                          const newState = e.target.value;
                          const availableDistricts = getDistricts(newState);
                          const newDistrict = availableDistricts[0] || '';
                          const availableTaluks = getTaluks(newState, newDistrict);
                          const newTaluk = availableTaluks[0] || '';
                          setEditForm({
                            ...editForm,
                            state: newState,
                            district: newDistrict,
                            taluk: newTaluk
                          });
                        }}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none cursor-pointer"
                      >
                        {getStates().map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* District Dropdown (Filtered according to selected State) */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                        {t.district || (language === 'kn' ? 'ಜಿಲ್ಲೆ' : 'District')} <span className="text-maroon-700">*</span>
                      </label>
                      <select
                        value={editForm.district || ''}
                        onChange={(e) => {
                          const newDistrict = e.target.value;
                          const availableTaluks = getTaluks(editForm.state || 'Karnataka', newDistrict);
                          const newTaluk = availableTaluks[0] || '';
                          setEditForm({
                            ...editForm,
                            district: newDistrict,
                            taluk: newTaluk
                          });
                        }}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none cursor-pointer"
                      >
                        {getDistricts(editForm.state || 'Karnataka').map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    {/* Taluk Dropdown (Filtered according to selected District) */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                        {t.taluk || (language === 'kn' ? 'ತಾಲೂಕು' : 'Taluk')} <span className="text-maroon-700">*</span>
                      </label>
                      <select
                        value={editForm.taluk || ''}
                        onChange={(e) => setEditForm({ ...editForm, taluk: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none cursor-pointer"
                      >
                        {getTaluks(editForm.state || 'Karnataka', editForm.district).map((taluk) => (
                          <option key={taluk} value={taluk}>{taluk}</option>
                        ))}
                      </select>
                    </div>

                    {/* Category Dropdown */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                        {t.category || (language === 'kn' ? 'ವರ್ಗ' : 'Category')}
                      </label>
                      <select
                        value={editForm.category || 'General'}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest-700 focus:outline-none cursor-pointer"
                      >
                        <option value="General">General</option>
                        <option value="OBC">OBC (2A/2B/3A/3B)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2 border border-stone-300 rounded-full text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      {language === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-maroon-700 hover:bg-maroon-800 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                    >
                      {language === 'kn' ? 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Verification status pill */}
            <div className="mt-8 pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                Aadhaar Authentication: {profile.aadhaarStatus}
              </span>
              <span>Karnataka Bhoomi RTC Sync Active</span>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
