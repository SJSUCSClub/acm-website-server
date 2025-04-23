import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { paths } from '@/types/schema.v1';
import React, { useState } from 'react';
import DeleteAlert from '@/components/molecules/delete-alert';
import Btn from '@/components/atoms/btn';
import { Check, CircleHelp, Pencil, Trash, X } from 'lucide-react';
import { useMutation } from '@/hooks/useFetch';
import { toast } from 'sonner';
import { useForm } from '@tanstack/react-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Question =
  paths['/v1/club/questions']['get']['responses']['200']['content']['application/json']['questions'][number];

export interface IQuestionCardProps {
  question: Question;
  handleDelete: (questionId: number) => void;
}

export interface IReadQuestionCardProps extends IQuestionCardProps {
  setEdit: (edit: boolean) => void;
}

export interface IEditQuestionCardProps extends Omit<IQuestionCardProps, 'handleDelete'> {
  setEdit: (edit: boolean) => void;
  setQuestion: (question: Question) => void;
}

const QuestionCard: React.FC<IQuestionCardProps> = ({ question: questionProp, handleDelete }) => {
  const [edit, setEdit] = useState(false);
  const [question, setQuestion] = useState(questionProp);
  return (
    <Card>
      {edit ? (
        <EditQuestionCard question={question} setEdit={setEdit} setQuestion={setQuestion} />
      ) : (
        <ReadQuestionCard question={question} setEdit={setEdit} handleDelete={handleDelete} />
      )}
    </Card>
  );
};

const ReadQuestionCard: React.FC<IReadQuestionCardProps> = ({
  question,
  setEdit,
  handleDelete
}) => {
  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{question.question}</CardTitle>
          <div className="flex items-center justify-end">
            <Btn variant="ghost" onClick={() => setEdit(true)}>
              <Pencil className="h-4 w-4" />
            </Btn>
            <DeleteAlert onDelete={() => handleDelete(question.id)}>
              <Btn variant="ghost">
                <Trash className="h-4 w-4" />
              </Btn>
            </DeleteAlert>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{question.answer}</p>
      </CardContent>
    </>
  );
};

const EditQuestionCard: React.FC<IEditQuestionCardProps> = ({ question, setEdit, setQuestion }) => {
  const { mutate: editQuestion } = useMutation('put', '/v1/club/questions/{questionID}');
  const form = useForm({
    defaultValues: {
      question: question.question,
      answer: question.answer
    },
    onSubmit: ({ value }) => {
      editQuestion(
        {
          params: {
            path: {
              questionID: question.id.toString()
            }
          },
          body: {
            question: value.question,
            answer: value.answer
          }
        },
        {
          onSuccess: () => {
            setQuestion({
              ...question,
              question: value.question,
              answer: value.answer
            });
            setEdit(false);
          },
          onError: () => {
            toast.error('Failed to update question');
          }
        }
      );
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <form.Field
            name="question"
            children={(field) => (
              <Input
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                type="text"
                className="w-full"
                required
              />
            )}
          />
          <div className="flex items-center justify-end">
            <Btn variant="ghost" type="submit">
              <Check className="h-4 w-4" />
            </Btn>
            <Btn variant="ghost" onClick={() => setEdit(false)}>
              <X className="h-4 w-4" />
            </Btn>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form.Field
          name="answer"
          children={(field) => (
            <Textarea
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full"
              required
            />
          )}
        />
      </CardContent>
    </form>
  );
};

export { QuestionCard };
