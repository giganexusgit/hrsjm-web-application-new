/**
 * HRSJM Backend API Endpoints Dictionary
 * Accurately mapped to NestJS controllers in `HRSJM-back-api`
 */

export const ENDPOINTS = {
  // Authentication & Current User
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    impact: '/auth/me/impact',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    checkDuplicates: '/auth/check-duplicates',
  },

  // Memberships & Member Services
  memberships: {
    list: '/memberships',
    stats: '/memberships/stats',
    apply: '/memberships/apply',
    myMembership: '/users/me/membership', // Alternate: '/memberships/my'
    checkDuplicate: '/memberships/check-duplicate',
    getById: (id: string) => `/memberships/${id}`,
    update: (id: string) => `/memberships/${id}`,
    updateStatus: (id: string) => `/memberships/${id}/status`,
    updateKitFulfillment: (id: string) => `/memberships/${id}/kit-fulfillment`,
    adminResetPassword: (id: string) => `/memberships/${id}/reset-password`,
    documents: (id: string) => `/memberships/${id}/documents`,
    paymentHistory: (id: string) => `/memberships/${id}/payment-history`,
    renewalHistory: (id: string) => `/memberships/${id}/renewal-history`,
    validateId: (membershipNumber: string) => `/membership-id/${membershipNumber}/validate`,
    getCardById: (membershipNumber: string) => `/membership-id/${membershipNumber}`,
    categories: '/membership-categories',
  },

  // Users & RBAC
  users: {
    list: '/users',
    create: '/users',
    getById: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    updateStatus: (id: string) => `/users/${id}/status`,
    resetPassword: (id: string) => `/users/${id}/reset-password`,
    approveSeeker: (id: string) => `/users/${id}/approve-seeker`,
    permissions: '/users/me/permissions',
    roles: (id: string) => `/users/${id}/roles`,
  },

  // Events & Drives
  events: {
    list: '/events',
    getById: (id: string) => `/events/${id}`,
    create: '/events',
    update: (id: string) => `/events/${id}`,
    delete: (id: string) => `/events/${id}`,
  },

  // News & Press Releases
  news: {
    list: '/news',
    getById: (id: string) => `/news/${id}`,
    create: '/news',
    update: (id: string) => `/news/${id}`,
    delete: (id: string) => `/news/${id}`,
    recordView: (id: string) => `/news/${id}/views`,
  },

  // Articles & Blogs
  blogs: {
    list: '/blogs',
    getById: (id: string) => `/blogs/${id}`,
    create: '/blogs',
    update: (id: string) => `/blogs/${id}`,
    delete: (id: string) => `/blogs/${id}`,
    recordView: (id: string) => `/blogs/${id}/views`,
  },

  // Human Rights Handbook & Legal Guides
  rights: {
    list: '/rights',
    getById: (id: string) => `/rights/${id}`,
    create: '/rights',
    update: (id: string) => `/rights/${id}`,
    delete: (id: string) => `/rights/${id}`,
    recordView: (id: string) => `/rights/${id}/views`,
  },

  // Support Tickets & Member Complaints
  support: {
    list: '/support-tickets',
    summary: '/support-tickets/stats/summary',
    create: '/support-tickets',
    publicCreate: '/support-tickets/public',
    getById: (id: string) => `/support-tickets/${id}`,
    updateStatus: (id: string) => `/support-tickets/${id}/status`,
    messages: (id: string) => `/support-tickets/${id}/messages`,
    sendMessage: (id: string) => `/support-tickets/${id}/messages`,
    attachments: (id: string) => `/support-tickets/${id}/attachments`,
    contact: '/contact',
  },

  // Assistance & Aid Requests
  assistance: {
    list: '/assistance-requests',
    summary: '/assistance-requests/stats/summary',
    approved: '/assistance-requests/approved',
    create: '/assistance-requests',
    getById: (id: string) => `/assistance-requests/${id}`,
    updateStatus: (id: string) => `/assistance-requests/${id}/status`,
    documents: (id: string) => `/assistance-requests/${id}/documents`,
  },

  // Donations & Campaigns
  donations: {
    list: '/donations',
    create: '/donations',
    getById: (id: string) => `/donations/${id}`,
    refund: (id: string) => `/donations/${id}/refund`,
  },

  // Payment Gateway (Cashfree PG)
  payments: {
    cashfreeOrders: '/payments/cashfree/orders',
    cashfreeVerify: (orderId: string) => `/payments/cashfree/orders/${encodeURIComponent(orderId)}/verify`,
    validateUpi: '/payments/cashfree/validate-upi',
    donationPayments: '/donation-payments',
    membershipPayments: '/membership-payments',
  },

  // 80G Receipts & Passbooks
  receipts: {
    my: '/receipts/my',
    membershipReceipt: (paymentId: string) => `/receipts/membership/${paymentId}`,
    donationReceipt: (donationId: string) => `/receipts/donation/${donationId}`,
    adminList: '/admin/receipts',
    getById: (id: string) => `/receipts/${id}`,
  },

  // Accounting & Financial Ledger
  accounting: {
    entries: '/accounting/entries',
    entryById: (id: string) => `/accounting/entries/${id}`,
    reverseEntry: (id: string) => `/accounting/entries/${id}/reverse`,
    ledger: '/accounting/ledger',
    accounts: '/accounts',
    accountById: (id: string) => `/accounts/${id}`,
    accountLedger: (id: string) => `/accounts/${id}/ledger`,
    passbookExport: '/passbook/export',
    expenseEntries: '/expense-entries',
    expenseEntryById: (id: string) => `/expense-entries/${id}`,
    receiptEntries: '/receipt-entries',
    receiptEntriesStats: '/receipt-entries/stats',
  },

  // Financial Reports
  reports: {
    analytics: '/reports/analytics',
    trialBalance: '/reports/trial-balance',
    trialBalanceSummary: '/reports/trial-balance/summary',
    profitLoss: '/reports/profit-loss',
    profitLossSummary: '/reports/profit-loss/summary',
    balanceSheet: '/reports/balance-sheet',
    balanceSheetSummary: '/reports/balance-sheet/summary',
  },

  // Notifications
  notifications: {
    list: '/notifications',
    create: '/notifications',
    my: '/notifications/me',
    unreadCount: '/notifications/me/unread-count',
    markAllRead: '/notifications/me/read-all',
    getById: (id: string) => `/notifications/${id}`,
    recipients: (id: string) => `/notifications/${id}/recipients`,
    markRecipientRead: (recipientId: string) => `/notifications/recipients/${recipientId}/read`,
  },

  // System & Platform Settings
  settings: {
    all: '/admin/settings',
    getByKey: (key: string) => `/admin/settings/${encodeURIComponent(key)}`,
    updateByKey: (key: string) => `/admin/settings/${encodeURIComponent(key)}`,
  },
} as const;

