import FetchError from '@/components/molecules/fetch-error';
import Loading from '@/components/molecules/loading';
import QuestionCard from '@/components/molecules/question-card';
import QuestionForm, { QuestionBody } from '@/components/molecules/question-form';
import { useMutation, useQuery } from '@/hooks/useFetch';
import React from 'react';
import { toast } from 'sonner';

export const QuestionList: React.FC = () => {
  const { data: questions, error, isLoading, refetch } = useQuery('get', '/v1/club/questions');
  const { mutate: deleteQuestion } = useMutation('delete', '/v1/club/questions/{questionID}');
  const { mutate: createQuestion } = useMutation('post', '/v1/club/questions');

  const handleDelete = (questionId: number) => {
    deleteQuestion(
      {
        params: {
          path: {
            questionID: questionId.toString()
          }
        }
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          toast.error('Failed to delete question');
        }
      }
    );
  };

  const handleCreate = (question: QuestionBody) => {
    createQuestion(
      {
        body: {
          question: question.question,
          answer: question.answer
        }
      },
      {
        onSuccess: () => {
          refetch();
        },
        onError: () => {
          toast.error('Failed to create question');
        }
      }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <QuestionForm handleCreate={handleCreate} />
      </div>
      <Loading isLoading={isLoading}>
        <FetchError isError={!!error || !questions}>
          {questions?.questions.length === 0 && (
            <div className="text-center text-lg">No questions found</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions?.questions.map((question) => (
              <QuestionCard key={question.id} question={question} handleDelete={handleDelete} />
            ))}
          </div>
        </FetchError>
      </Loading>
    </div>
  );
};
