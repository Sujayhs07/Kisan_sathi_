import React from 'react';
import { Bell, MoreVertical, Sprout, Check, BellOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TopHeader from '../components/TopHeader';

export default function MyRemindersPage() {
  const { schemes, reminders, toggleReminder, openSchemeDetails, t, language } = useApp();

  const reminderSchemes = schemes.filter(s => s.status === 'upcoming');

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-cream-100 font-sans">
      <TopHeader />

      <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-8">
        
        {/* Title Header with Red Bell Icon matching 07_My_Reminders.png */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100/80 flex items-center justify-center text-maroon-700 flex-shrink-0 mt-1">
            <Bell className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div>
            <h1 className="text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
              {language === 'kn' ? 'ನನ್ನ ನೆನಪೋಲೆಗಳು' : 'My Reminders'}
            </h1>
            <p className="text-stone-600 text-sm mt-1">
              {language === 'kn' 
                ? 'ನೀವು ಅರ್ಹರಾಗಿರುವ, ಆದರೆ ಇನ್ನೂ ತೆರೆಯದ ಯೋಜನೆಗಳು. ಅರ್ಜಿ ಪ್ರಾರಂಭವಾದಾಗ ನಾವು ನಿಮಗೆ ತಿಳಿಸುತ್ತೇವೆ.' 
                : "Schemes you qualify for, but are not open yet. We'll notify you when applications start."}
            </p>
          </div>
        </div>

        {/* Reminder Cards matching 07_My_Reminders.png */}
        <div className="space-y-4">
          {reminderSchemes.map((scheme) => {
            const isReminderActive = reminders[scheme.id] ?? true;

            return (
              <div
                key={scheme.id}
                className="bg-white rounded-3xl p-6 md:p-7 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left: Icon and Details */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100/90 border border-amber-200 flex items-center justify-center text-emerald-800 flex-shrink-0">
                    <Sprout className="w-7 h-7 text-emerald-700" />
                  </div>

                  <div>
                    <h3 
                      onClick={() => openSchemeDetails(scheme.id)}
                      className="text-lg md:text-xl font-bold text-stone-900 hover:text-maroon-700 cursor-pointer transition-colors"
                    >
                      {scheme.title}
                    </h3>
                    <p className="text-stone-600 text-sm mt-0.5">
                      {scheme.shortDesc}
                    </p>
                  </div>
                </div>

                {/* Right: Status Pill, Expected Date & Reminder Button */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-stone-100">
                  
                  {/* Status Pill & Expected Date */}
                  <div className="text-right">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold inline-block ${
                      scheme.badge === 'Opens Soon'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      {scheme.badge || 'Opens Soon'}
                    </span>
                    <p className="text-xs text-stone-500 font-medium mt-1">
                      Expected: {scheme.expectedDate || 'Nov 2026'}
                    </p>
                  </div>

                  {/* Reminder Toggle Button */}
                  <button
                    onClick={() => toggleReminder(scheme.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
                      isReminderActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {isReminderActive ? (
                      <>
                        <Bell className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                        <span>{language === 'kn' ? 'ನೆನಪೋಲೆ ಆನ್ ಆಗಿದೆ' : 'Reminder On'}</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4 text-stone-500" />
                        <span>{language === 'kn' ? 'ನೆನಪೋಲೆ ಆಫ್' : 'Reminder Off'}</span>
                      </>
                    )}
                  </button>

                  {/* 3 dots menu */}
                  <button 
                    onClick={() => openSchemeDetails(scheme.id)}
                    className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
