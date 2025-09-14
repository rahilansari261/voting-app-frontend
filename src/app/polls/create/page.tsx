'use client';

import { useRouter } from 'next/navigation';
import PollForm from '@/components/polls/PollForm';

export default function CreatePollPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/polls');
  };

  const handleCancel = () => {
    router.back();
  };

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
