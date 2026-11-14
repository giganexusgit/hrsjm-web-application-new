/**
 * Member Registration & Application Module - Types
 * Exact counterpart of APK: hrsjm-application-ui/src/features/membership/types/membership.types.ts
 * and Backend: HRSJM-back-api/src/modules/memberships/
 */

export interface MembershipPostData {
  id: string;
  slug?: string;
  postName: string;
  level: 'district' | 'state' | 'executive' | 'national';
  qualification: string;
  fee: string;
  feeAmount: number;
  validity: string;
  durationLabel?: string;
  checklistItems: string[];
  kitItems: string[];
  badgeColor?: string;
  iconType:
    | 'user'
    | 'community'
    | 'hierarchy'
    | 'state'
    | 'crown'
    | 'counselor'
    | 'shield'
    | 'director'
    | 'scale'
    | 'minority'
    | 'women'
    | 'political';
  iconBgColor: string;
  buttonVariant: 'gold' | 'navy' | 'green';
}

export interface PersonalInfoForm {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  countryCode: string;
  email: string;
  policeStation: string;
  password: string;
  confirmPassword: string;
  profilePhotoUri?: string;
  profilePhotoName?: string;
}

export interface AddressInfoForm {
  addressLine1: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
}

export interface UploadedDocumentItem {
  type: 'identity' | 'address' | 'qualification' | 'photo';
  name: string;
  fileName: string;
  fileSize: string;
  isUploaded: boolean;
  fileUri?: string;
  dataUrl?: string;
}

export interface DocumentsForm {
  identityProof?: UploadedDocumentItem;
  addressProof?: UploadedDocumentItem;
  qualificationProof?: UploadedDocumentItem;
  photograph?: UploadedDocumentItem;
}

export interface MemberRegistrationDraft {
  selectedPost: MembershipPostData;
  personal: PersonalInfoForm;
  address: AddressInfoForm;
  documents: DocumentsForm;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreePledge: boolean;
}

export interface CreateMembershipApiPayload {
  category_id: string;
  user_id?: string;
  full_name: string;
  mobile_number: string;
  email: string;
  password: string;
  police_station: string;
  avatar?: string;
  personal_details: {
    dob: string;
    dateOfBirth: string;
    gender: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  application_data: {
    appliedPostName: string;
    feeAmount: number;
    fee: string;
    validity: string;
    qualification: string;
    documents: Array<{
      type: string;
      title: string;
      fileName: string;
      fileSize: string;
      fileUri?: string;
    }>;
    consents: {
      agreeTerms: boolean;
      agreePrivacy: boolean;
      agreePledge: boolean;
    };
    payment?: {
      orderId?: string;
      transactionId?: string;
      receiptNumber?: string;
      method?: string;
      amount?: number;
      status?: string;
      paidAt?: string;
    };
  };
}

export interface SubmittedMembershipRecord {
  id: string;
  applicationId: string;
  applicantName: string;
  email: string;
  mobileNumber: string;
  postName: string;
  feeAmount: number;
  fee: string;
  status: 'under_review' | 'submitted' | 'active' | 'approved' | 'rejected';
  submittedAt: string;
  submittedDate: string;
}

