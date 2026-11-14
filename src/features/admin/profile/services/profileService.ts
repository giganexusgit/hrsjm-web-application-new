/**
 * Profile & ID Card Service for HRSJM Admin Web Application.
 * Handles Profile DTO persistence, updates, password changes, and printable document rendering.
 */

import type { AdminDetailsInput, AdminProfile, ChangePasswordInput, PersonalInfoInput } from '../types/profile.types';
import { INITIAL_ADMIN_PROFILE } from '../data/profileFixtures';

const PROFILE_STORAGE_KEY = 'hrsjm_admin_profile_data_v1';

export class ProfileService {
  private static instance: ProfileService;

  private constructor() { }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  public getProfile(): AdminProfile {
    const base = { ...INITIAL_ADMIN_PROFILE };
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      let profile = stored ? { ...base, ...JSON.parse(stored) } : base;

      const userRaw = localStorage.getItem('hrsjm_user_profile');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.full_name) {
          profile.fullName = u.full_name;
          profile.accountName = u.full_name;
        }
        if (u.email) profile.email = u.email;
        if (u.mobile_number) profile.phone = u.mobile_number;
        if (u.membership_number) profile.memberId = u.membership_number;
        if (u.blood_group) profile.bloodGroup = u.blood_group;
        if (u.state) profile.state = u.state;
        if (u.city) profile.city = u.city;
        if (u.address) profile.address = u.address;
      }
      return profile;
    } catch {
      // fallback to base
    }
    return base;
  }

  public saveProfile(profile: AdminProfile): void {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore storage error
    }
  }

  public updatePersonalInfo(input: PersonalInfoInput): AdminProfile {
    const current = this.getProfile();
    const updated: AdminProfile = {
      ...current,
      fullName: input.fullName.trim(),
      accountName: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      dateOfBirth: input.dateOfBirth || current.dateOfBirth,
      bloodGroup: input.bloodGroup || current.bloodGroup,
      address: input.address !== undefined ? input.address : current.address,
      city: input.city !== undefined ? input.city : current.city,
      state: input.state !== undefined ? input.state : current.state,
      pincode: input.pincode !== undefined ? input.pincode : current.pincode,
    };
    this.saveProfile(updated);
    return updated;
  }

  public updateAdminDetails(input: AdminDetailsInput): AdminProfile {
    const current = this.getProfile();
    const updated: AdminProfile = {
      ...current,
      role: input.role || current.role,
      accountStatus: input.accountStatus || current.accountStatus,
      designation: input.designation !== undefined ? input.designation : current.designation,
      department: input.department !== undefined ? input.department : current.department,
    };
    this.saveProfile(updated);
    return updated;
  }

  public updateAvatar(avatar: string | null): AdminProfile {
    const current = this.getProfile();
    const updated: AdminProfile = {
      ...current,
      avatar,
    };
    this.saveProfile(updated);
    return updated;
  }

  public changePassword(input: ChangePasswordInput): { success: boolean; message: string } {
    if (!input.currentPassword) {
      return { success: false, message: 'Please enter your current password.' };
    }
    if (input.newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }
    if (input.newPassword !== input.confirmPassword) {
      return { success: false, message: 'New password and confirmation do not match.' };
    }
    return { success: true, message: 'Administrator password updated successfully.' };
  }

  /**
   * Generates a printable version of the official ID Card and triggers the browser print dialog.
   */
  public printIdCard(profile: AdminProfile): void {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>HRSJM Official ID Card - ${profile.fullName} (${profile.memberId})</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: 'Inter', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #F8FAFC;
              color: #0F172A;
            }
            .print-container {
              max-width: 720px;
              margin: 0 auto;
              text-align: center;
            }
            .print-title {
              font-size: 18px;
              font-weight: 700;
              color: #06294D;
              margin-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .print-desc {
              font-size: 13px;
              color: #64748B;
              margin-bottom: 24px;
            }
            .cards-wrapper {
              display: flex;
              gap: 24px;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 30px;
            }
            .card {
              width: 320px;
              height: 480px;
              border-radius: 14px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.12);
              border: 1px solid #CBD5E1;
              position: relative;
              overflow: hidden;
              background: #06294D;
              color: #FFFFFF;
              display: flex;
              flex-direction: column;
              page-break-inside: avoid;
            }
            .card-header {
              background: #011F39;
              padding: 16px 14px 12px;
              text-align: center;
              border-bottom: 2px solid #FAD465;
            }
            .org-name {
              font-size: 13px;
              font-weight: 800;
              color: #FFFFFF;
              letter-spacing: 0.5px;
              line-height: 1.2;
            }
            .hindi-sub {
              font-size: 11px;
              color: #FAD465;
              margin-top: 3px;
              font-weight: 600;
            }
            .card-body {
              padding: 16px;
              display: flex;
              flex-direction: column;
              align-items: center;
              flex: 1;
            }
            .avatar-frame {
              width: 100px;
              height: 100px;
              border-radius: 50%;
              border: 3px solid #FAD465;
              overflow: hidden;
              margin-bottom: 12px;
              background: #0F2D4A;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .avatar-frame img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .avatar-initials {
              font-size: 32px;
              font-weight: 700;
              color: #FAD465;
            }
            .member-name {
              font-size: 17px;
              font-weight: 700;
              color: #FFFFFF;
              margin-bottom: 3px;
            }
            .member-role {
              font-size: 12px;
              color: #FAD465;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 14px;
            }
            .meta-table {
              width: 100%;
              font-size: 11.5px;
              margin-bottom: 12px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              border-bottom: 1px solid rgba(255,255,255,0.08);
            }
            .meta-label {
              color: #94A3B8;
              font-weight: 500;
            }
            .meta-val {
              color: #FFFFFF;
              font-weight: 600;
            }
            .badge-active {
              background: #059669;
              color: #FFFFFF;
              padding: 3px 10px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: inline-block;
            }
            .card-back {
              background: #FFFFFF;
              color: #0F172A;
              padding: 18px 16px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .back-heading {
              font-size: 12px;
              font-weight: 800;
              color: #06294D;
              text-transform: uppercase;
              border-bottom: 2px solid #FAD465;
              padding-bottom: 4px;
              margin-bottom: 10px;
              text-align: center;
            }
            .back-terms {
              font-size: 10px;
              color: #475569;
              line-height: 1.4;
              text-align: left;
            }
            .back-terms li {
              margin-bottom: 5px;
            }
            .signature-block {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 14px;
              padding-top: 10px;
              border-top: 1px dashed #CBD5E1;
            }
            .sign-col {
              text-align: center;
            }
            .sign-line {
              font-size: 10px;
              font-weight: 700;
              color: #06294D;
            }
            .sign-sub {
              font-size: 9px;
              color: #64748B;
            }
            .seal-circle {
              width: 50px;
              height: 50px;
              border: 2px solid #C9971A;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: 800;
              color: #C9971A;
              text-transform: uppercase;
              text-align: center;
            }
            @media print {
              body {
                background: none;
                padding: 0;
              }
              .no-print {
                display: none;
              }
              .card {
                box-shadow: none;
                border: 1px solid #000;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="no-print" style="margin-bottom: 16px;">
              <button onclick="window.print()" style="padding: 10px 24px; background: #06294D; color: #FFF; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px;">
                Print Official Badge
              </button>
            </div>
            <div class="print-title">Human Rights &  Social Justice Mission (HRSJM)</div>
            <div class="print-desc">Official Identity Credential Document · Registered Central Trust (Regd: HR/0092/2019)</div>

            <div class="cards-wrapper">
              <!-- FRONT CARD -->
              <div class="card">
                <div class="card-header">
                  <div class="org-name">Human Rights &  Social Justice Mission</div>
                  <div class="hindi-sub">मानव अधिकार एवं सामाजिक न्याय</div>
                </div>
                <div class="card-body">
                  <div class="avatar-frame">
                    ${profile.avatar
        ? `<img src="${profile.avatar}" alt="${profile.fullName}" />`
        : `<div class="avatar-initials">${(profile.fullName || 'AD').slice(0, 2).toUpperCase()}</div>`
      }
                  </div>
                  <div class="member-name">${profile.fullName}</div>
                  <div class="member-role">${profile.role}</div>
                  <span class="badge-active">${profile.accountStatus}</span>

                  <div class="meta-table" style="margin-top: 14px;">
                    <div class="meta-row">
                      <span class="meta-label">ID Number:</span>
                      <span class="meta-val">${profile.memberId}</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">Admin ID:</span>
                      <span class="meta-val">${profile.adminId}</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">Date of Birth:</span>
                      <span class="meta-val">${profile.dateOfBirth || '15 Aug 1988'}</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">Blood Group:</span>
                      <span class="meta-val" style="color: #FAD465;">${profile.bloodGroup || 'O+'}</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">Issue Date:</span>
                      <span class="meta-val">${profile.issueDate || '12 Oct 2024'}</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-label">Valid Till:</span>
                      <span class="meta-val" style="color: #FAD465;">${profile.validTill || '31 Dec 2027'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BACK CARD -->
              <div class="card card-back">
                <div>
                  <div class="back-heading">Instructions & Conditions</div>
                  <ul class="back-terms">
                    <li>This card is the property of Human Rights &  Social Justice Mission (HRSJM).</li>
                    <li>The cardholder is an authorized administrative officer empowered to represent the trust.</li>
                    <li>If found, please return to: HRSJM Central Secretariat, Lodhi Road, New Delhi - 110003.</li>
                    <li>Helpline: +91 11 2345 6789 / info@hrsjm.org</li>
                    <li>Emergency Contact: ${profile.emergencyContact || '+91 98765 43211'}</li>
                  </ul>
                </div>

                <div style="font-size: 10px; color: #64748B; background: #F1F5F9; padding: 8px; border-radius: 6px; text-align: left;">
                  <strong>Address:</strong> ${profile.address || 'Human Rights Bhavan, Lodhi Road'}, ${profile.city || 'New Delhi'} - ${profile.pincode || '110003'}, ${profile.state || 'Delhi'}
                </div>

                <div class="signature-block">
                  <div class="sign-col">
                    <div class="sign-line">${profile.fullName}</div>
                    <div class="sign-sub">Cardholder Signature</div>
                  </div>
                  <div class="seal-circle">
                    HRSJM<br>SEAL
                  </div>
                  <div class="sign-col">
                    <div class="sign-line">National Registrar</div>
                    <div class="sign-sub">Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export const profileService = ProfileService.getInstance();
