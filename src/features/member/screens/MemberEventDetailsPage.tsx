import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventDetailsView } from '@/features/admin/events/components/EventDetailsView';

export const MemberEventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <EventDetailsView
      eventId={id}
      onBack={() => navigate('/member/events')}
    />
  );
};

