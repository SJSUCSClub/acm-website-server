import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { useQuery } from '@/hooks/useFetch';
import React from 'react';

export const Faq: React.FC = () => {
  const { data } = useQuery('get', '/v1/club/questions');

  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Questions? We Got Answers.</h1>
      <div>
        <Accordion type="single" collapsible className="w-full">
          {data?.questions.map((item) => (
            <AccordionItem key={item.id} value={`item-${item.id}`}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent>
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
