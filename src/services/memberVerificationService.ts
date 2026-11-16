/**
 * Real-Time Member Verification Service
 * Communicates with backend endpoints for public QR and Barcode verification.
 */

export type CardValidityStatus = 'VALID' | 'EXPIRED' | 'SUSPENDED' | 'INVALID' | 'PENDING';

export interface MemberVerificationData {
  memberId: string;
  memberName: string;
  membershipType: string;
  membershipStatus: string;
  renewalStatus: string;
  cardValidity: CardValidityStatus;
  expiryDate: string;
  joiningDate?: string | null;
  verificationToken?: string;
  verified: boolean;
  message?: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  data: MemberVerificationData;
}

class MemberVerificationService {
  /**
   * Verify member status by token or Member ID
   */
  async verifyMember(token: string): Promise<MemberVerificationData> {
    if (!token || !token.trim()) {
      return this.getInvalidResult('Missing verification token');
    }

    const cleanToken = encodeURIComponent(token.trim());

    try {
      // 1. Primary endpoint: /api/v1/members/verify/:token
      const res = await fetch(`/api/v1/members/verify/${cleanToken}`, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json: VerificationResponse = await res.json();
        if (json?.data) {
          return this.normalizeData(json.data);
        }
      }

      // 2. Secondary endpoint / fallback: /api/v1/membership-id/verify/:token
      const res2 = await fetch(`/api/v1/membership-id/verify/${cleanToken}`, {
        headers: { Accept: 'application/json' },
      });

      if (res2.ok) {
        const json2: VerificationResponse = await res2.json();
        if (json2?.data) {
          return this.normalizeData(json2.data);
        }
      }

      // 3. Fallback to existing /api/v1/membership-id/:token/validate if backend is on legacy build
      const resValidate = await fetch(`/api/v1/membership-id/${cleanToken}/validate`, {
        headers: { Accept: 'application/json' },
      });

      if (resValidate.ok) {
        const validateJson = await resValidate.json();
        const vData = validateJson?.data || validateJson;
        if (vData && (vData.memberName || vData.status)) {
          const isDateExpired = vData.expiryDate ? new Date(vData.expiryDate) < new Date() : false;
          let validity: CardValidityStatus = 'VALID';
          let memStatus = vData.status || 'ACTIVE';
          let renewalStatus = 'CURRENT';

          if (vData.status === 'SUSPENDED') {
            validity = 'SUSPENDED';
            memStatus = 'SUSPENDED';
          } else if (vData.status === 'EXPIRED' || isDateExpired) {
            validity = 'EXPIRED';
            memStatus = 'EXPIRED';
            renewalStatus = 'RENEWAL_REQUIRED';
          } else if (vData.status === 'ACTIVE' && vData.valid !== false) {
            validity = 'VALID';
            memStatus = 'ACTIVE';
          } else if (vData.status === 'PENDING') {
            validity = 'PENDING';
            memStatus = 'PENDING';
          } else {
            validity = 'INVALID';
            memStatus = vData.status || 'INVALID';
          }

          return {
            memberId: token,
            memberName: vData.memberName || 'Registered Member',
            membershipType: vData.category || 'General Member',
            membershipStatus: memStatus,
            renewalStatus,
            cardValidity: validity,
            expiryDate: vData.expiryDate
              ? new Date(vData.expiryDate).toISOString().split('T')[0]
              : 'Lifetime',
            verified: validity === 'VALID',
          };
        }
      }

      return this.getInvalidResult(`No registered member found matching "${token}".`);
    } catch (err: any) {
      console.error('Verification request failed:', err);
      return this.getInvalidResult('Unable to reach verification server. Please try again.');
    }
  }

  private normalizeData(raw: any): MemberVerificationData {
    return {
      memberId: raw.memberId || 'HRSJM-MEMBER',
      memberName: raw.memberName || 'Registered Member',
      membershipType: raw.membershipType || 'General Member',
      membershipStatus: raw.membershipStatus || 'ACTIVE',
      renewalStatus: raw.renewalStatus || 'NOT_REQUIRED',
      cardValidity: (raw.cardValidity || (raw.verified ? 'VALID' : 'INVALID')) as CardValidityStatus,
      expiryDate: raw.expiryDate || 'Lifetime',
      joiningDate: raw.joiningDate || null,
      verificationToken: raw.verificationToken || raw.memberId,
      verified: Boolean(raw.verified),
      message: raw.message,
    };
  }

  private getInvalidResult(reason: string): MemberVerificationData {
    return {
      memberId: 'UNRECOGNIZED',
      memberName: 'Unknown Member',
      membershipType: 'N/A',
      membershipStatus: 'INVALID',
      renewalStatus: 'N/A',
      cardValidity: 'INVALID',
      expiryDate: 'N/A',
      verified: false,
      message: reason,
    };
  }
}

export const memberVerificationService = new MemberVerificationService();
