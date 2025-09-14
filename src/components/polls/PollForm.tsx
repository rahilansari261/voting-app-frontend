'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreatePollData } from '@/types';
import { useCreatePoll, useUpdatePoll } from '@/hooks/usePolls';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const pollSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  options: z.array(z.object({
    text: z.string().min(1, 'Option text is required'),
  })).min(2, 'At least 2 options are required'),
  published: z.boolean(),
});

type PollFormData = z.infer<typeof pollSchema>;

interface PollFormProps {
  initialData?: Partial<CreatePollData> & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function PollForm({ 
  initialData, 
  onSuccess, 
  onCancel, 
  isEditing = false 
}: PollFormProps) {
  const createPollMutation = useCreatePoll();
  const updatePollMutation = useUpdatePoll();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      question: initialData?.question || '',
      options: initialData?.options || [
        { text: '' },
        { text: '' },
      ],
      published: initialData?.published || false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const onSubmit = async (data: PollFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await updatePollMutation.mutateAsync({
          id: initialData.id,
          data: {
            question: data.question,
            options: data.options,
            published: data.published,
          },
        });
        // Success handling is done in the useUpdatePoll hook
      } else {
        await createPollMutation.mutateAsync({
          question: data.question,
          options: data.options,
          published: data.published,
        });
        // Success handling is done in the useCreatePoll hook
      }
      
      // Call success callback
      onSuccess?.();
    } catch (error: any) {
      // Error handling is done in the mutation hooks
      console.error('Poll operation failed:', error);
    }
  };

  const isLoading = createPollMutation.isPending || updatePollMutation.isPending;
  const error = createPollMutation.error || updatePollMutation.error;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isEditing ? 'Edit Poll' : 'Create New Poll'}
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Update your poll details' : 'Fill in the details to create a new poll'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Poll Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Poll Question</Label>
            <Textarea
              id="question"
              placeholder="What would you like to ask?"
              {...register('question')}
              className={errors.question ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.question && (
              <p className="text-sm text-red-500">{errors.question.message}</p>
            )}
          </div>

          {/* Poll Options */}
          <div className="space-y-4">
            <Label>Poll Options</Label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Input
                    {...register(`options.${index}.text`)}
                    placeholder={`Option ${index + 1}`}
                    className={errors.options?.[index]?.text ? 'border-red-500' : ''}
                  />
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.options && (
                <p className="text-sm text-red-500">
                  {errors.options.message || 'At least 2 options are required'}
                </p>
              )}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ text: '' })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="published" className="text-sm">
              Publish this poll immediately
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Poll' : 'Create Poll'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
