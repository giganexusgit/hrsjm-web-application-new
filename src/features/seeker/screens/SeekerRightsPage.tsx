import React from 'react';
import { UserRightsPage } from '@/features/user/screens/UserRightsPage';

export const SeekerRightsPage: React.FC = () => {
  return <UserRightsPage isSeeker={true} />;
};
