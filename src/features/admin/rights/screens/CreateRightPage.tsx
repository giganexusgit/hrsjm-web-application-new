import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Send,
  Eye,
  Plus,
  X,
  CheckCircle,
  Upload,
} from 'lucide-react';
import { rightsStore } from '../store/rightsStore';
import { RightsPreviewModal } from '../components/RightsPreviewModal';
import {
  DEFAULT_RIGHTS_CATEGORIES,
  DEFAULT_RIGHTS_AUTHORS,
  type RightsArticle,
  type RightsArticleFieldErrors,
  type RightsArticleFormState,
} from '../types/rights.types';

const SAMPLE_COVERS = [
  'https://picsum.photos/seed/hrsjm-rights-01/600/400',
  'https://picsum.photos/seed/hrsjm-rights-02/600/400',
  'https://picsum.photos/seed/hrsjm-rights-03/600/400',
  'https://picsum.photos/seed/hrsjm-rights-04/600/400',
  'https://picsum.photos/seed/hrsjm-rights-05/600/400',
  'https://picsum.photos/seed/hrsjm-rights-06/600/400',
];

export const CreateRightPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RightsArticleFormState>({
    coverImageUri: SAMPLE_COVERS[0],
    title: '',
    category: 'Constitution',
    shortDescription: '',
    content: '',
    author: 'Priya Sharma',
    status: 'DRAFT',
    allowComments: true,
    featured: false,
    tags: ['Human Rights', 'Constitution', 'Rights'],
    targetAudience: 'ALL',
  });

  const [newTagInput, setNewTagInput] = useState('');
  const [errors, setErrors] = useState<RightsArticleFieldErrors>({});
  const [previewArticle, setPreviewArticle] = useState<RightsArticle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPublishOpen, setConfirmPublishOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be 5 MB or less.');
      return;
    }

    setImageError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, coverImageUri: reader.result as string }));
        setSelectedFileName(file.name);
        if (errors.coverImageUri) {
          setErrors((err) => ({ ...err, coverImageUri: undefined }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const errs: RightsArticleFieldErrors = {};
    if (!form.coverImageUri) errs.coverImageUri = 'Cover image is required';
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.shortDescription.trim()) errs.shortDescription = 'Short description is required';
    if (!form.content.trim()) errs.content = 'Article content is required';
    if (!form.author) errs.author = 'Author is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) {
      setErrors({ title: 'Title is required to save as draft' });
      return;
    }
    setIsSubmitting(true);
    try {
      await rightsStore.create({
        ...form,
        status: 'DRAFT',
      });
      navigate('/admin/rights');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await rightsStore.create({
        ...form,
        status: 'PUBLISHED',
      });
      navigate('/admin/rights');
    } finally {
      setIsSubmitting(false);
      setConfirmPublishOpen(false);
    }
  };

  const handleOpenPreview = () => {
    const now = new Date();
    const temp: RightsArticle = {
      id: 'preview',
      title: form.title || 'Untitled Rights Article',
      description: form.shortDescription || 'No description provided.',
      category: form.category || 'Constitution',
      lastUpdatedDate: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastUpdatedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: form.status,
      views: 0,
      thumbnailUrl: form.coverImageUri,
      author: form.author || 'Priya Sharma',
      authorRole: 'Content Writer',
      organization: 'HRSJM',
      content: form.content.split('\n\n').filter(Boolean),
      highlights: [
        { title: 'Core Statutory Provision', description: form.shortDescription || 'Statutory legal rights protection.' },
      ],
      tags: form.tags,
      featured: form.featured,
      allowComments: form.allowComments,
    };
    setPreviewArticle(temp);
  };

  return (
    <div style={styles.page}>
      {/* Top Header */}
      <div style={styles.topBar}>
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/rights')}
            style={styles.backBtn}
          >
            <ArrowLeft size={16} />
            <span>Back to Rights Directory</span>
          </button>
          <h1 style={styles.pageTitle}>Create Rights Article</h1>
          <p style={styles.subtitle}>
            Draft and publish official citizen rights handbooks, statutory protections and legal guides.
          </p>
        </div>

        <div style={styles.topActions}>
          <button
            type="button"
            onClick={handleOpenPreview}
            style={styles.previewBtn}
          >
            <Eye size={15} />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            style={styles.draftBtn}
          >
            <Save size={15} />
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (validate()) setConfirmPublishOpen(true);
            }}
            disabled={isSubmitting}
            style={styles.publishBtn}
          >
            <Send size={15} />
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      <div style={styles.formGrid}>
        {/* Main Content Column */}
        <div style={styles.mainCol}>
          {/* Section 1: Title & Short Description */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Article Overview</h2>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Article Title <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Fundamental Rights of Every Citizen"
                style={{
                  ...styles.input,
                  borderColor: errors.title ? '#DC2626' : '#CBD5E1',
                }}
              />
              {errors.title && <span style={styles.errorText}>{errors.title}</span>}
            </div>

            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>
                  Short Description / Executive Summary <span style={styles.required}>*</span>
                </label>
                <span style={styles.charCount}>
                  {form.shortDescription.length} / 300
                </span>
              </div>
              <textarea
                value={form.shortDescription}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setForm((p) => ({ ...p, shortDescription: e.target.value }));
                  }
                }}
                rows={3}
                placeholder="A concise synopsis of what legal protections or statutory rights this article explains..."
                style={{
                  ...styles.textarea,
                  borderColor: errors.shortDescription ? '#DC2626' : '#CBD5E1',
                }}
              />
              {errors.shortDescription && (
                <span style={styles.errorText}>{errors.shortDescription}</span>
              )}
            </div>
          </div>

          {/* Section 2: Full Body Content */}
          <div style={styles.card}>
            <div style={styles.labelRow}>
              <h2 style={styles.cardTitle}>Full Article Content</h2>
              <span style={styles.charCount}>
                {form.content.length} / 5000
              </span>
            </div>
            <p style={styles.helpText}>
              Write detailed legal provisions, constitutional clauses, court precedents, and citizen remedies. Separate paragraphs with blank lines.
            </p>

            <textarea
              value={form.content}
              onChange={(e) => {
                if (e.target.value.length <= 5000) {
                  setForm((p) => ({ ...p, content: e.target.value }));
                }
              }}
              rows={12}
              placeholder="Enter full article paragraphs here..."
              style={{
                ...styles.textarea,
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
                borderColor: errors.content ? '#DC2626' : '#CBD5E1',
              }}
            />
            {errors.content && <span style={styles.errorText}>{errors.content}</span>}
          </div>

          {/* Section 3: Topic Tags */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Topic Tags</h2>
            <p style={styles.helpText}>
              Add tags to help citizens and legal aid volunteers locate this statutory guide.
            </p>

            <div style={styles.tagInputRow}>
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Enter tag (e.g. POCSO Act, Minimum Wages) and press Enter"
                style={styles.input}
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={styles.addTagBtn}
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            </div>

            <div style={styles.tagsContainer}>
              {form.tags.map((tag) => (
                <span key={tag} style={styles.tagBadge}>
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={styles.removeTagBtn}
                    title="Remove tag"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Settings Column */}
        <div style={styles.sideCol}>
          {/* Cover Image Picker */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <ImageIcon size={16} />
              <span>Cover Image</span>
            </h2>
            <p style={styles.helpText}>Recommended aspect ratio 1200×630px.</p>

            {form.coverImageUri && (
              <div style={styles.coverPreview}>
                <img
                  src={form.coverImageUri}
                  alt="Cover Preview"
                  style={styles.coverPreviewImg}
                />
              </div>
            )}

            <label style={styles.smallLabel}>Choose Preset Image</label>
            <div style={styles.coverChoicesGrid}>
              {SAMPLE_COVERS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, coverImageUri: url }))}
                  style={{
                    ...styles.coverThumbnailBtn,
                    borderColor: form.coverImageUri === url ? '#06294D' : '#E2E8F0',
                    borderWidth: form.coverImageUri === url ? '2px' : '1px',
                  }}
                >
                  <img src={url} alt={`Option ${i + 1}`} style={styles.thumbnailImg} />
                </button>
              ))}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {/* Add / Upload Image Button */}
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#06294D',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.2s',
                }}
              >
                <Upload size={16} />
                <span>{form.coverImageUri ? 'Add / Change Image' : 'Add Image'}</span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  {selectedFileName ? selectedFileName : 'Supports PNG, JPG, WEBP (Max 5MB)'}
                </span>
                {form.coverImageUri && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((p) => ({ ...p, coverImageUri: null }));
                      setSelectedFileName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {imageError && (
                <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 500 }}>
                  {imageError}
                </span>
              )}
            </div>
          </div>

          {/* Publishing Settings */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Publishing Settings</h2>

            {/* Category */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Category <span style={styles.required}>*</span>
              </label>
              <select
                value={form.category || ''}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                style={styles.select}
              >
                {DEFAULT_RIGHTS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Author / Editorial Cell <span style={styles.required}>*</span>
              </label>
              <select
                value={form.author || ''}
                onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                style={styles.select}
              >
                {DEFAULT_RIGHTS_AUTHORS.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} ({a.organization})
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Initial Publication Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value as 'DRAFT' | 'PUBLISHED' }))
                }
                style={styles.select}
              >
                <option value="DRAFT">Draft (Unpublished)</option>
                <option value="PUBLISHED">Published (Live)</option>
              </select>
            </div>

            {/* Target Portal Visibility */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Target Portal Visibility <span style={styles.required}>*</span>
              </label>
              <select
                value={form.targetAudience || 'ALL'}
                onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
                style={styles.select}
              >
                <option value="ALL">All Portals (Public & All Roles)</option>
                <option value="MEMBERS">Members Portal Only</option>
                <option value="SEEKERS">Donation Seekers Portal Only</option>
                <option value="USERS">General Users / Public Only</option>
              </select>
            </div>

            <div style={styles.divider} />

            {/* Additional Toggles */}
            <div style={styles.toggleRow}>
              <div>
                <div style={styles.toggleLabel}>Featured Guide</div>
                <div style={styles.toggleDesc}>Highlight prominently on citizen portal</div>
              </div>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                style={styles.checkbox}
              />
            </div>

            <div style={styles.toggleRow}>
              <div>
                <div style={styles.toggleLabel}>Allow Public Comments</div>
                <div style={styles.toggleDesc}>Permit citizens to ask questions</div>
              </div>
              <input
                type="checkbox"
                checked={form.allowComments}
                onChange={(e) => setForm((p) => ({ ...p, allowComments: e.target.checked }))}
                style={styles.checkbox}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmPublishOpen && (
        <div style={styles.overlay} onClick={() => setConfirmPublishOpen(false)}>
          <div style={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.confirmHeader}>
              <CheckCircle size={24} color="#16A34A" />
              <h3 style={styles.confirmTitle}>Confirm Publication</h3>
            </div>
            <p style={styles.confirmMessage}>
              Are you ready to publish <strong>"{form.title}"</strong> under the{' '}
              <strong>{form.category}</strong> category? It will immediately become visible to all citizens and field workers.
            </p>
            <div style={styles.confirmFooter}>
              <button
                type="button"
                onClick={() => setConfirmPublishOpen(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishSubmit}
                disabled={isSubmitting}
                style={styles.confirmPublishBtn}
              >
                {isSubmitting ? 'Publishing...' : 'Yes, Publish Live'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      <RightsPreviewModal
        isOpen={Boolean(previewArticle)}
        onClose={() => setPreviewArticle(null)}
        article={previewArticle}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '24px 32px',
    maxWidth: '1280px',
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#06294D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '8px',
  },
  pageTitle: {
    margin: '4px 0 0 0',
    fontSize: '28px',
    fontWeight: 700,
    color: '#011F39',
    fontFamily: 'Playfair Display, Georgia, serif',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#64748B',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  previewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  draftBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #FED7AA',
    backgroundColor: '#FFF7ED',
    color: '#C2410C',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  publishBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#06294D',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(6, 41, 77, 0.2)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 360px',
    gap: '24px',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 700,
    color: '#011F39',
    fontFamily: 'Playfair Display, Georgia, serif',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1E293B',
  },
  smallLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '6px',
    display: 'block',
  },
  required: {
    color: '#DC2626',
  },
  charCount: {
    fontSize: '12px',
    color: '#94A3B8',
  },
  helpText: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#64748B',
    lineHeight: 1.45,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    color: '#0F172A',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  errorText: {
    fontSize: '12px',
    color: '#DC2626',
    fontWeight: 500,
  },
  tagInputRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  addTagBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#06294D',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#F0F9FF',
    color: '#0369A1',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid #BAE6FD',
  },
  removeTagBtn: {
    border: 'none',
    background: 'none',
    padding: '0',
    color: '#0369A1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  coverPreview: {
    width: '100%',
    height: '160px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px',
    backgroundColor: '#011F39',
  },
  coverPreviewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverChoicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '12px',
  },
  coverThumbnailBtn: {
    padding: '0',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    cursor: 'pointer',
    aspectRatio: '16 / 10',
    outline: 'none',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  divider: {
    height: '1px',
    backgroundColor: '#E2E8F0',
    margin: '16px 0',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
  },
  toggleLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1E293B',
  },
  toggleDesc: {
    fontSize: '12px',
    color: '#64748B',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#06294D',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(1, 31, 57, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '16px',
  },
  confirmModal: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
  },
  confirmHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  confirmTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#011F39',
    fontFamily: 'Playfair Display, Georgia, serif',
  },
  confirmMessage: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#475569',
  },
  confirmFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  confirmPublishBtn: {
    padding: '8px 18px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
