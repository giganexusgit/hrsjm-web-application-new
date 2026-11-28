import React, { useRef, useState, useSyncExternalStore } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  Send,
  FileEdit,
  X,
  Upload,
} from 'lucide-react';
import { blogsStore } from '../store/blogsStore';
import {
  DEFAULT_BLOG_CATEGORIES,
  DEFAULT_BLOG_AUTHORS,
  type CreateBlogFormState,
  type CreateBlogFieldErrors,
} from '../types/blog.types';
import { BlogPreviewModal } from '../components/BlogPreviewModal';

const SHORT_DESC_MAX = 200;
const CONTENT_MAX = 5000;

export const EditBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useSyncExternalStore(blogsStore.subscribe, blogsStore.getSnapshot);

  const existing = id ? blogsStore.getBlogById(id) : undefined;

  const [form, setForm] = useState<CreateBlogFormState>(() => ({
    coverImageUri: existing ? existing.thumbnailUrl || null : null,
    title: existing ? existing.title : '',
    category: existing ? existing.category || 'Know Your Rights' : 'Know Your Rights',
    shortDescription: existing ? existing.excerpt : '',
    content: existing ? (existing.content || []).join('\n\n') || existing.excerpt : '',
    author: existing ? existing.author || 'HRSJM Admin' : 'HRSJM Admin',
    status: existing ? existing.status : 'PUBLISHED',
    allowComments: existing ? existing.allowComments ?? true : true,
    featured: existing ? existing.featured ?? false : false,
    tagsText: existing && existing.tags ? existing.tags.join(', ') : '',
    targetAudience: existing ? existing.targetAudience || 'ALL' : 'ALL',
  }));

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<CreateBlogFieldErrors>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handleImageFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((err) => ({ ...err, coverImageUri: 'Please select a valid image file (PNG, JPG, WEBP).' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((err) => ({ ...err, coverImageUri: 'Image size must be 5 MB or less.' }));
      return;
    }
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  if (!existing) {
    return (
      <div style={styles.notFoundWrapper}>
        <h2 style={styles.notFoundTitle}>Article Not Found</h2>
        <p style={styles.notFoundText}>
          The article you are trying to edit ({id}) could not be located.
        </p>
        <button onClick={() => navigate('/admin/blogs')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Articles & Blogs</span>
        </button>
      </div>
    );
  }

  const tagsList = form.tagsText
    ? form.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tagsList.includes(clean)) {
      const updated = [...tagsList, clean].join(', ');
      setForm((prev) => ({ ...prev, tagsText: updated }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tagsList.filter((t) => t !== tagToRemove).join(', ');
    setForm((prev) => ({ ...prev, tagsText: updated }));
  };

  const validate = (): boolean => {
    const errs: CreateBlogFieldErrors = {};
    if (!form.coverImageUri) errs.coverImageUri = 'Cover image is required';
    if (!form.title.trim()) errs.title = 'Blog title is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.shortDescription.trim()) errs.shortDescription = 'Short description is required';
    if (!form.content.trim()) errs.content = 'Blog content is required';
    if (!form.author.trim()) errs.author = 'Author is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (targetStatus?: any) => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        status: targetStatus || form.status,
      };
      await blogsStore.updateBlog(existing.id, payload);
      navigate(`/admin/blogs/${existing.id}`);
    } finally {
      setIsSubmitting(false);
      setConfirmModalOpen(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.topBar}>
        <button onClick={() => navigate(`/admin/blogs/${existing.id}`)} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Cancel & Back</span>
        </button>

        <div style={styles.topActions}>
          <button onClick={() => setIsPreviewOpen(true)} style={styles.previewBtn}>
            <Eye size={16} />
            <span>Preview Changes</span>
          </button>
        </div>
      </div>

      <div style={styles.pageTitleBox}>
        <h1 style={styles.pageTitle}>Edit Article & Blog</h1>
        <p style={styles.pageSubtitle}>
          Update article title, category, editorial body text, cover assets and publication status.
        </p>
      </div>

      {/* Main Form Container */}
      <div style={styles.formContainer}>
        {/* Section 1: Cover Image */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>1</div>
            <div>
              <h2 style={styles.sectionTitle}>Cover Image</h2>
              <p style={styles.sectionSubtitle}>
                Banner image displayed at the head of the article.
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

            {!form.coverImageUri ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleImageFile(file);
                }}
                style={{
                  ...styles.uploadDropzone,
                  borderColor: isDragging
                    ? '#011F39'
                    : errors.coverImageUri
                    ? '#DC2626'
                    : '#CBD5E1',
                  backgroundColor: isDragging ? '#F1F5F9' : '#F8FAFC',
                }}
              >
                <div style={styles.uploadIconCircle}>
                  <Upload size={22} color="#011F39" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={styles.uploadMainText}>
                    <span style={{ fontWeight: 600, color: '#011F39' }}>Click to upload</span> or drag and drop
                  </p>
                  <p style={styles.uploadSubText}>PNG, JPG, or WEBP (max 5 MB)</p>
                </div>
              </div>
            ) : (
              <div>
                <div style={styles.previewImageContainer}>
                  <img
                    src={form.coverImageUri}
                    alt="Cover preview"
                    style={styles.previewImage}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, coverImageUri: null }));
                      setSelectedFileName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    style={styles.removeImageBtn}
                    title="Remove image"
                  >
                    <X size={14} color="#FFFFFF" />
                  </button>
                </div>
                <div style={styles.imageActionRow}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={styles.changeImageBtn}
                  >
                    <Upload size={14} />
                    <span>Change Image</span>
                  </button>
                  <span style={styles.imageMetaText}>
                    {selectedFileName || 'Cover image selected'}
                  </span>
                </div>
              </div>
            )}
            {errors.coverImageUri && (
              <span style={styles.errorText}>{errors.coverImageUri}</span>
            )}
          </div>
        </div>

        {/* Section 2: Basic Information */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>2</div>
            <div>
              <h2 style={styles.sectionTitle}>Article Details</h2>
              <p style={styles.sectionSubtitle}>
                Headline, editorial category, author and short description.
              </p>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Blog Title <span style={styles.requiredStar}>*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors((err) => ({ ...err, title: undefined }));
              }}
              style={{
                ...styles.input,
                borderColor: errors.title ? '#DC2626' : '#DCE4EC',
              }}
            />
            {errors.title && <span style={styles.errorText}>{errors.title}</span>}
          </div>

          <div style={styles.twoCol}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Category <span style={styles.requiredStar}>*</span>
              </label>
              <select
                value={form.category || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                style={styles.select}
              >
                {DEFAULT_BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Author Name <span style={styles.requiredStar}>*</span>
              </label>
              <select
                value={form.author || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                style={styles.select}
              >
                {DEFAULT_BLOG_AUTHORS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>
                Short Description / Excerpt <span style={styles.requiredStar}>*</span>
              </label>
              <span style={styles.counter}>
                {form.shortDescription.length}/{SHORT_DESC_MAX}
              </span>
            </div>
            <textarea
              rows={3}
              value={form.shortDescription}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  shortDescription: e.target.value.slice(0, SHORT_DESC_MAX),
                }));
                if (errors.shortDescription) {
                  setErrors((err) => ({ ...err, shortDescription: undefined }));
                }
              }}
              style={{
                ...styles.textarea,
                borderColor: errors.shortDescription ? '#DC2626' : '#DCE4EC',
              }}
            />
            {errors.shortDescription && (
              <span style={styles.errorText}>{errors.shortDescription}</span>
            )}
          </div>
        </div>

        {/* Section 3: Article Content */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>3</div>
            <div>
              <h2 style={styles.sectionTitle}>Content Body</h2>
              <p style={styles.sectionSubtitle}>
                Complete article paragraphs. Use double returns for new paragraphs.
              </p>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>
                Blog Content <span style={styles.requiredStar}>*</span>
              </label>
              <span style={styles.counter}>
                {form.content.length}/{CONTENT_MAX}
              </span>
            </div>
            <textarea
              rows={10}
              value={form.content}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  content: e.target.value.slice(0, CONTENT_MAX),
                }));
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

        {/* Section 4: Tags & Keywords */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>4</div>
            <div>
              <h2 style={styles.sectionTitle}>Topics & Search Discovery</h2>
              <p style={styles.sectionSubtitle}>
                Keyword tags for discoverability and topic grouping.
              </p>
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Topic Tags</label>
            <div style={styles.tagInputWrapper}>
              <input
                type="text"
                placeholder="Type a tag and press Enter..."
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
              {tagsList.map((t) => (
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

        {/* Section 5: Publication Settings & Flags */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>5</div>
            <div>
              <h2 style={styles.sectionTitle}>Publication Status & Display Flags</h2>
              <p style={styles.sectionSubtitle}>
                Visibility and prioritization options.
              </p>
            </div>
          </div>

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
                <strong style={{ color: '#166534' }}>Publish</strong>
                <div style={styles.statusOptionDesc}>Publicly accessible to all users</div>
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
                <strong style={{ color: '#92400E' }}>Draft</strong>
                <div style={styles.statusOptionDesc}>Private editorial draft for revision</div>
              </div>
            </label>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={styles.toggleRow}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <strong style={{ fontSize: '14px', color: '#011F39' }}>Featured Article</strong>
                <div style={styles.statusOptionDesc}>
                  Highlight this blog with a golden banner at the top of the article feeds.
                </div>
              </div>
            </label>

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
                  Allow readers and members to leave comments and feedback on this article.
                </div>
              </div>
            </label>
          </div>

          <div style={{ ...styles.fieldGroup, marginTop: '20px' }}>
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
              Controls which user roles are authorized to view this blog article once published.
            </span>
          </div>
        </div>

        {/* Section 6: Action Operations Footer */}
        <div style={styles.formFooter}>
          <button
            type="button"
            onClick={() => navigate(`/admin/blogs/${existing.id}`)}
            style={styles.discardBtn}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <div style={styles.footerRight}>
            <button
              type="button"
              onClick={() => handleSave('DRAFT')}
              style={styles.saveDraftBtn}
              disabled={isSubmitting}
            >
              <FileEdit size={16} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (validate()) setConfirmModalOpen(true);
              }}
              style={styles.submitBtn}
              disabled={isSubmitting}
            >
              <Send size={16} />
              <span>Update & Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcon}>📝</div>
            <h3 style={styles.modalTitle}>Update Blog Article?</h3>
            <p style={styles.modalText}>
              Are you sure you want to save these changes to &ldquo;{form.title}&rdquo;?
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setConfirmModalOpen(false)}
                style={styles.modalCancelBtn}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave()}
                style={styles.modalConfirmBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Update Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      <BlogPreviewModal
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
    width: '100%',
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
  uploadDropzone: {
    border: '2px dashed #CBD5E1',
    borderRadius: '12px',
    padding: '28px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#F8FAFC',
  },
  uploadIconCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadMainText: {
    margin: 0,
    fontSize: '14px',
    color: '#334155',
  },
  uploadSubText: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#64748B',
  },
  imageActionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '10px',
  },
  changeImageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #011F39',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  imageMetaText: {
    fontSize: '13px',
    color: '#64748B',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
  notFoundWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '60px auto',
    boxShadow: '0 4px 20px rgba(1, 31, 57, 0.05)',
  },
  notFoundTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '24px',
    color: '#011F39',
    margin: '0 0 12px 0',
  },
  notFoundText: {
    fontSize: '14px',
    color: '#64748B',
    marginBottom: '24px',
    lineHeight: 1.5,
  },
};

