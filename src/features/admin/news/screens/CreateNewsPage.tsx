import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Send,
  FileEdit,
  X,
  Upload,
} from 'lucide-react';
import { newsStore } from '../store/newsStore';
import {
  DEFAULT_NEWS_CATEGORIES,
  DEFAULT_NEWS_AUTHORS,
  type CreateNewsFormState,
  type CreateNewsFieldErrors,
} from '../types/news.types';
import { NewsPreviewModal } from '../components/NewsPreviewModal';

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const HEADLINE_MAX = 150;
const SLUG_MAX = 150;
const SUMMARY_MAX = 300;

export const CreateNewsPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateNewsFormState>(() => ({
    headline: '',
    slug: '',
    summary: '',
    content: '',
    featuredImageUri: null,
    author: 'HRSJM Team',
    category: 'Legal',
    tags: ['Human Rights', 'Community'],
    publishDate: new Date().toISOString().split('T')[0],
    publishTime: '09:00',
    status: 'PUBLISHED',
    allowComments: true,
  }));

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<CreateNewsFieldErrors>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((err) => ({ ...err, featuredImageUri: 'Please select a valid image file (PNG, JPG, WEBP).' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((err) => ({ ...err, featuredImageUri: 'Image size must be 5 MB or less.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, featuredImageUri: reader.result as string }));
        setSelectedFileName(file.name);
        if (errors.featuredImageUri) {
          setErrors((err) => ({ ...err, featuredImageUri: undefined }));
        }
      }
    };
    reader.readAsDataURL(file);
  };
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  // Auto-generate slug from headline if slug hasn't been manually altered
  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const handleHeadlineChange = (val: string) => {
    const trimmed = val.slice(0, HEADLINE_MAX);
    setForm((prev) => ({
      ...prev,
      headline: trimmed,
      slug: !isSlugTouched
        ? trimmed
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, SLUG_MAX)
        : prev.slug,
    }));
    if (errors.headline) {
      setErrors((e) => ({ ...e, headline: undefined }));
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !form.tags.includes(clean)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const validate = (): boolean => {
    const errs: CreateNewsFieldErrors = {};
    if (!form.headline.trim()) errs.headline = 'Headline is required';
    if (!form.slug.trim()) {
      errs.slug = 'Slug is required';
    } else if (!SLUG_PATTERN.test(form.slug)) {
      errs.slug = 'Use only lowercase letters, numbers and hyphens';
    }
    if (!form.summary.trim()) errs.summary = 'Summary is required';
    if (!form.content.trim()) errs.content = 'Content is required';
    if (!form.featuredImageUri) errs.featuredImageUri = 'Featured image is required';
    if (!form.author) errs.author = 'Author is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.publishDate) errs.publishDate = 'Publish date is required';
    if (!form.publishTime) errs.publishTime = 'Publish time is required';
    if (!form.status) errs.status = 'Status is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!form.headline.trim()) {
      setErrors({ headline: 'Headline is required to save a draft' });
      return;
    }
    setIsSubmitting(true);
    try {
      const draftPayload = { ...form, status: 'DRAFT' as const };
      const created = await newsStore.addNews(draftPayload);
      navigate(`/admin/news/${created.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const created = await newsStore.addNews(form);
      navigate(`/admin/news/${created.id}`);
    } finally {
      setIsSubmitting(false);
      setPublishModalOpen(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.topBar}>
        <button onClick={() => navigate('/admin/news')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to News</span>
        </button>

        <div style={styles.topActions}>
          <button onClick={() => setIsPreviewOpen(true)} style={styles.previewBtn}>
            <Eye size={16} />
            <span>Preview Article</span>
          </button>
        </div>
      </div>

      <div style={styles.pageTitleBox}>
        <h1 style={styles.pageTitle}>Create News & Press Article</h1>
        <p style={styles.pageSubtitle}>
          Compose national bulletins, press releases, human rights updates and statements.
        </p>
      </div>

      {/* Main Form Container */}
      <div style={styles.formContainer}>
        {/* Section 1: Basic Information */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>1</div>
            <div>
              <h2 style={styles.sectionTitle}>Basic Information</h2>
              <p style={styles.sectionSubtitle}>
                Headline, URL slug and executive summary shown in feeds.
              </p>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>
                Headline <span style={styles.requiredStar}>*</span>
              </label>
              <span style={styles.counter}>
                {form.headline.length}/{HEADLINE_MAX}
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. HRSJM Organizes Free Legal Consultation Camp..."
              value={form.headline}
              onChange={(e) => handleHeadlineChange(e.target.value)}
              style={{
                ...styles.input,
                borderColor: errors.headline ? '#DC2626' : '#DCE4EC',
              }}
            />
            {errors.headline && <span style={styles.errorText}>{errors.headline}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>
                URL Slug <span style={styles.requiredStar}>*</span>
              </label>
              <span style={styles.counter}>
                {form.slug.length}/{SLUG_MAX}
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. hrsjm-organizes-free-legal-consultation-camp"
              value={form.slug}
              onChange={(e) => {
                setIsSlugTouched(true);
                setForm((prev) => ({
                  ...prev,
                  slug: e.target.value.toLowerCase().slice(0, SLUG_MAX),
                }));
                if (errors.slug) setErrors((err) => ({ ...err, slug: undefined }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.slug ? '#DC2626' : '#DCE4EC',
              }}
            />
            <span style={styles.helperText}>
              Used in the article web link. Letters, numbers and hyphens only.
            </span>
            {errors.slug && <span style={styles.errorText}>{errors.slug}</span>}
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>
                Short Summary <span style={styles.requiredStar}>*</span>
              </label>
              <span style={styles.counter}>
                {form.summary.length}/{SUMMARY_MAX}
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Enter brief executive summary shown on cards and social share previews..."
              value={form.summary}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  summary: e.target.value.slice(0, SUMMARY_MAX),
                }));
                if (errors.summary) setErrors((err) => ({ ...err, summary: undefined }));
              }}
              style={{
                ...styles.textarea,
                borderColor: errors.summary ? '#DC2626' : '#DCE4EC',
              }}
            />
            {errors.summary && <span style={styles.errorText}>{errors.summary}</span>}
          </div>
        </div>

        {/* Section 2: Content */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>2</div>
            <div>
              <h2 style={styles.sectionTitle}>Article Content</h2>
              <p style={styles.sectionSubtitle}>
                Complete article body text. Separate paragraphs with double line breaks.
              </p>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Body Content <span style={styles.requiredStar}>*</span>
            </label>
            <textarea
              rows={8}
              placeholder="Write the full news content here. Paragraphs will be cleanly formatted..."
              value={form.content}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, content: e.target.value }));
                if (errors.content) setErrors((err) => ({ ...err, content: undefined }));
              }}
              style={{
                ...styles.textarea,
                borderColor: errors.content ? '#DC2626' : '#DCE4EC',
              }}
            />
            {errors.content && <span style={styles.errorText}>{errors.content}</span>}
          </div>
        </div>

        {/* Section 3: Featured Image */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>3</div>
            <div>
              <h2 style={styles.sectionTitle}>Featured Image</h2>
              <p style={styles.sectionSubtitle}>
                Hero image displayed at the top of the article and on list cards.
              </p>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Cover Image <span style={styles.requiredStar}>*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <div style={styles.imageInputRow}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  ...styles.randomThumbBtn,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#011F39',
                  color: '#FFFFFF',
                  border: '1px solid #011F39',
                }}
              >
                <Upload size={15} />
                <span>{form.featuredImageUri ? 'Change Image' : 'Select Image'}</span>
              </button>
              <span style={{ fontSize: 13, color: '#64748B', alignSelf: 'center' }}>
                {selectedFileName || (form.featuredImageUri ? 'Image selected' : 'PNG, JPG, or WEBP (max 5 MB)')}
              </span>
            </div>

            {form.featuredImageUri && (
              <div style={styles.previewImageContainer}>
                <img
                  src={form.featuredImageUri}
                  alt="Cover preview"
                  style={styles.previewImage}
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, featuredImageUri: null }));
                    setSelectedFileName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={styles.removeImageBtn}
                  title="Remove image"
                >
                  <X size={14} color="#FFFFFF" />
                </button>
              </div>
            )}
            {errors.featuredImageUri && (
              <span style={styles.errorText}>{errors.featuredImageUri}</span>
            )}
          </div>
        </div>

        {/* Section 4: Details & Categorization */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>4</div>
            <div>
              <h2 style={styles.sectionTitle}>Details & Categorization</h2>
              <p style={styles.sectionSubtitle}>
                Author, category tags and search discovery metadata.
              </p>
            </div>
          </div>

          <div style={styles.twoCol}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Author <span style={styles.requiredStar}>*</span>
              </label>
              <select
                value={form.author || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                style={styles.select}
              >
                {DEFAULT_NEWS_AUTHORS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Category <span style={styles.requiredStar}>*</span>
              </label>
              <select
                value={form.category || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                style={styles.select}
              >
                {DEFAULT_NEWS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Tags & Keywords</label>
            <div style={styles.tagInputWrapper}>
              <input
                type="text"
                placeholder="Type a tag and press Enter or click Add (e.g. Legal Aid, Health, Camp)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                style={styles.input}
              />
              <button type="button" onClick={handleAddTag} style={styles.addTagBtn}>
                Add Tag
              </button>
            </div>

            <div style={styles.tagsPillContainer}>
              {form.tags.map((t) => (
                <span key={t} style={styles.tagPill}>
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    style={styles.removeTagBtn}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Publish Settings */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>5</div>
            <div>
              <h2 style={styles.sectionTitle}>Publish Settings</h2>
              <p style={styles.sectionSubtitle}>
                Schedule publication date, time and status.
              </p>
            </div>
          </div>

          <div style={styles.twoCol}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Publish Date <span style={styles.requiredStar}>*</span>
              </label>
              <input
                type="date"
                value={form.publishDate || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, publishDate: e.target.value }))}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Publish Time <span style={styles.requiredStar}>*</span>
              </label>
              <input
                type="time"
                value={form.publishTime || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, publishTime: e.target.value }))}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Publication Status <span style={styles.requiredStar}>*</span>
            </label>
            <div style={styles.statusOptions}>
              <label
                style={{
                  ...styles.statusOptionLabel,
                  backgroundColor: form.status === 'PUBLISHED' ? '#DCFCE7' : '#FFFFFF',
                  borderColor: form.status === 'PUBLISHED' ? '#166534' : '#DCE4EC',
                }}
              >
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={form.status === 'PUBLISHED'}
                  onChange={() => setForm((prev) => ({ ...prev, status: 'PUBLISHED' }))}
                />
                <div>
                  <strong style={{ color: '#166534' }}>Published Live</strong>
                  <div style={styles.statusOptionDesc}>Visible immediately to all public users</div>
                </div>
              </label>

              <label
                style={{
                  ...styles.statusOptionLabel,
                  backgroundColor: form.status === 'DRAFT' ? '#FEF3C7' : '#FFFFFF',
                  borderColor: form.status === 'DRAFT' ? '#92400E' : '#DCE4EC',
                }}
              >
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={form.status === 'DRAFT'}
                  onChange={() => setForm((prev) => ({ ...prev, status: 'DRAFT' }))}
                />
                <div>
                  <strong style={{ color: '#92400E' }}>Draft Only</strong>
                  <div style={styles.statusOptionDesc}>Private draft for review, hidden from public</div>
                </div>
              </label>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Target Portal Visibility <span style={styles.requiredStar}>*</span>
            </label>
            <select
              value={form.targetAudience || 'ALL'}
              onChange={(e) => setForm((prev) => ({ ...prev, targetAudience: e.target.value }))}
              style={styles.select}
            >
              <option value="ALL">All Portals (Public & All Roles)</option>
              <option value="MEMBERS">Members Portal Only</option>
              <option value="SEEKERS">Donation Seekers Portal Only</option>
              <option value="USERS">General Users / Public Only</option>
            </select>
            <span style={styles.helpText}>
              Controls which user roles are authorized to view this article once published.
            </span>
          </div>
        </div>

        {/* Section 6: Additional Options */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>6</div>
            <div>
              <h2 style={styles.sectionTitle}>Additional Options</h2>
              <p style={styles.sectionSubtitle}>
                Reader interactivity and public feedback settings.
              </p>
            </div>
          </div>

          <label style={styles.toggleRow}>
            <input
              type="checkbox"
              checked={form.allowComments}
              onChange={(e) => setForm((prev) => ({ ...prev, allowComments: e.target.checked }))}
              style={{ width: '18px', height: '18px' }}
            />
            <div>
              <strong style={{ fontSize: '14px', color: '#011F39' }}>Allow Public Comments</strong>
              <div style={styles.statusOptionDesc}>
                Allow citizens and members to submit comments on this article.
              </div>
            </div>
          </label>
        </div>

        {/* Section 7: Action Operations Footer */}
        <div style={styles.formFooter}>
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            style={styles.discardBtn}
            disabled={isSubmitting}
          >
            Discard
          </button>

          <div style={styles.footerRight}>
            <button
              type="button"
              onClick={handleSaveDraft}
              style={styles.saveDraftBtn}
              disabled={isSubmitting}
            >
              <FileEdit size={16} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (validate()) setPublishModalOpen(true);
              }}
              style={styles.submitBtn}
              disabled={isSubmitting}
            >
              <Send size={16} />
              <span>Publish Article</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Publishing */}
      {publishModalOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcon}>📣</div>
            <h3 style={styles.modalTitle}>Publish News Article?</h3>
            <p style={styles.modalText}>
              This article will be saved to the database and made immediately visible to public users and members.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setPublishModalOpen(false)}
                style={styles.modalCancelBtn}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handlePublishSubmit}
                style={styles.modalConfirmBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      <NewsPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={form}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '860px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  topActions: {
    display: 'flex',
    gap: '10px',
  },
  previewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1.5px solid #011F39',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  pageTitleBox: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '28px',
    fontWeight: 700,
    color: '#011F39',
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#34516D',
    margin: 0,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    padding: '28px 32px',
    boxShadow: '0 2px 10px rgba(1, 31, 57, 0.03)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #F1F5F9',
  },
  sectionNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    flexShrink: 0,
  },
  sectionTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '18px',
    color: '#011F39',
    margin: '0 0 4px 0',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '18px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#011F39',
  },
  requiredStar: {
    color: '#DC2626',
  },
  counter: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    fontSize: '14px',
    color: '#011F39',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    fontSize: '14px',
    color: '#011F39',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  },
  select: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    fontSize: '14px',
    color: '#011F39',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  helperText: {
    fontSize: '12px',
    color: '#64748B',
  },
  errorText: {
    fontSize: '12px',
    color: '#DC2626',
    fontWeight: 500,
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  imageInputRow: {
    display: 'flex',
    gap: '10px',
  },
  randomThumbBtn: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#F8FAFC',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  previewImageContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '10px',
    backgroundColor: '#E2E8F0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  tagInputWrapper: {
    display: 'flex',
    gap: '10px',
  },
  addTagBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #011F39',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tagsPillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
  },
  tagPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#EBF3FA',
    color: '#011F39',
    padding: '4px 10px',
    borderRadius: '14px',
    fontSize: '12px',
    fontWeight: 600,
  },
  removeTagBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 700,
    padding: 0,
    lineHeight: 1,
  },
  statusOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  statusOptionLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '14px',
    borderRadius: '10px',
    border: '1.5px solid',
    cursor: 'pointer',
  },
  statusOptionDesc: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: '2px',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer',
  },
  formFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #DCE4EC',
    marginBottom: '40px',
  },
  discardBtn: {
    padding: '11px 20px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#64748B',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerRight: {
    display: 'flex',
    gap: '12px',
  },
  saveDraftBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '11px 20px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '11px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(1, 31, 57, 0.2)',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(1, 31, 57, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1300,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    maxWidth: '440px',
    width: '100%',
    padding: '28px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(1, 31, 57, 0.2)',
  },
  modalIcon: {
    fontSize: '36px',
    marginBottom: '12px',
  },
  modalTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '20px',
    color: '#011F39',
    margin: '0 0 8px 0',
  },
  modalText: {
    fontSize: '14px',
    color: '#64748B',
    lineHeight: 1.5,
    margin: '0 0 24px 0',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
  },
  modalCancelBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#34516D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalConfirmBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
