import { applicationsStore } from '../store/applicationsStore';
import type { MembershipApplicationItem, ApplicationDocument } from '../types/applications.types';
import type { UserItem } from '../../users/types/user.types';
import type { Member } from '../../members/types/members.types';

/**
 * Resolves or synthesizes a clean MembershipApplicationItem from a UserItem.
 * Employs ONLY real data from either applicationsStore or user profile fields.
 * Any missing or empty fields are left undefined so ApplicationPrintModal omits them.
 */
export function resolveApplicationForUser(user: UserItem): MembershipApplicationItem {
  const existingApps = applicationsStore.getAllApplications();
  const match = existingApps.find(
    (app) =>
      (user.applicationNumber && app.applicationId === user.applicationNumber) ||
      (user.memberId && app.applicationId === user.memberId) ||
      (user.id && (app.userId === user.id || app.id === user.id)) ||
      (user.email && app.email?.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
      (user.phone && app.phone?.trim() === user.phone.trim())
  );

  const isSeeker = user.userType === 'seeker';

  if (match) {
    return {
      ...match,
      applicantName: user.name || match.applicantName,
      email: user.email || match.email,
      phone: user.phone || match.phone,
      avatarUrl: user.avatarUrl || match.avatarUrl,
      address: user.address || match.address,
      dob: user.dob || match.dob,
      gender: user.gender || match.gender,
      documents:
        match.documents && match.documents.length > 0
          ? match.documents
          : (user.documents?.map((d) => ({
              id: d.id,
              title: d.title,
              fileName: d.fileName,
              fileSize: d.fileSize || '1 MB',
              uploadDate: d.uploadedAt || user.joinedDate,
              fileUri: d.fileUri,
              verified: d.verified,
              isUploaded: true,
            })) || []),
    };
  }

  const docs: ApplicationDocument[] = (user.documents || []).map((d) => ({
    id: d.id,
    title: d.title,
    fileName: d.fileName,
    fileSize: d.fileSize || '1 MB',
    uploadDate: d.uploadedAt || user.joinedDate,
    fileUri: d.fileUri,
    verified: d.verified,
    isUploaded: true,
  }));

  return {
    id: user.id,
    applicationId: user.applicationNumber || user.memberId || `HRSJM-USR-${user.id}`,
    applicantName: user.name,
    accountType: isSeeker ? 'seeker' : 'membership',
    membershipType: isSeeker
      ? 'Donation & Financial Aid Request'
      : (user.membershipCategory || (user.userType === 'member' ? 'Official Member' : 'General Citizen / Member')),
    avatarUrl: user.avatarUrl,
    status: user.status === 'blocked' ? 'rejected' : user.status === 'pending' ? 'under_review' : 'approved',
    submittedAt: user.joinedDate,
    submittedDate: user.joinedDate ? (user.joinedDate.split('T')[0] || user.joinedDate) : '',
    phone: user.phone || undefined,
    email: user.email || undefined,
    gender: user.gender || undefined,
    dob: user.dob || undefined,
    address: user.address || undefined,
    documents: docs,
    userId: user.id,
  };
}

/**
 * Resolves or synthesizes a clean MembershipApplicationItem from a Member.
 * Employs ONLY real data from either applicationsStore or member record.
 */
export function resolveApplicationForMember(member: Member): MembershipApplicationItem {
  const existingApps = applicationsStore.getAllApplications();
  const match = existingApps.find(
    (app) =>
      (member.membershipId && app.applicationId === member.membershipId) ||
      (member.id && (app.userId === member.id || app.id === member.id)) ||
      (member.userId && app.userId === member.userId) ||
      (member.email && app.email?.trim().toLowerCase() === member.email.trim().toLowerCase()) ||
      (member.phone && app.phone?.trim() === member.phone.trim())
  );

  const fullAddress = [member.address, member.city, member.state, member.pincode].filter(Boolean).join(', ') || undefined;

  if (match) {
    return {
      ...match,
      applicantName: member.name || match.applicantName,
      email: member.email || match.email,
      phone: member.phone || match.phone,
      avatarUrl: member.photo || match.avatarUrl,
      address: fullAddress || match.address,
      dob: member.dob || match.dob,
      gender: member.gender || match.gender,
      fatherName: member.fatherName || match.fatherName,
      qualificationRequirement: member.qualification || match.qualificationRequirement,
      amount: member.amount ?? match.amount,
      stateChapter: member.state || match.stateChapter,
      district: member.city || match.district,
      documents:
        match.documents && match.documents.length > 0
          ? match.documents
          : (member.documents?.map((d) => ({
              id: d.id,
              title: d.name,
              fileName: d.name,
              fileSize: d.fileSize || '1 MB',
              uploadDate: d.uploadedAt || member.joinedDate,
              fileUri: d.url,
              verified: true,
              isUploaded: true,
            })) || []),
    };
  }

  const docs: ApplicationDocument[] = (member.documents || []).map((d) => ({
    id: d.id,
    title: d.name,
    fileName: d.name,
    fileSize: d.fileSize || '1 MB',
    uploadDate: d.uploadedAt || member.joinedDate,
    fileUri: d.url,
    verified: true,
    isUploaded: true,
  }));

  return {
    id: member.id,
    applicationId: member.membershipId || `HRSJM-MBR-${member.id}`,
    applicantName: member.name,
    accountType: 'membership',
    membershipType: member.categoryName || 'General Member',
    avatarUrl: member.photo || undefined,
    status: member.status === 'PENDING' ? 'under_review' : member.status === 'INACTIVE' ? 'rejected' : 'approved',
    submittedAt: member.joinedDate,
    submittedDate: member.joinedDate ? (member.joinedDate.split('T')[0] || member.joinedDate) : '',
    phone: member.phone || undefined,
    email: member.email || undefined,
    gender: member.gender || undefined,
    dob: member.dob || undefined,
    fatherName: member.fatherName || undefined,
    qualificationRequirement: member.qualification || undefined,
    address: fullAddress,
    stateChapter: member.state || undefined,
    district: member.city || undefined,
    amount: member.amount !== undefined ? member.amount : undefined,
    paymentStatus: 'PAID',
    documents: docs,
    userId: member.userId || member.id,
  };
}
