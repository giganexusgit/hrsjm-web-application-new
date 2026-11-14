import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Send,
  MessageCircle,
  Clock,
  Scale,
  X,
} from 'lucide-react';
import { supportService } from '../../admin/support/services/supportService';
import type { SupportTicket, SupportTicketMessage } from '../../admin/support/types/support.types';
import { useUserAuth } from '../store/userAuthStore';
import { ComplaintProgress } from '../components/complaint/ComplaintProgress';
import { ComplaintStep1Details, type UploadedDoc } from '../components/complaint/ComplaintStep1Details';
import { ComplaintStep2User, type UserDetailsForm } from '../components/complaint/ComplaintStep2User';
import { ComplaintStep3Review } from '../components/complaint/ComplaintStep3Review';
import { ComplaintSuccessView } from '../components/complaint/ComplaintSuccessView';
import { HelpTopicSelectorModal } from '../components/complaint/HelpTopicSelectorModal';
import type { HelpTopic } from '../data/helpTopicsData';

export const UserSupportPage: React.FC = () => {
  const { user } = useUserAuth();

  const [activeTab, setActiveTab] = useState<'file' | 'my-tickets'>('file');

  // Wizard Step State (1: Complaint Details, 2: Your Details, 3: Review & Submit)
  const [step, setStep] = useState<number>(1);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 State
  const [selectedTopics, setSelectedTopics] = useState<HelpTopic[]>([]);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [aadhaarFiles, setAadhaarFiles] = useState<UploadedDoc[]>([]);
  const [handwrittenFiles, setHandwrittenFiles] = useState<UploadedDoc[]>([]);

  // Step 2 State
  const [userForm, setUserForm] = useState<UserDetailsForm>({
    fullName: user?.full_name || '',
    mobile: user?.mobile_number || '',
    email: user?.email || '',
    address: '',
    policeStation: '',
    state: '',
    city: '',
  });

  // Validation Errors
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Tickets List & Chat State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Load tickets on tab switch
  useEffect(() => {
    if (activeTab === 'my-tickets') {
      const loadTickets = async () => {
        try {
          setLoadingTickets(true);
          const res = await supportService.list({ limit: 50 });
          setTickets(res.items || []);
        } catch (err) {
          console.error('Failed to load tickets:', err);
        } finally {
          setLoadingTickets(false);
        }
      };
      loadTickets();
    }
  }, [activeTab]);

  // Load chat messages when active ticket is selected
  useEffect(() => {
    if (activeTicket) {
      const loadChat = async () => {
        try {
          setLoadingMessages(true);
          const msgs = await supportService.getMessages(activeTicket.id);
          setMessages(msgs || []);
        } catch (err) {
          console.error('Failed to load chat:', err);
        } finally {
          setLoadingMessages(false);
        }
      };
      loadChat();
    }
  }, [activeTicket]);

  // Step 1 Validation & Proceed
  const handleNextStep1 = () => {
    const errs: Record<string, string> = {};
    if (selectedTopics.length === 0) {
      errs.helpType = 'Please select at least one type of help you need.';
    }
    if (!subject.trim()) {
      errs.subject = 'Subject is required.';
    }
    if (!description.trim()) {
      errs.description = 'Detailed description is required.';
    } else if (description.length > 1000) {
      errs.description = 'Description must be 1000 characters or less.';
    }

    setStep1Errors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 2 Validation & Proceed
  const handleNextStep2 = () => {
    const errs: Record<string, string> = {};
    if (!userForm.fullName.trim()) {
      errs.fullName = 'Full name is required.';
    }
    if (!userForm.mobile.trim()) {
      errs.mobile = 'Mobile number is required.';
    } else if (!/^[0-9]{10}$/.test(userForm.mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit mobile number.';
    }
    if (!userForm.address.trim()) {
      errs.address = 'Full address is required.';
    }
    if (!userForm.policeStation.trim()) {
      errs.policeStation = 'Nearby police station is required.';
    }
    if (!userForm.state) {
      errs.state = 'Please select your state.';
    }
    if (!userForm.city) {
      errs.city = 'Please select your city.';
    }
    if (userForm.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(userForm.email.trim())) {
        errs.email = 'Enter a valid email address.';
      }
    }

    setStep2Errors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 3 Submission
  const handleSubmitComplaint = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const helpCategories = selectedTopics.length > 0
        ? selectedTopics.map(t => t.title).join(', ')
        : 'Human Rights Grievance';

      const aadhaarNames = aadhaarFiles.length > 0
        ? aadhaarFiles.map(f => f.name).join(', ')
        : 'Not uploaded';

      const handwrittenNames = handwrittenFiles.length > 0
        ? handwrittenFiles.map(f => f.name).join(', ')
        : 'Not uploaded';

      const structuredDescription = `Complainant Information:
- Full Name: ${userForm.fullName}
- Mobile: +91 ${userForm.mobile}
- Email: ${userForm.email || 'N/A'}
- Address: ${userForm.address}
- Nearby Police Station: ${userForm.policeStation}
- Location: ${userForm.city}, ${userForm.state}
- Type of Help: ${helpCategories}

Details of Grievance:
${description}

Verified Document Attachments:
- Aadhaar Card: ${aadhaarNames}
- Handwritten Complaint: ${handwrittenNames}`;

      let assignedId = '';

      if (user?.id) {
        // Authenticated member / user endpoint
        const formattedSubject = subject.trim().startsWith('[')
          ? subject.trim()
          : `[${helpCategories}] ${subject.trim()}`.slice(0, 200);

        const res = await supportService.create({
          subject: formattedSubject,
          description: structuredDescription,
          source: 'web',
        });
        assignedId = res.id;
      } else {
        // Public complaint endpoint (unauthenticated citizens)
        const publicRes = await supportService.createPublic({
          fullName: userForm.fullName.trim(),
          phone: userForm.mobile.trim(),
          email: userForm.email.trim() || undefined,
          state: userForm.state,
          policeStation: userForm.policeStation.trim(),
          complaintType: helpCategories,
          details: structuredDescription,
          aadhaarFileName: aadhaarFiles[0]?.name,
          handwrittenFileName: handwrittenFiles[0]?.name,
        });
        assignedId = publicRes.ticketNumber || publicRes.id || `HRSJM-CMP-${Date.now()}`;
      }

      setSubmitSuccess(assignedId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error submitting complaint:', err);
      const errMsg = err?.message || 'Unable to submit your complaint. Please verify your connection and form details, then try again.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setStep(1);
    setSubmitSuccess(null);
    setSubmitError(null);
    setSelectedTopics([]);
    setSubject('');
    setDescription('');
    setAadhaarFiles([]);
    setHandwrittenFiles([]);
    setStep1Errors({});
    setStep2Errors({});
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    try {
      const newMsg = await supportService.addMessage(activeTicket.id, {
        body: replyText.trim(),
      });
      setMessages(prev => [...prev, newMsg]);
      setReplyText('');
    } catch {
      // optimistic message append
      const optMsg: SupportTicketMessage = {
        id: `msg-${Date.now()}`,
        ticket_id: activeTicket.id,
        author_id: user?.id || 'usr-demo-001',
        author: {
          id: user?.id || 'usr-demo-001',
          full_name: user?.full_name || 'You',
        },
        body: replyText.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optMsg]);
      setReplyText('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'UNDER_REVIEW':
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SUBMITTED':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#06294D] text-white p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9B82E]/20 text-[#FAD465] text-xs font-bold uppercase tracking-wider mb-2">
            <Scale size={14} />
            <span>Official Grievance Redressal Mechanism</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Playfair_Display',Georgia,serif] text-white">Grievance &amp; Support Cell</h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            File human rights complaints, report custodial violations, or access free legal counsel from our dedicated legal cell officers.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/20 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('file');
              if (submitSuccess) handleResetForm();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'file' ? 'bg-[#E9B82E] text-[#011F39] shadow-xs' : 'text-slate-200 hover:text-white'
            }`}
          >
            File a Complaint
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'my-tickets' ? 'bg-[#E9B82E] text-[#011F39] shadow-xs' : 'text-slate-200 hover:text-white'
            }`}
          >
            My Complaints &amp; Status
          </button>
        </div>
      </div>

      {activeTab === 'file' ? (
        <div className="w-full">
          {submitSuccess ? (
            <ComplaintSuccessView
              ticketId={submitSuccess}
              onViewTickets={() => {
                setSubmitSuccess(null);
                setActiveTab('my-tickets');
              }}
              onReset={handleResetForm}
            />
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6">
              {/* Screen Top Header (matches APK reference) */}
              <div className="text-center space-y-1 border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold font-['Playfair_Display',Georgia,serif] text-[#06294D] tracking-tight">
                  File a Complaint / Get Help
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Please provide the details below. Our team will review your complaint and get in touch with you.
                </p>
              </div>

              {/* 3-Step Stepper Progress (matches APK reference) */}
              <ComplaintProgress
                currentStep={step}
                onStepClick={targetStep => {
                  if (targetStep < step) setStep(targetStep);
                }}
              />

              {/* Step 1: Complaint Details */}
              {step === 1 && (
                <ComplaintStep1Details
                  selectedTopics={selectedTopics}
                  onOpenTopicModal={() => setIsTopicModalOpen(true)}
                  onRemoveTopic={id => setSelectedTopics(prev => prev.filter(t => t.id !== id))}
                  subject={subject}
                  setSubject={setSubject}
                  description={description}
                  setDescription={setDescription}
                  aadhaarFiles={aadhaarFiles}
                  setAadhaarFiles={setAadhaarFiles}
                  handwrittenFiles={handwrittenFiles}
                  setHandwrittenFiles={setHandwrittenFiles}
                  errors={step1Errors}
                  onNext={handleNextStep1}
                />
              )}

              {/* Step 2: Your Details */}
              {step === 2 && (
                <ComplaintStep2User
                  form={userForm}
                  setForm={setUserForm}
                  errors={step2Errors}
                  onBack={() => setStep(1)}
                  onNext={handleNextStep2}
                />
              )}

              {/* Step 3: Review & Submit */}
              {step === 3 && (
                <ComplaintStep3Review
                  selectedTopics={selectedTopics}
                  subject={subject}
                  description={description}
                  aadhaarFiles={aadhaarFiles}
                  handwrittenFiles={handwrittenFiles}
                  userForm={userForm}
                  onEditStep={target => setStep(target)}
                  onBack={() => setStep(2)}
                  onSubmit={handleSubmitComplaint}
                  isSubmitting={isSubmitting}
                  errorMessage={submitError}
                />
              )}
            </div>
          )}

          {/* Help Topic Multi-Select Modal */}
          <HelpTopicSelectorModal
            isOpen={isTopicModalOpen}
            selectedTopics={selectedTopics}
            onClose={() => setIsTopicModalOpen(false)}
            onConfirm={topics => {
              setSelectedTopics(topics);
              if (topics.length > 0) {
                setStep1Errors(prev => ({ ...prev, helpType: '' }));
              }
            }}
          />
        </div>
      ) : (
        /* My Tickets & Status List */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#06294D]">Your Registered Grievances &amp; Tickets</h2>
            <span className="text-xs text-slate-500">Live support chat and status updates</span>
          </div>

          {loadingTickets ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <LifeBuoy size={36} className="mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-bold text-slate-700">No active complaints found</p>
              <p className="text-xs text-slate-400 mt-1">If you have a human rights issue, submit a complaint above.</p>
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#06294D] hover:bg-[#083563] cursor-pointer"
              >
                File a Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map(t => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#06294D]">
                        {t.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                        {t.category || 'Legal Aid'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#06294D] line-clamp-1">
                      {t.subject}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {t.description}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                      <Clock size={11} />
                      <span>Submitted on {new Date(t.created_at).toLocaleDateString('en-GB')}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTicket(t)}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#06294D] flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <MessageCircle size={14} />
                    <span>Open Case Chat</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Chat Modal */}
          {activeTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white w-full max-w-2xl rounded-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-[#06294D] text-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#FAD465]">
                        {activeTicket.id}
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded">
                        {activeTicket.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate max-w-md mt-0.5">
                      {activeTicket.subject}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTicket(null)}
                    className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                  {/* Case Initial Description Card */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Original Case Filing</span>
                    <p className="leading-relaxed">{activeTicket.description}</p>
                  </div>

                  {loadingMessages ? (
                    <div className="text-center text-xs text-slate-400 py-4">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-4">
                      No additional messages yet. A legal officer will respond shortly.
                    </div>
                  ) : (
                    messages.map(m => {
                      const isMe = m.author_id === user?.id || m.author?.id === user?.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-[#06294D] text-white rounded-tr-xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                            }`}
                          >
                            <span className="block font-bold text-[10px] opacity-75 mb-0.5">
                              {isMe ? 'You' : m.author?.full_name || 'HRSJM Legal Officer'}
                            </span>
                            <p>{m.body}</p>
                          </div>
                          <span className="text-[9.5px] text-slate-400 mt-1 px-1">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Footer */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message or response to legal officer..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#06294D]"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-[#06294D] hover:bg-[#083563] text-white cursor-pointer transition-colors"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
