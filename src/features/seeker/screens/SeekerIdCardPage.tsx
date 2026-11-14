import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Printer,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/store/authStore';
import { SeekerApkIdCard } from '../components/SeekerApkIdCard';
import { generateQrMatrix } from '@/features/admin/profile/utils/qrGenerator';

export const SeekerIdCardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fullName = user?.full_name || 'HRSJM Test Seeker';
  const roleSubtitle = 'User';
  // In Image 2, the Member ID row displays "Member ID        :" with the ID value or blank if not assigned yet
  const seekerId = (user as any)?.member_id || (user as any)?.seeker_id || '';
  const validTill = '10 Nov 2027';
  const joinedOn = '12 Sept 2026';
  const status = 'Active';

  const effectiveQrData = seekerId || `HRSJM-SEK-${(user?.id || '4004').slice(-4).toUpperCase()}`;
  const modalQrMatrix = React.useMemo(() => generateQrMatrix(effectiveQrData, 29), [effectiveQrData]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>HRSJM Official ID Card - ${fullName}</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 24px; background: #FAF7F0; color: #06294D; text-align: center; }
            .header-info { margin-bottom: 24px; }
            .header-info h1 { font-size: 20px; font-weight: 800; color: #06294D; margin: 0 0 4px; text-transform: uppercase; }
            .header-info p { font-size: 12px; color: #64748B; margin: 0; }
            .card-container { display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 0 auto; max-width: 480px; }
            .id-card { width: 100%; aspect-ratio: 85.6 / 54; background-color: #031735; border-radius: 18px; position: relative; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.15); border: 1.5px solid #CAA048; text-align: left; }
            .cream-plate { position: absolute; top: 0; left: 0; width: 71%; height: 33%; background: #FAF5EA; border-bottom-right-radius: 24px; border-bottom: 1.5px solid #CAA048; border-right: 1.5px solid #CAA048; display: flex; align-items: center; padding: 0 16px; box-sizing: border-box; }
            .logo-wrap { width: 40px; height: 40px; margin-right: 10px; display: flex; align-items: center; justify-content: center; }
            .logo-wrap img { width: 100%; height: 100%; object-fit: contain; }
            .org-title { font-family: Georgia, serif; font-weight: 900; font-size: 15px; color: #082046; line-height: 1; }
            .org-sub { font-size: 7.5px; font-weight: 800; color: #082046; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; }
            .org-hi { font-size: 8.5px; font-weight: 700; color: #082046; margin-top: 3px; }
            .status-badge { position: absolute; top: 14px; right: 16px; background: #1E6539; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 10px; border-radius: 9999px; }
            .body-content { position: absolute; bottom: 0; left: 0; right: 0; height: 67%; padding: 0 20px 14px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; }
            .name { font-size: 18px; font-weight: 800; color: #FFFFFF; line-height: 1.2; margin: 0; }
            .role { font-size: 11px; font-weight: 700; color: #E5B842; margin-top: 2px; margin-bottom: 8px; }
            .info-row { font-size: 9.5px; color: #FFFFFF; display: flex; align-items: center; margin-bottom: 3px; }
            .info-label { width: 62px; color: rgba(255,255,255,0.85); }
            .info-colon { margin-right: 6px; }
            .info-val { font-weight: 600; }
            .qr-plate { background: #FFFFFF; padding: 4px; border-radius: 10px; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center; }
            .qr-wrap { display: flex; flex-direction: column; align-items: center; }
            .tap-text { font-size: 8px; color: #FFFFFF; opacity: 0.9; margin-top: 4px; }
            .card-back { background: #06214A; color: #FFFFFF; padding: 18px; border-radius: 18px; border: 1.5px solid #CAA048; aspect-ratio: 85.6 / 54; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; text-align: left; }
            .back-head { text-align: center; border-bottom: 1px solid rgba(202,160,72,0.3); padding-bottom: 8px; }
            .back-title { font-size: 10px; font-weight: 800; color: #FAD465; text-transform: uppercase; }
            .back-sub { font-size: 8px; color: #CBD5E1; }
            .back-body { font-size: 8.5px; color: #E2E8F0; line-height: 1.6; padding: 10px 0; }
            .back-foot { border-top: 1px solid rgba(202,160,72,0.3); padding-top: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 8px; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <h1>Human Rights & Social Justice Mission</h1>
            <p>Official Digital Identification Pass • Registered Act XXI of 1860</p>
          </div>

          <div class="card-container">
            <!-- Front Face -->
            <div class="id-card">
              <div class="cream-plate">
                <div class="logo-wrap">
                  <img src="/assets/images/hrsjm_logo.png" alt="HRSJM" onerror="this.style.display='none'" />
                </div>
                <div>
                  <div class="org-title">HRSJM</div>
                  <div class="org-sub">HUMAN RIGHTS & SOCIAL JUSTICE MISSION</div>
                  <div class="org-hi">मानव अधिकार • सामाजिक न्याय</div>
                </div>
              </div>

              <div class="status-badge">${status}</div>

              <div class="body-content">
                <div>
                  <div class="name">${fullName}</div>
                  <div class="role">${roleSubtitle}</div>
                  <div class="info-row">
                    <span class="info-label">Member ID</span>
                    <span class="info-colon">:</span>
                    <span class="info-val">${seekerId}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Valid Till</span>
                    <span class="info-colon">:</span>
                    <span class="info-val">${validTill}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Joined On</span>
                    <span class="info-colon">:</span>
                    <span class="info-val">${joinedOn}</span>
                  </div>
                </div>

                <div class="qr-wrap">
                  <div class="qr-plate">
                    <svg viewBox="0 0 25 25" width="60" height="60">
                      <rect width="25" height="25" fill="#FFFFFF" />
                      <rect x="2" y="2" width="7" height="7" fill="#06294D" />
                      <rect x="3" y="3" width="5" height="5" fill="#FFFFFF" />
                      <rect x="4" y="4" width="3" height="3" fill="#06294D" />
                      <rect x="16" y="2" width="7" height="7" fill="#06294D" />
                      <rect x="17" y="3" width="5" height="5" fill="#FFFFFF" />
                      <rect x="18" y="4" width="3" height="3" fill="#06294D" />
                      <rect x="2" y="16" width="7" height="7" fill="#06294D" />
                      <rect x="3" y="17" width="5" height="5" fill="#FFFFFF" />
                      <rect x="4" y="18" width="3" height="3" fill="#06294D" />
                      <rect x="11" y="4" width="3" height="3" fill="#06294D" />
                      <rect x="11" y="10" width="3" height="5" fill="#06294D" />
                      <rect x="16" y="11" width="5" height="2" fill="#06294D" />
                      <rect x="16" y="16" width="4" height="4" fill="#06294D" />
                      <rect x="21" y="18" width="2" height="4" fill="#06294D" />
                    </svg>
                  </div>
                  <span class="tap-text">Official Scan</span>
                </div>
              </div>
            </div>

            <!-- Back Face -->
            <div class="card-back">
              <div class="back-head">
                <div class="back-title">Central Registry & Verification</div>
                <div class="back-sub">National Secretariat, New Delhi, India • Regd. Act XXI of 1860</div>
              </div>
              <div class="back-body">
                <div><strong>Terms & Mandate:</strong></div>
                <div>• Certifies official humanitarian pass in HRSJM.</div>
                <div>• Authorized for verified civic and emergency aid.</div>
                <div>• Non-transferable; subject to periodic re-validation.</div>
                <div style="margin-top: 6px; color: #FAD465;">Helpline: +91 11 2345 6789</div>
              </div>
              <div class="back-foot">
                <div>
                  <div style="font-weight: 700;">National President</div>
                  <div style="color: #94A3B8;">HRSJM Governing Council</div>
                </div>
                <div style="background: rgba(202,160,72,0.2); padding: 3px 8px; border-radius: 4px; color: #FAD465; font-weight: 700;">
                  ★ OFFICIAL ACCREDITED ★
                </div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Top Navigation & Action Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/seeker/profile')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2F52] hover:text-[#06294D] transition cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to Profile</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFlipped((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#06294D] border border-[#CBD5E1] text-xs font-bold rounded-lg hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            title="Flip Card View"
          >
            <RefreshCw size={13} />
            <span>Flip ({isFlipped ? 'Show Front' : 'Show Back'})</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#06294D] text-[#FAD465] text-xs font-bold rounded-lg hover:bg-[#123F68] transition cursor-pointer shadow-xs"
          >
            <Printer size={13} />
            <span>Print / Save ID</span>
          </button>
        </div>
      </div>

      {/* 1:1 APK ID Card Section */}
      <div className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center gap-2 px-1">
          <CreditCard size={18} className="text-[#06294D]" />
          <h1 className="text-base sm:text-lg font-bold font-['Playfair_Display',Georgia,serif] text-[#06294D]">
            My ID Card
          </h1>
        </div>

        {/* 1:1 APK Mobile ID Card Component */}
        <div className="flex justify-center" id="printable-seeker-id-card">
          <SeekerApkIdCard
            fullName={fullName}
            roleSubtitle={roleSubtitle}
            seekerId={seekerId}
            validTill={validTill}
            joinedOn={joinedOn}
            status={status}
            interactive={true}
            allowFlip={true}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((prev) => !prev)}
            onQrClick={() => setQrModalOpen(true)}
            className="w-full"
          />
        </div>

        {/* Interaction Hint */}
        <p className="text-[11px] text-center text-[#718096] pt-1">
          Click or tap the card to flip between Front Identification and Regulatory Back Side • Tap QR code to enlarge
        </p>
      </div>

      {/* Verified Credential Details Summary Card */}
      <div className="bg-white rounded-2xl border border-[#DCE4EC] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#10B981]" />
            <h2 className="text-sm font-bold text-[#0B2F52]">Official Identification Summary</h2>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
            <CheckCircle2 size={12} />
            <span>Active &amp; Verified</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">
              Beneficiary Name
            </span>
            <span className="font-bold text-[#0B2F52] mt-0.5 block">{fullName}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">
              Classification
            </span>
            <span className="font-bold text-[#C9971A] mt-0.5 block">{roleSubtitle} (Donation Seeker)</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">
              Registered ID
            </span>
            <span className="font-mono font-bold text-[#0B2F52] mt-0.5 block">
              {effectiveQrData}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">
              Registered State
            </span>
            <span className="font-bold text-[#0B2F52] mt-0.5 block">
              {user?.state || 'Maharashtra'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">
              City / Center
            </span>
            <span className="font-bold text-[#0B2F52] mt-0.5 block">
              {user?.city || 'Mumbai Central'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">
              Helpline
            </span>
            <span className="font-bold text-[#0B2F52] mt-0.5 block">1800-HRSJM-AID</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#718096]">
          <span className="flex items-center gap-1.5">
            <Phone size={13} className="text-[#0B2F52]" />
            <span>24x7 Verification Desk: +91 98888 80004</span>
          </span>
          <span className="font-medium text-slate-500">
            Regd. under Societies Registration Act XXI of 1860
          </span>
        </div>
      </div>

      {/* Enlarged QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 text-center">
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#06294D] text-[#FAD465] mx-auto flex items-center justify-center mb-3 shadow-md">
              <ShieldCheck size={26} />
            </div>

            <h3 className="text-base font-bold text-[#06294D]">
              HRSJM Official Verification Pass
            </h3>
            <p className="text-xs text-[#718096] mt-1 mb-4">
              Scan with camera or verification scanner to inspect authentic citizen record
            </p>

            <div className="p-3 bg-white border-2 border-[#E2E8F0] rounded-2xl shadow-inner inline-block mb-4">
              <svg
                width="180"
                height="180"
                viewBox="0 0 29 29"
                className="block mx-auto"
              >
                <rect width="29" height="29" fill="#FFFFFF" />
                {modalQrMatrix.map((row: boolean[], r: number) =>
                  row.map((filled: boolean, c: number) =>
                    filled ? (
                      <rect
                        key={`${r}-${c}`}
                        x={c}
                        y={r}
                        width="1"
                        height="1"
                        fill="#06294D"
                      />
                    ) : null
                  )
                )}
              </svg>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-[#06294D] text-sm">{fullName}</div>
              <div className="font-mono text-[#C9971A] font-bold">{effectiveQrData}</div>
              <div className="text-[11px] text-emerald-600 font-bold pt-1">
                Active &amp; Authenticated Seeker
              </div>
            </div>

            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#06294D] hover:bg-[#123F68] text-white text-xs font-bold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
