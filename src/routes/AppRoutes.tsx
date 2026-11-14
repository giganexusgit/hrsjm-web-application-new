import type React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { MemberLayout } from '@/components/layout/MemberLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Admin Portal Feature Exports
import {
  AdminDashboardPage,
  UsersListPage,
  AllUsersDirectoryPage,
  UserDetailsPage,
  AddUserPage,
  EditUserPage,
  UserVerificationPage,
  ApplicationsListPage,
  ApplicationDetailsPage,
  MembersListPage,
  MemberDetailsPage,
  AddMemberPage,
  EditMemberPage,
  AssistanceListPage,
  AssistanceDetailsPage,
  CreateSeekerPage,
  SupportTicketsListPage,
  SupportTicketDetailsPage,
  SupportTicketChatPage,
  EventsListPage,
  EventDetailsPage,
  NewsListPage,
  NewsDetailsPage,
  CreateNewsPage,
  EditNewsPage,
  BlogsListPage,
  BlogDetailsPage,
  CreateBlogPage,
  EditBlogPage,
  KnowYourRightsPage,
  RightDetailsPage,
  CreateRightPage,
  EditRightPage,
  ExpensesListPage,
  ExpenseDetailsPage,
  CreateExpensePage,
  ReceiptsListPage,
  ReceiptDetailsPage,
  CreateReceiptPage,
  AccountingDashboardPage,
  AccountLedgerPage,
  JournalEntryDetailsPage,
  ReportsOverviewPage,
  TrialBalancePage,
  ProfitLossPage,
  BalanceSheetPage,
  DonationsListPage,
  DonationDetailsPage,
  DonationReceiptPage,
  ProfilePage,
  MyIdCardPage,
  NotificationsPage,
  SettingsPage,
} from '@/features/admin';

// Member Portal Feature Exports
import {
  MemberDashboardPage,
  MemberIdCardPage,
  MemberCertificatePage,
  MemberRenewalPage,
  MemberCausesPage,
  MemberPassbookPage,
  MemberSupportPage,
  MemberProfilePage,
  MemberAboutPage,
  MemberEventsPage,
  MemberRightsPage,
  MemberNewsPage,
  MemberBlogsPage,
  MemberNotificationsPage,
  MemberSettingsPage,
} from '@/features/member';
import { MemberEventDetailsPage } from '@/features/member/screens/MemberEventDetailsPage';

// Public Experience Pages (Parity with Mobile APK)
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { UserTransactionsPage } from '@/features/transactions';
import { RegisterPage } from '@/pages/RegisterPage';
import { SignupCategoryPage } from '@/pages/SignupCategoryPage';
import { MemberRegistrationPage } from '@/pages/MemberRegistrationPage';
import { SeekerRegistrationPage } from '@/pages/SeekerRegistrationPage';

// Donation Seeker User-Facing Portal
import { SeekerLayout } from '@/features/seeker/components/SeekerLayout';
import { SeekerHomePage } from '@/features/seeker/screens/SeekerHomePage';
import { SeekerRequestsPage } from '@/features/seeker/screens/SeekerRequestsPage';
import { SeekerApplyPage } from '@/features/seeker/screens/SeekerApplyPage';
import { SeekerRequestDetailsPage } from '@/features/seeker/screens/SeekerRequestDetailsPage';
import { SeekerRightsPage } from '@/features/seeker/screens/SeekerRightsPage';
import { SeekerRightDetailsPage } from '@/features/seeker/screens/SeekerRightDetailsPage';
import { SeekerEventsPage } from '@/features/seeker/screens/SeekerEventsPage';
import { SeekerEventDetailsPage } from '@/features/seeker/screens/SeekerEventDetailsPage';
import { SeekerSupportPage } from '@/features/seeker/screens/SeekerSupportPage';
import { SeekerCreateTicketPage } from '@/features/seeker/screens/SeekerCreateTicketPage';
import { SeekerProfilePage } from '@/features/seeker/screens/SeekerProfilePage';
import { SeekerIdCardPage } from '@/features/seeker/screens/SeekerIdCardPage';
import { SeekerNotificationsPage } from '@/features/seeker/screens/SeekerNotificationsPage';

// User Portal (Sahil Branch)
import { UserLayout } from '@/features/user/layout/UserLayout';
import { UserDashboardPage } from '@/features/user/screens/UserDashboardPage';
import { UserAboutPage } from '@/features/user/screens/UserAboutPage';
import { UserWhatWeDoPage } from '@/features/user/screens/UserWhatWeDoPage';
import { UserWhatWeDoDetailPage } from '@/features/user/screens/UserWhatWeDoDetailPage';
import { UserRightsPage } from '@/features/user/screens/UserRightsPage';
import { UserRightDetailsPage } from '@/features/user/screens/UserRightDetailsPage';
import { UserEventsPage } from '@/features/user/screens/UserEventsPage';
import { UserEventDetailsPage } from '@/features/user/screens/UserEventDetailsPage';
import { UserNewsPage } from '@/features/user/screens/UserNewsPage';
import { UserBlogsPage } from '@/features/user/screens/UserBlogsPage';
import { UserDonationsPage } from '@/features/user/screens/UserDonationsPage';
import { UserContactPage } from '@/features/user/screens/UserContactPage';
import { UserSupportPage } from '@/features/user/screens/UserSupportPage';
import { UserMembershipPage } from '@/features/user/screens/UserMembershipPage';
import { UserNotificationsPage } from '@/features/user/screens/UserNotificationsPage';
import { UserProfilePage } from '@/features/user/screens/UserProfilePage';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { useAuth, resolveUserDestination } from '@/features/auth/store/authStore';
import { authService } from '@/features/auth/services/authService';

const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const hasToken = Boolean(authService.getAuthToken());

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = user || authService.getCurrentUser();
  const destination = resolveUserDestination(currentUser);
  return <Navigate to={destination} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Initial Entry Point: Login Page First (Matches Mobile APK) */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/auth/login" element={<Navigate to="/login" replace />} />

        {/* Account Password Recovery & Reset (Parity with Mobile ResetPasswordScreen) */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Public Homepage & Role Selection */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/public" element={<HomePage />} />
        <Route path="/portal" element={<HomePage />} />

        {/* User Application Routes (Cloned APK User Portal) */}
        <Route element={<UserLayout />}>
          <Route path="/user" element={<UserDashboardPage />} />
          <Route path="/user/dashboard" element={<UserDashboardPage />} />
          <Route path="/about" element={<UserAboutPage />} />
          <Route path="/what-we-do" element={<UserWhatWeDoPage />} />
          <Route path="/what-we-do/:initiativeId" element={<UserWhatWeDoDetailPage />} />
          <Route path="/rights" element={<UserRightsPage />} />
          <Route path="/rights/:rightId" element={<UserRightDetailsPage />} />
          <Route path="/know-your-rights" element={<UserRightsPage />} />
          <Route path="/know-your-rights/:rightId" element={<UserRightDetailsPage />} />
          <Route path="/events" element={<UserEventsPage />} />
          <Route path="/events/:id" element={<UserEventDetailsPage />} />
          <Route path="/event" element={<UserEventsPage />} />
          <Route path="/event/:id" element={<UserEventDetailsPage />} />
          <Route path="/user/events/:id" element={<UserEventDetailsPage />} />
          <Route path="/news" element={<UserNewsPage />} />
          <Route path="/press" element={<UserNewsPage />} />
          <Route path="/blogs" element={<UserBlogsPage />} />
          <Route path="/articles" element={<UserBlogsPage />} />
          <Route path="/donations" element={<UserDonationsPage />} />
          <Route path="/contact" element={<UserContactPage />} />
          <Route path="/support" element={<UserSupportPage />} />
          <Route path="/complaints" element={<UserSupportPage />} />
          <Route path="/membership" element={<UserMembershipPage />} />
          <Route path="/membership/status" element={<UserMembershipPage />} />
          <Route path="/user/membership" element={<UserMembershipPage />} />
          <Route path="/user/membership-status" element={<UserMembershipPage />} />
          <Route path="/user/membership/status" element={<UserMembershipPage />} />
          <Route path="/membership-status" element={<UserMembershipPage />} />
          <Route path="/membership-applications" element={<UserMembershipPage />} />
          <Route path="/user/transactions" element={<UserTransactionsPage />} />
          <Route path="/transactions" element={<UserTransactionsPage />} />
          <Route path="/my-transactions" element={<UserTransactionsPage />} />
          <Route path="/payment-history" element={<UserTransactionsPage />} />
          <Route path="/receipts-history" element={<UserTransactionsPage />} />
          <Route path="/user/profile" element={<UserProfilePage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/user/notifications" element={<UserNotificationsPage />} />
          <Route path="/notifications" element={<UserNotificationsPage />} />
        </Route>

        {/* Role-Aware Dashboard Entry Point */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/users" element={<Navigate to="/admin/users" replace />} />
        <Route path="/all-users" element={<Navigate to="/admin/all-users" replace />} />
        <Route path="/members" element={<Navigate to="/admin/members" replace />} />
        <Route path="/applications" element={<Navigate to="/admin/membership-applications" replace />} />
        <Route path="/assistance" element={<Navigate to="/admin/assistance" replace />} />
        <Route path="/tickets" element={<Navigate to="/admin/support" replace />} />
        <Route path="/press-releases" element={<Navigate to="/admin/news" replace />} />
        <Route path="/blog" element={<Navigate to="/admin/blogs" replace />} />
        <Route path="/legal-rights" element={<Navigate to="/admin/rights" replace />} />
        <Route path="/expenses" element={<Navigate to="/admin/expenses" replace />} />
        <Route path="/expense" element={<Navigate to="/admin/expenses" replace />} />
        <Route path="/vouchers" element={<Navigate to="/admin/expenses" replace />} />
        <Route path="/expense-vouchers" element={<Navigate to="/admin/expenses" replace />} />
        <Route path="/receipts" element={<Navigate to="/admin/receipts" replace />} />
        <Route path="/receipt" element={<Navigate to="/admin/receipts" replace />} />
        <Route path="/income" element={<Navigate to="/admin/receipts" replace />} />
        <Route path="/income-vouchers" element={<Navigate to="/admin/receipts" replace />} />
        <Route path="/accounting" element={<Navigate to="/admin/accounting" replace />} />
        <Route path="/ledger" element={<Navigate to="/admin/accounting" replace />} />
        <Route path="/chart-of-accounts" element={<Navigate to="/admin/accounting?tab=accounts" replace />} />
        <Route path="/journal-entries" element={<Navigate to="/admin/accounting?tab=journals" replace />} />
        <Route path="/passbook" element={<Navigate to="/admin/accounting?tab=passbook" replace />} />
        <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
        <Route path="/financial-reports" element={<Navigate to="/admin/reports" replace />} />
        <Route path="/analytics" element={<Navigate to="/admin/reports" replace />} />
        <Route path="/trial-balance" element={<Navigate to="/admin/reports/trial-balance" replace />} />
        <Route path="/profit-loss" element={<Navigate to="/admin/reports/profit-loss" replace />} />
        <Route path="/balance-sheet" element={<Navigate to="/admin/reports/balance-sheet" replace />} />
        <Route path="/donation" element={<Navigate to="/admin/donations" replace />} />
        <Route path="/id-card" element={<Navigate to="/admin/profile/id-card" replace />} />
        <Route path="/my-id-card" element={<Navigate to="/admin/profile/id-card" replace />} />
        <Route path="/inbox" element={<Navigate to="/admin/notifications" replace />} />
        <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
        <Route path="/preferences" element={<Navigate to="/admin/settings" replace />} />
        <Route path="/system-settings" element={<Navigate to="/admin/settings" replace />} />

        {/* Step 1: Signup Category / Account Type Selection */}
        <Route path="/register" element={<SignupCategoryPage />} />
        <Route path="/signup" element={<SignupCategoryPage />} />
        <Route path="/create-account" element={<SignupCategoryPage />} />
        <Route path="/auth/register" element={<SignupCategoryPage />} />
        <Route path="/register/type" element={<SignupCategoryPage />} />
        <Route path="/register/category" element={<SignupCategoryPage />} />

        {/* General User Registration (Personal Details) */}
        <Route path="/register/user" element={<RegisterPage />} />
        <Route path="/register/general" element={<RegisterPage />} />

        {/* Member Registration Experience */}
        <Route path="/membership/apply" element={<MemberRegistrationPage />} />
        <Route path="/membership/categories" element={<MemberRegistrationPage />} />
        <Route path="/member/register" element={<MemberRegistrationPage />} />
        <Route path="/become-a-member" element={<MemberRegistrationPage />} />
        <Route path="/apply-membership" element={<MemberRegistrationPage />} />

        {/* Public Donation Seeker Registration & Assistance Application */}
        <Route path="/assistance/apply" element={<SeekerRegistrationPage />} />
        <Route path="/assistance/track" element={<SeekerRegistrationPage />} />
        <Route path="/apply-assistance" element={<SeekerRegistrationPage />} />
        <Route path="/donation-seeker" element={<SeekerRegistrationPage />} />
        <Route path="/seeker/register" element={<SeekerRegistrationPage />} />

        {/* Member Self-Service Portal Routes */}
        <Route path="/member" element={<MemberLayout />}>
          <Route index element={<Navigate to="/member/dashboard" replace />} />
          <Route path="dashboard" element={<MemberDashboardPage />} />
          <Route path="id-card" element={<MemberIdCardPage />} />
          <Route path="certificate" element={<MemberCertificatePage />} />
          <Route path="renew" element={<MemberRenewalPage />} />
          <Route path="causes" element={<MemberCausesPage />} />
          <Route path="passbook" element={<MemberPassbookPage />} />
          <Route path="transactions" element={<UserTransactionsPage />} />
          <Route path="support" element={<MemberSupportPage />} />
          <Route path="profile" element={<MemberProfilePage />} />
          <Route path="about" element={<MemberAboutPage />} />
          <Route path="events" element={<MemberEventsPage />} />
          <Route path="events/:id" element={<MemberEventDetailsPage />} />
          <Route path="rights" element={<MemberRightsPage />} />
          <Route path="news" element={<MemberNewsPage />} />
          <Route path="blogs" element={<MemberBlogsPage />} />
          <Route path="notifications" element={<MemberNotificationsPage />} />
          <Route path="settings" element={<MemberSettingsPage />} />
          <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
        </Route>

        {/* Authenticated Donation Seeker Portal Routes */}
        <Route path="/seeker" element={<SeekerLayout />}>
          <Route index element={<Navigate to="/seeker/home" replace />} />
          <Route path="home" element={<SeekerHomePage />} />
          <Route path="requests" element={<SeekerRequestsPage />} />
          <Route path="requests/:id" element={<SeekerRequestDetailsPage />} />
          <Route path="aid" element={<Navigate to="/seeker/requests" replace />} />
          <Route path="apply" element={<SeekerApplyPage />} />
          <Route path="apply-aid" element={<Navigate to="/seeker/apply" replace />} />
          <Route path="rights" element={<SeekerRightsPage />} />
          <Route path="rights/:id" element={<SeekerRightDetailsPage />} />
          <Route path="events" element={<SeekerEventsPage />} />
          <Route path="events/:id" element={<SeekerEventDetailsPage />} />
          <Route path="support" element={<SeekerSupportPage />} />
          <Route path="support/create" element={<SeekerCreateTicketPage />} />
          <Route path="complaint" element={<SeekerCreateTicketPage />} />
          <Route path="profile" element={<SeekerProfilePage />} />
          <Route path="profile/id-card" element={<SeekerIdCardPage />} />
          <Route path="id-card" element={<Navigate to="/seeker/profile/id-card" replace />} />
          <Route path="notifications" element={<SeekerNotificationsPage />} />
          <Route path="*" element={<Navigate to="/seeker/home" replace />} />
        </Route>

        {/* Admin Back-Office Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />

          {/* User Management */}
          <Route path="users" element={<UsersListPage />} />
          <Route path="users/directory" element={<AllUsersDirectoryPage />} />
          <Route path="users/add" element={<AddUserPage />} />
          <Route path="users/:id" element={<UserDetailsPage />} />
          <Route path="users/:id/edit" element={<EditUserPage />} />
          <Route path="users/:id/verification" element={<UserVerificationPage />} />
          <Route path="users/:id/verify" element={<UserVerificationPage />} />
          <Route path="all-users" element={<AllUsersDirectoryPage />} />
          <Route path="all-users/:id" element={<UserDetailsPage />} />

          {/* Applications */}
          <Route path="applications" element={<ApplicationsListPage />} />
          <Route path="applications/:id" element={<ApplicationDetailsPage />} />
          <Route path="membership-applications" element={<ApplicationsListPage />} />
          <Route path="membership-applications/:id" element={<ApplicationDetailsPage />} />

          {/* Members */}
          <Route path="members" element={<MembersListPage />} />
          <Route path="members/add" element={<AddMemberPage />} />
          <Route path="members/:id" element={<MemberDetailsPage />} />
          <Route path="members/:id/edit" element={<EditMemberPage />} />
          <Route path="member" element={<Navigate to="/admin/members" replace />} />
          <Route path="members-directory" element={<Navigate to="/admin/members" replace />} />
          <Route path="all-members" element={<Navigate to="/admin/members" replace />} />

          {/* Assistance & Social Aid */}
          <Route path="assistance" element={<AssistanceListPage />} />
          <Route path="assistance/create" element={<CreateSeekerPage />} />
          <Route path="assistance/create-seeker" element={<CreateSeekerPage />} />
          <Route path="assistance/:id" element={<AssistanceDetailsPage />} />
          <Route path="donation-seekers" element={<Navigate to="/admin/assistance" replace />} />
          <Route path="aid" element={<Navigate to="/admin/assistance" replace />} />

          {/* Support Tickets */}
          <Route path="support" element={<SupportTicketsListPage />} />
          <Route path="support/:id" element={<SupportTicketDetailsPage />} />
          <Route path="support/:id/chat" element={<SupportTicketChatPage />} />
          <Route path="complaints" element={<Navigate to="/admin/support" replace />} />
          <Route path="complaints/:id" element={<SupportTicketDetailsPage />} />
          <Route path="complaints/:id/chat" element={<SupportTicketChatPage />} />
          <Route path="tickets" element={<Navigate to="/admin/support" replace />} />
          <Route path="tickets/:id" element={<SupportTicketDetailsPage />} />
          <Route path="tickets/:id/chat" element={<SupportTicketChatPage />} />

          {/* Events */}
          <Route path="events" element={<EventsListPage />} />
          <Route path="events/:id" element={<EventDetailsPage />} />
          <Route path="event" element={<Navigate to="/admin/events" replace />} />

          {/* News & Press */}
          <Route path="news" element={<NewsListPage />} />
          <Route path="news/create" element={<CreateNewsPage />} />
          <Route path="news/:id" element={<NewsDetailsPage />} />
          <Route path="news/:id/edit" element={<EditNewsPage />} />
          <Route path="press" element={<Navigate to="/admin/news" replace />} />
          <Route path="press-releases" element={<Navigate to="/admin/news" replace />} />

          {/* Blogs */}
          <Route path="blogs" element={<BlogsListPage />} />
          <Route path="blogs/create" element={<CreateBlogPage />} />
          <Route path="blogs/:id" element={<BlogDetailsPage />} />
          <Route path="blogs/:id/edit" element={<EditBlogPage />} />
          <Route path="articles" element={<Navigate to="/admin/blogs" replace />} />
          <Route path="blog" element={<Navigate to="/admin/blogs" replace />} />

          {/* Rights */}
          <Route path="rights" element={<KnowYourRightsPage />} />
          <Route path="rights/create" element={<CreateRightPage />} />
          <Route path="rights/:id" element={<RightDetailsPage />} />
          <Route path="rights/:id/edit" element={<EditRightPage />} />
          <Route path="know-your-rights" element={<Navigate to="/admin/rights" replace />} />
          <Route path="legal-rights" element={<Navigate to="/admin/rights" replace />} />

          {/* Expenses */}
          <Route path="expenses" element={<ExpensesListPage />} />
          <Route path="expenses/create" element={<CreateExpensePage />} />
          <Route path="expenses/:id" element={<ExpenseDetailsPage />} />
          <Route path="expense" element={<Navigate to="/admin/expenses" replace />} />
          <Route path="expense-vouchers" element={<Navigate to="/admin/expenses" replace />} />
          <Route path="vouchers" element={<Navigate to="/admin/expenses" replace />} />

          {/* Receipts */}
          <Route path="receipts" element={<ReceiptsListPage />} />
          <Route path="receipts/create" element={<CreateReceiptPage />} />
          <Route path="receipts/:id" element={<ReceiptDetailsPage />} />
          <Route path="receipt" element={<Navigate to="/admin/receipts" replace />} />
          <Route path="income" element={<Navigate to="/admin/receipts" replace />} />
          <Route path="income/create" element={<Navigate to="/admin/receipts/create" replace />} />
          <Route path="income/:id" element={<ReceiptDetailsPage />} />
          <Route path="income-vouchers" element={<Navigate to="/admin/receipts" replace />} />

          {/* Accounting & Ledger */}
          <Route path="accounting" element={<AccountingDashboardPage />} />
          <Route path="accounting/ledger" element={<AccountLedgerPage />} />
          <Route path="accounting/journal/:id" element={<JournalEntryDetailsPage />} />
          <Route path="accounting/accounts/:id/ledger" element={<AccountLedgerPage />} />
          <Route path="accounting/entries/:id" element={<JournalEntryDetailsPage />} />
          <Route path="ledger" element={<Navigate to="/admin/accounting" replace />} />
          <Route path="chart-of-accounts" element={<Navigate to="/admin/accounting?tab=accounts" replace />} />
          <Route path="journal-entries" element={<Navigate to="/admin/accounting?tab=journals" replace />} />
          <Route path="passbook" element={<Navigate to="/admin/accounting?tab=passbook" replace />} />

          {/* Financial Reports */}
          <Route path="reports" element={<ReportsOverviewPage />} />
          <Route path="reports/trial-balance" element={<TrialBalancePage />} />
          <Route path="reports/profit-loss" element={<ProfitLossPage />} />
          <Route path="reports/balance-sheet" element={<BalanceSheetPage />} />
          <Route path="financial-reports" element={<Navigate to="/admin/reports" replace />} />
          <Route path="analytics" element={<Navigate to="/admin/reports" replace />} />
          <Route path="trial-balance" element={<Navigate to="/admin/reports/trial-balance" replace />} />
          <Route path="profit-loss" element={<Navigate to="/admin/reports/profit-loss" replace />} />
          <Route path="balance-sheet" element={<Navigate to="/admin/reports/balance-sheet" replace />} />

          {/* Donations */}
          <Route path="donations" element={<DonationsListPage />} />
          <Route path="donations/:id" element={<DonationDetailsPage />} />
          <Route path="donations/:id/receipt" element={<DonationReceiptPage />} />
          <Route path="donation" element={<Navigate to="/admin/donations" replace />} />

          {/* Profile & Settings */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/id-card" element={<MyIdCardPage />} />
          <Route path="id-card" element={<Navigate to="/admin/profile/id-card" replace />} />
          <Route path="my-id-card" element={<Navigate to="/admin/profile/id-card" replace />} />
          <Route path="my-profile" element={<Navigate to="/admin/profile" replace />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="alerts" element={<Navigate to="/admin/notifications" replace />} />
          <Route path="inbox" element={<Navigate to="/admin/notifications" replace />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="preferences" element={<Navigate to="/admin/settings" replace />} />
          <Route path="system-settings" element={<Navigate to="/admin/settings" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Global 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
