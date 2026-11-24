import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Upload,
  User,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { useMembershipApply } from '../store/membershipApplyStore';
import { useAuth } from '../../auth/store/authStore';
import { GlobalPaymentModal } from '../../payments';

export const MembershipApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentStep,
    setStep,
    formData,
    updatePersonal,
    updateAddress,
    updateDocuments,
    submitApplication,
    isSubmitting,
  } = useMembershipApply();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [previewAppId] = useState(() => `HRSJM-APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  // ════════ VALIDATION LOGIC ════════
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.personal.fullName.trim()) errors.fullName = 'Full legal name is required';
    if (!formData.personal.fatherOrSpouseName.trim()) {
      errors.fatherOrSpouseName = "Father's or spouse's name is required";
    }
    if (!formData.personal.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthYear = new Date(formData.personal.dateOfBirth).getFullYear();
      const thisYear = new Date().getFullYear();
      if (thisYear - birthYear < 18) {
        errors.dateOfBirth = 'Must be at least 18 years of age to apply for adult membership';
      }
    }
    const cleanPhone = formData.personal.mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) errors.mobileNumber = 'Mobile number must be exactly 10 digits';
    const cleanEmergency = formData.address.emergencyContactPhone?.replace(/\D/g, '').slice(-10);
    if (formData.address.emergencyContactPhone?.trim() && cleanEmergency?.length !== 10) {
      errors.emergencyContactPhone = 'Emergency phone must be exactly 10 digits';
    }
    if (!formData.personal.email.trim() || !formData.personal.email.includes('@')) {
      errors.email = 'Valid email address is required';
    }
    if (!formData.personal.occupation.trim()) errors.occupation = 'Occupation is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.address.addressLine.trim()) errors.addressLine = 'Street address line is required';
    if (!formData.address.state.trim()) errors.state = 'State is required';
    if (!formData.address.district.trim()) errors.district = 'District is required';
    if (!formData.address.pinCode.trim() || formData.address.pinCode.length < 6) {
      errors.pinCode = 'Valid 6-digit PIN code is required';
    }
    if (!formData.address.proposedChapter.trim()) {
      updateAddress({ proposedChapter: `${formData.address.state || 'National'} Chapter Unit` });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.documents.idProofNumber.trim()) {
      errors.idProofNumber = 'Identity proof document number is required';
    }
    if (!formData.documents.agreedToCharter) {
      errors.agreedToCharter = 'You must declare and accept the HRSJM Ethical Charter to proceed';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setStep(4); // Review
    }
  };

  const handleFileSimulate = (field: 'photo' | 'idProof' | 'signature', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (field === 'photo') {
        updatePersonal({ photoUrl: dataUrl, photoFileName: file.name });
      } else if (field === 'idProof') {
        updateDocuments({ idProofFileUrl: dataUrl, idProofFileName: file.name });
      } else if (field === 'signature') {
        updateDocuments({ signatureFileUrl: dataUrl, signatureFileName: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setIsPaymentModalOpen(true);
  };

  return (
    <div style={styles.container}>
      {/* Top Breadcrumb & Post Header */}
      <div style={styles.headerBar}>
        <button
          type="button"
          onClick={() => (currentStep > 1 ? setStep(currentStep - 1) : navigate('/membership/categories'))}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} />
          <span>{currentStep > 1 ? 'Previous Step' : 'Change Post / Tier'}</span>
        </button>

        <div style={styles.postChip}>
          <span style={styles.postChipLabel}>Applying for:</span>
          <strong style={styles.postChipVal}>{formData.selectedPost.postName}</strong>
          <span style={styles.postChipFee}>({formData.selectedPost.fee} / {formData.selectedPost.validity})</span>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div style={styles.stepperContainer}>
        <div style={styles.stepperTrack}>
          {[
            { num: 1, label: 'Personal Info', icon: User },
            { num: 2, label: 'Address & Chapter', icon: MapPin },
            { num: 3, label: 'KYC & Verification', icon: FileCheck },
            { num: 4, label: 'Review & Submit', icon: ShieldCheck },
          ].map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            const Icon = s.icon;
            return (
              <div key={s.num} style={styles.stepItem} onClick={() => s.num < currentStep && setStep(s.num)}>
                <div
                  style={{
                    ...styles.stepCircle,
                    backgroundColor: isDone ? '#16A34A' : isCurrent ? '#06294D' : '#EDF2F7',
                    color: isDone ? '#FFFFFF' : isCurrent ? '#FAD465' : '#718096',
                    borderColor: isCurrent ? '#FAD465' : isDone ? '#16A34A' : '#DCE4EC',
                  }}
                >
                  {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>
                <span
                  style={{
                    ...styles.stepLabel,
                    color: isCurrent ? '#06294D' : isDone ? '#16A34A' : '#718096',
                    fontWeight: isCurrent ? 700 : 500,
                  }}
                >
                  Step {s.num}: {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div style={styles.formCard}>
        {/* ════════════ STEP 1: PERSONAL INFORMATION ════════════ */}
        {currentStep === 1 && (
          <div style={styles.stepContent}>
            <div style={styles.stepHeader}>
              <h2 style={styles.stepTitle}>Step 1: Personal & Contact Details</h2>
              <p style={styles.stepSub}>Enter your exact legal credentials as registered on government identity documents.</p>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  Full Legal Name <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adv. Rajeshwar Sharma"
                  value={formData.personal.fullName}
                  onChange={(e) => updatePersonal({ fullName: e.target.value })}
                  style={styles.input}
                />
                {formErrors.fullName && <span style={styles.err}>{formErrors.fullName}</span>}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  Father's or Spouse's Name <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Late Pt. Harishankar Sharma"
                  value={formData.personal.fatherOrSpouseName}
                  onChange={(e) => updatePersonal({ fatherOrSpouseName: e.target.value })}
                  style={styles.input}
                />
                {formErrors.fatherOrSpouseName && (
                  <span style={styles.err}>{formErrors.fatherOrSpouseName}</span>
                )}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  Date of Birth <span style={styles.req}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.personal.dateOfBirth}
                  onChange={(e) => updatePersonal({ dateOfBirth: e.target.value })}
                  style={styles.input}
                />
                {formErrors.dateOfBirth && <span style={styles.err}>{formErrors.dateOfBirth}</span>}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>Gender</label>
                <select
                  value={formData.personal.gender}
                  onChange={(e) => updatePersonal({ gender: e.target.value as any })}
                  style={styles.input}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  Mobile Number (SMS & OTP alerts) <span style={styles.req}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={formData.personal.mobileNumber}
                  onChange={(e) => updatePersonal({ mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  style={styles.input}
                />
                {formErrors.mobileNumber && <span style={styles.err}>{formErrors.mobileNumber}</span>}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  Email Address <span style={styles.req}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. rajeshwar@example.org"
                  value={formData.personal.email}
                  onChange={(e) => updatePersonal({ email: e.target.value })}
                  style={styles.input}
                />
                {formErrors.email && <span style={styles.err}>{formErrors.email}</span>}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>Blood Group (Printed on official ID badge)</label>
                <select
                  value={formData.personal.bloodGroup}
                  onChange={(e) => updatePersonal({ bloodGroup: e.target.value })}
                  style={styles.input}
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  Occupation / Profession <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advocate, Teacher, Social Worker, Business"
                  value={formData.personal.occupation}
                  onChange={(e) => updatePersonal({ occupation: e.target.value })}
                  style={styles.input}
                />
                {formErrors.occupation && <span style={styles.err}>{formErrors.occupation}</span>}
              </div>
            </div>

            <div style={styles.bottomNavRow}>
              <button type="button" onClick={handleNext} style={styles.nextBtn}>
                <span>Continue to Address & Chapter</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════ STEP 2: ADDRESS & REGIONAL JURISDICTION ════════════ */}
        {currentStep === 2 && (
          <div style={styles.stepContent}>
            <div style={styles.stepHeader}>
              <h2 style={styles.stepTitle}>Step 2: Address & Regional Jurisdiction</h2>
              <p style={styles.stepSub}>Your proposed working area for human rights advocacy, legal aid, and chapter reporting.</p>
            </div>

            <div style={styles.formGrid}>
              <div style={{ ...styles.fieldCol, gridColumn: 'span 2' }}>
                <label style={styles.label}>
                  Residential Street Address <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="House/Flat number, building name, street or locality"
                  value={formData.address.addressLine}
                  onChange={(e) => updateAddress({ addressLine: e.target.value })}
                  style={styles.input}
                />
                {formErrors.addressLine && <span style={styles.err}>{formErrors.addressLine}</span>}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  State / Union Territory <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi, Uttar Pradesh, Maharashtra"
                  value={formData.address.state}
                  onChange={(e) => updateAddress({ state: e.target.value })}
                  style={styles.input}
                />
                {formErrors.state && <span style={styles.err}>{formErrors.state}</span>}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  District <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohini, Lucknow, Pune"
                  value={formData.address.district}
                  onChange={(e) => updateAddress({ district: e.target.value })}
                  style={styles.input}
                />
                {formErrors.district && <span style={styles.err}>{formErrors.district}</span>}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  Postal PIN Code <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit PIN code"
                  value={formData.address.pinCode}
                  onChange={(e) => updateAddress({ pinCode: e.target.value })}
                  style={styles.input}
                />
                {formErrors.pinCode && <span style={styles.err}>{formErrors.pinCode}</span>}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>
                  Proposed Working Chapter / Unit <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. National Capital Chapter, New Delhi"
                  value={formData.address.proposedChapter}
                  onChange={(e) => updateAddress({ proposedChapter: e.target.value })}
                  style={styles.input}
                />
                {formErrors.proposedChapter && (
                  <span style={styles.err}>{formErrors.proposedChapter}</span>
                )}
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>Emergency Contact Person</label>
                <input
                  type="text"
                  placeholder="Name of family member or relative"
                  value={formData.address.emergencyContactName}
                  onChange={(e) => updateAddress({ emergencyContactName: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldCol}>
                <label style={styles.label}>Emergency Contact Phone</label>
                <input
                  type="tel"
                  placeholder="10-digit emergency phone"
                  maxLength={10}
                  value={formData.address.emergencyContactPhone}
                  onChange={(e) => updateAddress({ emergencyContactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.bottomNavRow}>
              <button type="button" onClick={() => setStep(1)} style={styles.prevBtn}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button type="button" onClick={handleNext} style={styles.nextBtn}>
                <span>Continue to KYC & Documents</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════ STEP 3: IDENTITY & KYC UPLOADS ════════════ */}
        {currentStep === 3 && (
          <div style={styles.stepContent}>
            <div style={styles.stepHeader}>
              <h2 style={styles.stepTitle}>Step 3: Identity Proof & Specimen Signature</h2>
              <p style={styles.stepSub}>Attach verified identity documents for scrutiny by the State Accreditation Directorate.</p>
            </div>

            <div style={styles.docsSection}>
              {/* 1. Passport Photo */}
              <div style={styles.uploadBlock}>
                <div style={styles.uploadInfo}>
                  <div style={styles.uploadTitle}>1. Passport Size Color Photograph</div>
                  <div style={styles.uploadDesc}>Clear face picture with light background. Will be printed directly on your official digital & PVC ID badge.</div>
                  {formData.personal.photoFileName && (
                    <div style={styles.fileAttached}>✓ Attached: {formData.personal.photoFileName}</div>
                  )}
                </div>
                <div style={styles.uploadAction}>
                  {formData.personal.photoUrl ? (
                    <img src={formData.personal.photoUrl} alt="Preview" style={styles.photoThumb} />
                  ) : null}
                  <label style={styles.uploadFileLabel}>
                    <Upload size={14} />
                    <span>{formData.personal.photoUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSimulate('photo', e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* 2. Identity Proof Selection & Upload */}
              <div style={styles.uploadBlock}>
                <div style={styles.uploadInfo}>
                  <div style={styles.uploadTitle}>2. Government Identity Proof Document</div>
                  <div style={styles.idChoiceRow}>
                    <select
                      value={formData.documents.idProofType}
                      onChange={(e) => updateDocuments({ idProofType: e.target.value as any })}
                      style={styles.selectSmall}
                    >
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="voter_id">Voter Identity Card</option>
                      <option value="passport">Passport</option>
                      <option value="pan">PAN Card</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Enter Document / Aadhaar / Voter No."
                      value={formData.documents.idProofNumber}
                      onChange={(e) => updateDocuments({ idProofNumber: e.target.value })}
                      style={styles.inputSmall}
                    />
                  </div>
                  {formErrors.idProofNumber && (
                    <span style={styles.err}>{formErrors.idProofNumber}</span>
                  )}
                  {formData.documents.idProofFileName && (
                    <div style={styles.fileAttached}>✓ Attached: {formData.documents.idProofFileName}</div>
                  )}
                </div>

                <div style={styles.uploadAction}>
                  <label style={styles.uploadFileLabel}>
                    <Upload size={14} />
                    <span>Upload ID Document</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileSimulate('idProof', e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* 3. Specimen Signature */}
              <div style={styles.uploadBlock}>
                <div style={styles.uploadInfo}>
                  <div style={styles.uploadTitle}>3. Specimen Signature Upload</div>
                  <div style={styles.uploadDesc}>Sign on white paper and upload photograph or scanned image.</div>
                  {formData.documents.signatureFileName && (
                    <div style={styles.fileAttached}>✓ Attached: {formData.documents.signatureFileName}</div>
                  )}
                </div>

                <div style={styles.uploadAction}>
                  <label style={styles.uploadFileLabel}>
                    <Upload size={14} />
                    <span>Upload Signature</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSimulate('signature', e)}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* Charter Declaration Checkbox */}
              <div style={styles.charterBox}>
                <input
                  type="checkbox"
                  id="charterAgree"
                  checked={formData.documents.agreedToCharter}
                  onChange={(e) => updateDocuments({ agreedToCharter: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
                />
                <label htmlFor="charterAgree" style={styles.charterLabel}>
                  <strong>Declaration & Oath of Human Rights Service:</strong> I solemnly affirm that I have never been convicted by any criminal court, nor am I associated with banned unlawful activities. I pledge to uphold the Constitution of India and the aims, objectives, and ethical discipline of the Human Rights & Social Justice Mission.
                </label>
              </div>
              {formErrors.agreedToCharter && (
                <span style={styles.err}>{formErrors.agreedToCharter}</span>
              )}
            </div>

            <div style={styles.bottomNavRow}>
              <button type="button" onClick={() => setStep(2)} style={styles.prevBtn}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button type="button" onClick={handleNext} style={styles.nextBtn}>
                <span>Review & Final Submission</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════ STEP 4: REVIEW & CONFIRMATION ════════════ */}
        {currentStep === 4 && (
          <div style={styles.stepContent}>
            <div style={styles.stepHeader}>
              <h2 style={styles.stepTitle}>Step 4: Review Your Membership Application</h2>
              <p style={styles.stepSub}>Please verify your details carefully before submitting to the Accreditation Registry.</p>
            </div>

            <div style={styles.reviewSummaryGrid}>
              <div style={styles.reviewBox}>
                <div style={styles.reviewHeading}>Selected Post & Fees</div>
                <div style={styles.reviewRow}>
                  <span>Post Applied:</span>
                  <strong>{formData.selectedPost.postName}</strong>
                </div>
                <div style={styles.reviewRow}>
                  <span>Accreditation Fee:</span>
                  <strong style={{ color: '#06294D', fontSize: '16px' }}>{formData.selectedPost.fee}</strong>
                </div>
                <div style={styles.reviewRow}>
                  <span>Tenure / Validity:</span>
                  <strong>{formData.selectedPost.validity}</strong>
                </div>
              </div>

              <div style={styles.reviewBox}>
                <div style={styles.reviewHeading}>Applicant Information</div>
                <div style={styles.reviewRow}>
                  <span>Full Legal Name:</span>
                  <strong>{formData.personal.fullName}</strong>
                </div>
                <div style={styles.reviewRow}>
                  <span>Father's / Spouse's Name:</span>
                  <strong>{formData.personal.fatherOrSpouseName}</strong>
                </div>
                <div style={styles.reviewRow}>
                  <span>Phone & Email:</span>
                  <span>{formData.personal.mobileNumber} • {formData.personal.email}</span>
                </div>
                <div style={styles.reviewRow}>
                  <span>Date of Birth / Blood:</span>
                  <span>{formData.personal.dateOfBirth} • Blood: {formData.personal.bloodGroup}</span>
                </div>
              </div>

              <div style={{ ...styles.reviewBox, gridColumn: 'span 2' }}>
                <div style={styles.reviewHeading}>Regional Jurisdiction & Verification Proofs</div>
                <div style={styles.reviewRow}>
                  <span>Chapter / Working Unit:</span>
                  <strong>{formData.address.proposedChapter}</strong>
                </div>
                <div style={styles.reviewRow}>
                  <span>Residential Address:</span>
                  <span>{formData.address.addressLine}, {formData.address.district}, {formData.address.state} - {formData.address.pinCode}</span>
                </div>
                <div style={styles.reviewRow}>
                  <span>Identity Proof:</span>
                  <span>{formData.documents.idProofType.toUpperCase()} ({formData.documents.idProofNumber}) • Document Attached</span>
                </div>
              </div>
            </div>

            <div style={styles.bottomNavRow}>
              <button type="button" onClick={() => setStep(3)} style={styles.prevBtn}>
                <ArrowLeft size={16} />
                <span>Back to Edit</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  ...styles.submitFinalBtn,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? (
                  <span>Processing Application...</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Pay Fee via Cashfree & Submit ({formData.selectedPost.fee})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        {/* Official Cashfree Accreditation Payment Modal */}
      <GlobalPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        payload={{
          purpose: 'membership',
          amount: formData.selectedPost.feeAmount,
          title: `Membership Application: ${formData.selectedPost.postName}`,
          subtitle: `Tenure: ${formData.selectedPost.validity}`,
          entityId: formData.selectedPost.id,
          referenceId: previewAppId,
          userId: user?.id,
          donorName: formData.personal.fullName,
          donorMobile: formData.personal.mobileNumber,
          donorEmail: formData.personal.email,
          panNumber: formData.documents.idProofType === 'pan' ? formData.documents.idProofNumber : '',
        }}
        onSuccess={async (receipt) => {
          setIsPaymentModalOpen(false);
          const res = await submitApplication(receipt);
          if (res.success) {
            navigate('/membership/submitted');
          }
        }}
      />
    </div>
  </div>
);
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px 20px 64px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#06294D',
    cursor: 'pointer',
  },
  postChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FAF7F0',
    border: '1px solid #FAD465',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '12.5px',
  },
  postChipLabel: {
    color: '#718096',
  },
  postChipVal: {
    color: '#06294D',
  },
  postChipFee: {
    color: '#B45309',
    fontWeight: 600,
  },
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DCE4EC',
    padding: '16px 20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
  },
  stepperTrack: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  stepCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    fontSize: '13px',
    fontWeight: 700,
  },
  stepLabel: {
    fontSize: '13px',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    padding: '32px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  stepHeader: {
    borderBottom: '1px solid #EDF2F7',
    paddingBottom: '14px',
  },
  stepTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '22px',
    fontWeight: 700,
    color: '#0B2F52',
    margin: '0 0 6px 0',
  },
  stepSub: {
    fontSize: '13.5px',
    color: '#718096',
    margin: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '18px 24px',
  },
  fieldCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#0B2F52',
  },
  req: {
    color: '#DC2626',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    fontSize: '13.5px',
    color: '#06294D',
    outline: 'none',
  },
  err: {
    fontSize: '11.5px',
    color: '#DC2626',
  },
  bottomNavRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #EDF2F7',
    paddingTop: '20px',
    marginTop: '12px',
  },
  prevBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#06294D',
    cursor: 'pointer',
  },
  nextBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#06294D',
    color: '#FAD465',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 22px',
    fontSize: '13.5px',
    fontWeight: 700,
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  docsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  uploadBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#FAF7F0',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    flexWrap: 'wrap',
  },
  uploadInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '280px',
  },
  uploadTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0B2F52',
  },
  uploadDesc: {
    fontSize: '12px',
    color: '#718096',
    lineHeight: 1.4,
  },
  fileAttached: {
    fontSize: '12px',
    color: '#16A34A',
    fontWeight: 600,
    marginTop: '4px',
  },
  uploadAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  photoThumb: {
    width: '46px',
    height: '46px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '2px solid #FAD465',
  },
  uploadFileLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#06294D',
    cursor: 'pointer',
  },
  idChoiceRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px',
    flexWrap: 'wrap',
  },
  selectSmall: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '12.5px',
    color: '#06294D',
  },
  inputSmall: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '12.5px',
    color: '#06294D',
    flex: 1,
    minWidth: '200px',
  },
  charterBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#FFF9E6',
    border: '1px solid #FAD465',
    borderRadius: '10px',
    padding: '16px',
    marginTop: '8px',
  },
  charterLabel: {
    fontSize: '12.5px',
    color: '#06294D',
    lineHeight: 1.55,
    cursor: 'pointer',
  },
  reviewSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  reviewBox: {
    backgroundColor: '#FAF7F0',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  reviewHeading: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#06294D',
    borderBottom: '1px solid #CBD5E1',
    paddingBottom: '6px',
  },
  reviewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12.5px',
    color: '#4A5568',
    gap: '12px',
  },
  submitFinalBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 28px',
    fontSize: '14.5px',
    fontWeight: 700,
  },
};
