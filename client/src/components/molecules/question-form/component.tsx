import Btn from '@/components/atoms/btn';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { paths } from '@/types/schema.v1';
import { useForm } from '@tanstack/react-form';
import React, { useState } from 'react';

export type QuestionBody = Omit<
  paths['/v1/club/questions']['get']['responses']['200']['content']['application/json']['questions'][number],
  'id'
>;
interface IQuestionFormProps {
  handleCreate: (question: QuestionBody) => void;
}

const QuestionForm: React.FC<IQuestionFormProps> = ({ handleCreate }) => {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      question: '',
      answer: ''
    },
    onSubmit: ({ value }) => {
      handleCreate(value);
      setOpen(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogTrigger asChild>
        <Btn variant="outline" onClick={() => setOpen(true)}>
          Create Question
        </Btn>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Question</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4 py-4">
            <form.Field
              name="question"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-muted-foreground text-xs font-bold">
                    Question
                  </Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            />
            <form.Field
              name="answer"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name} className="text-muted-foreground text-xs font-bold">
                    Answer
                  </Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            />
          </div>
          <DialogFooter>
            <Btn variant="outline" type="submit">
              Create
            </Btn>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { QuestionForm };
