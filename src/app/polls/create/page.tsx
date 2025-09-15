'use client';

import { useRouter } from 'next/navigation';
import PollForm from '@/components/polls/PollForm';
import { useRouteGuard } from '@/hooks/useRouteGuard';

export default function CreatePollPage() {
  const { isChecking } = useRouteGuard({ requireAuth: true });
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/polls');
  };

  const handleCancel = () => {
    router.back();
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PollForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
