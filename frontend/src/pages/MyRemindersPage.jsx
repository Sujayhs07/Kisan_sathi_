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

      <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-5xl w-full mx-auto space-y-6 sm:space-y-8">
        
        {/* Title Header with Red Bell Icon matching 07_My_Reminders.png */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-100/80 flex items-center justify-center text-maroon-700 flex-shrink-0 mt-0.5 sm:mt-1">
            <Bell className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-stone-900 tracking-tight">
              {language === 'kn' ? 'ನನ್ನ ನೆನಪೋಲೆಗಳು' : 'My Reminders'}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              {language === 'kn' 
                ? 'ನೀವು ಅರ್ಹರಾಗಿರುವ, ಆದರೆ ಇನ್ನೂ ತೆರೆಯದ ಯೋಜನೆಗಳು. ಅರ್ಜಿ ಪ್ರಾರಂಭವಾದಾಗ ನಾವು ನಿಮಗೆ ತಿಳಿಸುತ್ತೇವೆ.' 
                : "Schemes you qualify for, but are not open yet. We'll notify you when applications start."}
            </p>
          </div>
        </div>

        {/* If no reminders have been activated yet */}
        {Object.values(reminders || {}).filter(Boolean).length === 0 && (
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-stone-700">
              <p className="font-bold text-stone-900">
                {language === 'kn' ? 'ಯಾವುದೇ ನೆನಪೋಲೆ ಸಕ್ರಿಯವಾಗಿಲ್ಲ' : 'No active reminders set yet'}
              </p>
              <p className="mt-0.5 text-stone-600">
                {language === 'kn'
                  ? 'ಅರ್ಜಿ ಸಲ್ಲಿಕೆ ಪ್ರಾರಂಭವಾದಾಗ ತಕ್ಷಣ ಎಚ್ಚರಿಕೆ ಪಡೆಯಲು ಕೆಳಗಿನ ಮುಂಬರುವ ಯೋಜನೆಗಳಿಗೆ "ನೆನಪೋಲೆ ಹೊಂದಿಸಿ" ಬಟನ್ ಒತ್ತಿ.'
                  : 'Click "Set Reminder" on any upcoming scheme below to be notified as soon as applications open.'}
              </p>
            </div>
          </div>
        )}

        {/* Reminder Cards matching 07_My_Reminders.png */}
        <div className="space-y-4">
          {reminderSchemes.map((scheme) => {
            const isReminderActive = Boolean(reminders && reminders[scheme.id]);

            return (
              <div
                key={scheme.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6"
              >
                {/* Left: Icon and Details */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-100/90 border border-amber-200 flex items-center justify-center text-emerald-800 flex-shrink-0">
                    <Sprout className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-700" />
                  </div>

                  <div>
                    <h3 
                      onClick={() => openSchemeDetails(scheme.id)}
                      className="text-base sm:text-lg md:text-xl font-bold text-stone-900 hover:text-maroon-700 cursor-pointer transition-colors"
                    >
                      {scheme.title}
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                      {scheme.shortDesc}
                    </p>
                  </div>
                </div>

                {/* Right: Status Pill, Expected Date & Reminder Button */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3.5 sm:pt-4 md:pt-0 border-stone-100">
                  
                  {/* Status Pill & Expected Date */}
                  <div className="text-left md:text-right">
                    <span className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold inline-block ${
                      scheme.badge === 'Opens Soon'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      {scheme.badge || 'Opens Soon'}
                    </span>
                    <p className="text-[11px] sm:text-xs text-stone-500 font-medium mt-0.5 sm:mt-1">
                      Expected: {scheme.expectedDate || 'Nov 2026'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reminder Toggle Button */}
                    <button
                      onClick={() => toggleReminder(scheme.id)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[44px] rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
                        isReminderActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {isReminderActive ? (
                        <>
                          <Bell className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                          <span>{language === 'kn' ? 'ನೆನಪೋಲೆ ಆನ್' : 'Reminder On'}</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 text-stone-500" />
                          <span>{language === 'kn' ? 'ನೆನಪೋಲೆ ಹೊಂದಿಸಿ' : 'Set Reminder'}</span>
                        </>
                      )}
                    </button>

                    {/* 3 dots menu */}
                    <button 
                      onClick={() => openSchemeDetails(scheme.id)}
                      className="p-2.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="View scheme details"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
