import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  sendEligibilityChatMessage, 
  getInitialChatMessage 
} from '../services/aiChatService';

/**
 * Typewriter text component for streaming typing simulation
 */
function TypewriterText({ text, isLatest, onFinished, onSpeak, autoSpeak }) {
  const [displayed, setDisplayed] = useState(isLatest ? '' : text);
  const [isTyping, setIsTyping] = useState(isLatest);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLatest) {
      setDisplayed(text);
      setIsTyping(false);
      return;
    }

    let idx = 0;
    setDisplayed('');
    setIsTyping(true);

    const speed = 18; // ms per tick
    const timer = setInterval(() => {
      if (!isMountedRef.current) {
        clearInterval(timer);
        return;
      }
      idx += 2;
      if (idx >= text.length) {
        setDisplayed(text);
        setIsTyping(false);
        clearInterval(timer);
        if (onFinished && isMountedRef.current) onFinished();
        if (autoSpeak && onSpeak && isMountedRef.current) {
          onSpeak(text);
        }
      } else {
        setDisplayed(text.slice(0, idx));
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, isLatest, autoSpeak, onSpeak, onFinished]);

  const handleSkip = () => {
    setDisplayed(text);
    setIsTyping(false);
    if (onFinished && isMountedRef.current) onFinished();
    if (autoSpeak && onSpeak && isMountedRef.current) {
      onSpeak(text);
    }
  };

  return (
    <div>
      <p className="leading-relaxed">
        {displayed}
        {isTyping && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-forest-700 animate-pulse align-middle" />
        )}
      </p>
      {isTyping && (
        <button
          type="button"
          onClick={handleSkip}
          className="text-[11px] text-stone-600 hover:text-stone-900 mt-1 underline"
        >
          Skip typing
        </button>
      )}
    </div>
  );
}

export default function EligibilityChatbot({ onSwitchToForm }) {
  const { 
    wizardData, 
    setWizardData, 
    setCurrentPage, 
    language, 
    speakText, 
    stopSpeaking,
    isSpeaking 
  } = useApp();

  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9));
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('name');
  const [inputText, setInputText] = useState('');
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [activeOptions, setActiveOptions] = useState([]);
  const [placeholder, setPlaceholder] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [autoVoice, setAutoVoice] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(true);
  const [progress, setProgress] = useState(15);

  const messagesEndRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // Stop voice and speech recognition immediately if chatbot unmounts or user navigates
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [stopSpeaking]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Initialize first greeting message
  useEffect(() => {
    const initial = getInitialChatMessage(language, wizardData.fullName);
    const initialMsg = {
      id: 'msg_0',
      role: 'assistant',
      text: initial.reply,
      step: initial.nextStep,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialMsg]);
    setActiveOptions(initial.options || []);
    setPlaceholder(initial.placeholder || '');
    setProgress(initial.stepProgress || 15);
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isWaitingResponse, activeOptions, scrollToBottom]);

  // Restart chat
  const handleRestart = () => {
    const initial = getInitialChatMessage(language, wizardData.fullName);
    setMessages([{
      id: 'msg_' + Date.now(),
      role: 'assistant',
      text: initial.reply,
      step: initial.nextStep,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setCurrentStep('name');
    setActiveOptions(initial.options || []);
    setPlaceholder(initial.placeholder || '');
    setIsComplete(false);
    setProgress(15);
  };

  // Submit a message (either typed by user or clicked via quick option chip)
  const handleSendMessage = async (textToSend, customValue = null) => {
    const trimmed = (textToSend || inputText).trim();
    if (!trimmed && customValue === null) return;

    const displayMsg = trimmed || (typeof customValue === 'object' ? JSON.stringify(customValue) : String(customValue));

    // Append user message
    const userMsg = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: displayMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setActiveOptions([]);
    setIsWaitingResponse(true);

    try {
      // Call service (backend or client fallback)
      const res = await sendEligibilityChatMessage({
        sessionId,
        userMessage: customValue ? (typeof customValue === 'string' ? customValue : JSON.stringify(customValue)) : trimmed,
        currentStep,
        language,
        collectedProfile: wizardData,
        history: messages.map(m => ({ role: m.role, content: m.text }))
      });

      // Update state and context with collected profile attributes
      if (res.updatedProfile) {
        setWizardData(prev => ({
          ...prev,
          ...res.updatedProfile
        }));
      }

      setCurrentStep(res.nextStep);
      setActiveOptions(res.options || []);
      setPlaceholder(res.placeholder || '');
      setProgress(res.stepProgress || (res.isComplete ? 100 : progress + 10));

      if (res.isComplete) {
        setIsComplete(true);
      }

      // Add assistant response message
      const assistantMsg = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        text: res.reply,
        step: res.nextStep,
        isComplete: res.isComplete,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback polite message
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          text: language === 'kn' 
            ? 'ಕ್ಷಮಿಸಿ, ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಉತ್ತರಿಸಿ.' 
            : 'I encountered an issue processing that. Could you please reply again?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsWaitingResponse(false);
    }
  };

  // Toggle voice speech recognition
  const toggleListening = () => {
    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'kn' 
        ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ರೆಕಗ್ನಿಷನ್ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಕ್ರೋಮ್ ಅಥವಾ ಎಡ್ಜ್ ಬ್ರೌಸರ್ ಬಳಸಿ.' 
        : 'Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Mic error:', err);
      setIsListening(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col min-h-[640px]">
      
      {/* 1. Chatbot Header */}
      <div className="bg-forest-900 text-white p-4 md:p-5 flex items-center justify-between border-b border-forest-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-forest-800 border border-forest-700/80 flex items-center justify-center text-emerald-300 shadow-inner">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-forest-900 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-serif-heading font-bold text-cream-100">
                {language === 'kn' ? 'ಕಿಸಾನ್ ಸಾಥಿ AI ಅರ್ಹತಾ ಸಹಾಯಕ' : 'Kisan Saathi AI Assistant'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {language === 'kn' ? 'ಸಂವಾದ' : 'Interactive AI'}
              </span>
            </div>
            <p className="text-xs text-forest-200 mt-0.5">
              {language === 'kn' 
                ? 'ನಿಮ್ಮ ವಯಸ್ಸು, ಕೃಷಿ ವಿವರಗಳೊಂದಿಗೆ ಯೋಜನೆಗಳನ್ನು ತಕ್ಷಣವೇ ಪರಿಶೀಲಿಸಿ' 
                : 'Evaluating schemes in real-time as we chat'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Auto voice read-aloud toggle */}
          <button
            type="button"
            onClick={() => {
              if (autoVoice) {
                stopSpeaking();
              }
              setAutoVoice(!autoVoice);
            }}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              autoVoice 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm' 
                : 'bg-forest-800 border-forest-700 text-forest-200 hover:text-white'
            }`}
            title={autoVoice ? "Mute automatic voice reading" : "Enable automatic voice reading"}
          >
            {autoVoice ? <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{autoVoice ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Restart conversation */}
          <button
            type="button"
            onClick={handleRestart}
            className="p-2.5 rounded-xl bg-forest-800 border border-forest-700 text-forest-200 hover:text-white transition-colors"
            title="Restart Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Progress Bar */}
      <div className="w-full bg-forest-950/20 h-1.5 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 3. Live Profile Attributes Drawer (Collapsible) */}
      <div className="bg-amber-50/70 border-b border-amber-200/70 px-4 py-2.5 text-xs text-stone-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-stone-800">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{language === 'kn' ? 'ಗುರುತಿಸಲಾದ ಕೃಷಿ ವಿವರಗಳು:' : 'Captured Profile Details:'}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowProfileDrawer(!showProfileDrawer)}
          className="text-stone-500 hover:text-stone-800 flex items-center gap-1 text-[11px] font-medium"
        >
          {showProfileDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{showProfileDrawer ? 'Hide Details' : 'Show Details'}</span>
        </button>

        {showProfileDrawer && (
          <div className="w-full flex flex-wrap gap-2 pt-1 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 font-medium">
              👤 <strong>{wizardData.fullName || 'Farmer'}</strong>
            </span>
            {wizardData.age && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 font-medium">
                🎂 Age: <strong>{wizardData.age} Yrs</strong>
              </span>
            )}
            {wizardData.gender && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 font-medium">
                Gender: <strong>{wizardData.gender}</strong>
              </span>
            )}
            {wizardData.category && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 font-medium">
                Category: <strong>{wizardData.category}</strong>
              </span>
            )}
            {wizardData.district && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 font-medium">
                📍 <strong>{wizardData.district} ({wizardData.taluk})</strong>
              </span>
            )}
            {wizardData.landType && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 font-medium">
                🌱 <strong>{wizardData.landType}</strong>
              </span>
            )}
            {wizardData.cropType && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 font-medium">
                🌾 <strong>{wizardData.cropType}</strong>
              </span>
            )}
            {wizardData.irrigationType && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200/80 font-medium">
                💧 <strong>{wizardData.irrigationType}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. Messages Stream */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5 bg-[#FAF7F2]/60">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          const isLatestAssistant = isAssistant && index === messages.length - 1;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm text-xs ${
                isAssistant 
                  ? 'bg-forest-800 text-emerald-300' 
                  : 'bg-maroon-700 text-white'
              }`}>
                {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col">
                <div className={`p-4 md:p-5 rounded-3xl shadow-sm border text-sm leading-relaxed transition-all ${
                  isAssistant 
                    ? 'bg-white border-stone-200/80 text-stone-900 rounded-tl-sm' 
                    : 'bg-forest-800 border-forest-700 text-white rounded-tr-sm'
                }`}>
                  {isAssistant ? (
                    <TypewriterText 
                      text={msg.text} 
                      isLatest={isLatestAssistant} 
                      onSpeak={(txt) => speakText(txt, { lang: language })}
                      autoSpeak={autoVoice}
                    />
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>

                {/* Speaker icon & Timestamp */}
                <div className={`flex items-center gap-2 mt-1 px-2 text-[11px] text-stone-600 ${isAssistant ? '' : 'justify-end'}`}>
                  <span>{msg.timestamp}</span>
                  {isAssistant && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isSpeaking) {
                          stopSpeaking();
                        } else {
                          speakText(msg.text, { lang: language });
                        }
                      }}
                      className="hover:text-forest-800 transition-colors inline-flex items-center gap-1 font-medium"
                      title={isSpeaking ? "Stop voice" : "Read question aloud"}
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-emerald-700 animate-bounce' : ''}`} />
                      <span>{isSpeaking ? (language === 'kn' ? 'ನಿಲ್ಲಿಸಿ' : 'Stop') : (language === 'kn' ? 'ಕೇಳಿ' : 'Listen')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator while assistant is thinking */}
        {isWaitingResponse && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-9 h-9 rounded-2xl bg-forest-800 text-emerald-300 flex items-center justify-center shadow-sm flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 bg-white border border-stone-200/80 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest-700 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-forest-700 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-forest-700 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-stone-500 font-medium ml-1">
                {language === 'kn' ? 'ಪ್ರತಿಕ್ರಿಯೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...' : 'Analyzing & typing...'}
              </span>
            </div>
          </div>
        )}

        {/* Completion Card with CTA */}
        {isComplete && (
          <div className="bg-emerald-50 border-2 border-emerald-400/80 rounded-3xl p-6 shadow-md mt-4 max-w-2xl mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-serif-heading text-emerald-950">
                {language === 'kn' ? 'ಅರ್ಹತಾ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ!' : 'Profile Ready & Evaluated!'}
              </h3>
              <p className="text-emerald-800 text-xs md:text-sm mt-1">
                {language === 'kn'
                  ? 'ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್‌ನ ಆಧಾರದ ಮೇಲೆ, ನೀವು 9 ಯೋಜನೆಗಳಲ್ಲಿ ಅರ್ಹ ಯೋಜನೆಗಳನ್ನು ಈಗ ವೀಕ್ಷಿಸಬಹುದು.'
                  : 'Based on your age, land size, and crops, we have matched your tailored benefits.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentPage('results')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>{language === 'kn' ? 'ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಿ' : 'View Matched Schemes'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onSwitchToForm}
                className="w-full sm:w-auto px-5 py-3 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4 text-stone-500" />
                <span>{language === 'kn' ? 'ಫಾರ್ಮ್ ಮೋಡ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ' : 'Review in Form Mode'}</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Contextual Quick Reply Suggestion Chips */}
      {activeOptions && activeOptions.length > 0 && !isComplete && !isWaitingResponse && (
        <div className="px-4 py-3 bg-white border-t border-stone-200/80">
          <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'kn' ? 'ತ್ವರಿತ ಆಯ್ಕೆಗಳು (ಕ್ಲಿಕ್ ಮಾಡಿ):' : 'Suggested Answers (Tap to choose):'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(opt.label, opt.value)}
                className="px-4 py-2 rounded-2xl bg-cream-50 hover:bg-forest-50 border border-stone-300 hover:border-forest-700 text-stone-800 hover:text-forest-900 text-xs font-semibold text-left transition-all active:scale-95 shadow-sm flex flex-col"
              >
                <span>{opt.label}</span>
                {opt.subtext && (
                  <span className="text-[10px] text-stone-600 font-normal">{opt.subtext}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Input Field Bar with Voice & Send */}
      {!isComplete ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 md:p-4 bg-white border-t border-stone-200 flex items-center gap-2"
        >
          {/* Voice Input Microphone */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center ${
              isListening 
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
            title={isListening ? "Listening... Click to stop" : "Speak your answer"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-forest-800" />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isWaitingResponse}
            placeholder={
              isListening 
                ? (language === 'kn' ? 'ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ... ಮಾತನಾಡಿ' : 'Listening... speak now') 
                : (placeholder || (language === 'kn' ? 'ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೇಲಿನ ಆಯ್ಕೆಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ...' : 'Type your answer or click the options above...'))
            }
            className="flex-1 px-4 py-3 bg-stone-50 border border-stone-300 rounded-2xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white transition-all disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isWaitingResponse}
            className="p-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      ) : (
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-600">
            {language === 'kn' ? 'ಪ್ರಶ್ನೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ. ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಲು ಮುಂದುವರಿಯಿರಿ.' : 'All eligibility criteria collected. Proceed to review schemes.'}
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="text-xs text-forest-800 hover:underline font-bold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'kn' ? 'ಮತ್ತೊಮ್ಮೆ ಪ್ರಾರಂಭಿಸಿ' : 'Start Over'}</span>
          </button>
        </div>
      )}

    </div>
  );
}
