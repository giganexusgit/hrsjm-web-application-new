import type React from 'react';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { membersStore } from '../store/membersStore';
import { membersService } from '../services/membersService';
import { STANDARD_MEMBERSHIP_CATEGORIES } from '../data/membersFixtures';
import type { Member, MembershipCategoryItem } from '../types/members.types';

interface EditMemberPageFormProps {
  member: Member;
  categories: MembershipCategoryItem[];
}

const EditMemberPageForm: React.FC<EditMemberPageFormProps> = ({ member, categories }) => {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState(member.categoryId || '1');
  const [fullName, setFullName] = useState(member.name || '');
  const [phone, setPhone] = useState(member.phone && member.phone !== '—' ? member.phone : '');
  const [email, setEmail] = useState(member.email && member.email !== '—' ? member.email : '');
  const [gender, setGender] = useState(member.gender || 'Male');
  const [dob, setDob] = useState(member.dob || '');
  const [qualification, setQualification] = useState(member.qualification || '');
  const [fatherName, setFatherName] = useState(member.fatherName || '');
  const [address, setAddress] = useState(member.address || '');
  const [city, setCity] = useState(member.city || '');
  const [state, setState] = useState(member.state || '');
  const [pincode, setPincode] = useState(member.pincode || '');
  const [adminNotes, setAdminNotes] = useState(member.adminNotes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg('Mobile number must be exactly 10 digits.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await membersStore.updateMember(member.id, {
        category_id: categoryId,
        application_data: {
          full_name: fullName.trim(),
          mobile_number: phone.trim(),
          email: email.trim() || undefined,
          personal_details: {
            dob,
            gender,
            qualification,
            father_name: fatherName,
            address,
            city,
            state,
            pincode,
          },
        },
        admin_notes: adminNotes,
      });

      navigate(`/admin/members/${member.id}`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update member records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            fontSize: '13.5px',
            fontWeight: 500,
            marginBottom: '20px',
          }}
        >
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Mobile Number *</label>
          <input
            type="tel"
            required
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Membership Category / Post</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={inputStyle}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Personal Details */}
      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: '#011F39' }}>
          Personal Details
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={inputStyle}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Qualification</label>
            <input
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Father / Guardian Name</label>
            <input
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: '#011F39' }}>
          Residential & Postal Address
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Street Address / House No.</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Admin Remark */}
      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
        <label style={labelStyle}>Administrative Notes</label>
        <input
          type="text"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(`/admin/members/${member.id}`)}
          style={{
            padding: '10px 20px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: '#06294D',
            backgroundColor: '#EDF2F7',
            border: '1px solid #DCE4EC',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 700,
            color: '#011F39',
            backgroundColor: '#FAD465',
            border: 'none',
            borderRadius: '12px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(1, 31, 57, 0.08)',
          }}
        >
          <Save size={16} />
          <span>{isSubmitting ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>
    </form>
  );
};

export const EditMemberPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const storeSnapshot = useSyncExternalStore(
    membersStore.subscribe,
    membersStore.getSnapshot
  );

  const member = storeSnapshot.members.find((m) => m.id === id);

  const [categories, setCategories] = useState<MembershipCategoryItem[]>(STANDARD_MEMBERSHIP_CATEGORIES);

  useEffect(() => {
    membersService.getCategories().then((cats) => {
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
    });
  }, []);

  if (!member) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#DC2626" style={{ margin: '0 auto 12px auto' }} />
        <h2 style={{ color: '#011F39', margin: '0 0 8px 0' }}>Member Not Found</h2>
        <Link
          to="/admin/members"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#011F39',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: '13.5px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Members Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#6B7280',
        }}
      >
        <Link to="/admin/members" style={{ color: '#011F39', textDecoration: 'none', fontWeight: 600 }}>
          Members Directory
        </Link>
        <span>/</span>
        <Link to={`/admin/members/${member.id}`} style={{ color: '#011F39', textDecoration: 'none' }}>
          {member.name}
        </Link>
        <span>/</span>
        <span>Edit</span>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            backgroundColor: '#011F39',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate(`/admin/members/${member.id}`)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFFFFF',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                Edit Member: {member.name}
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#DBE5EE' }}>
                Update contact, qualification, address and administrative parameters
              </p>
            </div>
          </div>
        </div>

        {/* Subform with key={member.id} */}
        <EditMemberPageForm key={member.id} member={member} categories={categories} />
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12.5px',
  fontWeight: 600,
  color: '#06294D',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '13.5px',
  borderRadius: '12px',
  border: '1px solid #DCE4EC',
  backgroundColor: '#FFFFFF',
  color: '#011F39',
  outline: 'none',
  boxSizing: 'border-box',
};
