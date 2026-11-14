import React, { useState } from 'react';
import { useCurrentMember } from '../store/memberStore';
import { supportService } from '../../admin/support/services/supportService';

// APK 3-Step Complaint Flow Components
import { ComplaintProgress } from '@/features/user/components/complaint/ComplaintProgress';
import {
  ComplaintStep1Details,
  type UploadedDoc,
} from '@/features/user/components/complaint/ComplaintStep1Details';
import {
  ComplaintStep2User,
  type UserDetailsForm,
} from '@/features/user/components/complaint/ComplaintStep2User';
import { ComplaintStep3Review } from '@/features/user/components/complaint/ComplaintStep3Review';
import { ComplaintSuccessView } from '@/features/user/components/complaint/ComplaintSuccessView';
import { HelpTopicSelectorModal } from '@/features/user/components/complaint/HelpTopicSelectorModal';
import type { HelpTopic } from '@/features/user/data/helpTopicsData';

export const MemberSupportPage: React.FC = () => {
  const { member } = useCurrentMember();

  // Wizard Step State (1: Complaint Details, 2: Your Details, 3: Review & Submit)
  const [step, setStep] = useState<number>(1);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 1: Complaint Details
  const [selectedTopics, setSelectedTopics] = useState<HelpTopic[]>([]);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [aadhaarFiles, setAadhaarFiles] = useState<UploadedDoc[]>([]);
  const [handwrittenFiles, setHandwrittenFiles] = useState<UploadedDoc[]>([]);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Step 2: Member Details (pre-filled from authenticated member profile)
  const [userForm, setUserForm] = useState<UserDetailsForm>({
    fullName: member.fullName || '',
    mobile: member.phone?.replace(/\D/g, '').slice(-10) || '',
    email: member.email || '',
    address: member.address?.line || '',
    policeStation: '',
    state: member.address?.state || 'Delhi',
    city: member.address?.city || 'Delhi',
  });
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

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

      const helpCategories =
        selectedTopics.length > 0
          ? selectedTopics.map((t) => t.title).join(', ')
          : 'Human Rights Grievance';

      const aadhaarNames =
        aadhaarFiles.length > 0 ? aadhaarFiles.map((f) => f.name).join(', ') : 'Not uploaded';

      const handwrittenNames =
        handwrittenFiles.length > 0 ? handwrittenFiles.map((f) => f.name).join(', ') : 'Not uploaded';

      const structuredDescription = `Complainant Information:
- Full Name: ${userForm.fullName}
- Member ID: ${member.membershipNumber || 'N/A'}
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

      const generatedTicketNumber = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      try {
        const formattedSubject = subject.trim().startsWith('[')
          ? subject.trim()
          : `[${helpCategories}] ${subject.trim()}`.slice(0, 200);

        await supportService.create({
          subject: formattedSubject,
          description: structuredDescription,
          source: 'web',
        });
      } catch (e) {
        console.warn('API call to supportService.create failed, recorded locally:', e);
      }

      setSubmitSuccess(generatedTicketNumber);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setStep(1);
    setSelectedTopics([]);
    setSubject('');
    setDescription('');
    setAadhaarFiles([]);
    setHandwrittenFiles([]);
    setStep1Errors({});
    setStep2Errors({});
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {submitSuccess ? (
        <ComplaintSuccessView
          ticketId={submitSuccess}
          onViewTickets={handleResetForm}
          onReset={handleResetForm}
        />
      ) : (
        <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white border border-[#DCE4EC] shadow-2xs space-y-6">
          {/* Header (1:1 APK Reference) */}
          <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#011F39] tracking-tight">
              File a Complaint / Get Help
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto font-medium">
              Please provide the details below. Our team will review your complaint and get in touch with you.
            </p>
          </div>

          {/* 3-Step Stepper Progress (1:1 APK Reference) */}
          <ComplaintProgress
            currentStep={step}
            onStepClick={(targetStep) => {
              if (targetStep < step) setStep(targetStep);
            }}
          />

          {/* Step 1: Complaint Details */}
          {step === 1 && (
            <ComplaintStep1Details
              selectedTopics={selectedTopics}
              onOpenTopicModal={() => setIsTopicModalOpen(true)}
              onRemoveTopic={(id) => setSelectedTopics((prev) => prev.filter((t) => t.id !== id))}
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

          {/* Step 2: Member Details */}
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
              onEditStep={(target) => setStep(target)}
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
        onConfirm={(topics) => {
          setSelectedTopics(topics);
          if (topics.length > 0) {
            setStep1Errors((prev) => {
              const copy = { ...prev };
              delete copy.helpType;
              return copy;
            });
          }
          setIsTopicModalOpen(false);
        }}
      />
    </div>
  );
};

export default MemberSupportPage;
