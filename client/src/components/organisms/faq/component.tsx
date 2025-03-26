import { useQuery } from '@/hooks/useFetch';
import React, { useState } from 'react';

export const Faq: React.FC = () => {
  const { data } = useQuery('get', '/v1/club/questions');

  const [expandedIndex, setExpandedIndex] = useState(-1);

  const handleQuestionClick = (index: number) => {
    if (index === expandedIndex) {
      setExpandedIndex(-1);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <section className="faq-section bg-black w-full flex flex-col mt-auto">
      <div className="text-white text-4xl md:text-5xl flex justify-center text-center font-bold">
        <div className="mt-10">
          <h1>Questions? We Got Answers. </h1>
        </div>
      </div>
      <div className="text-white font-bold text-xl flex justify-center mt-10 mb-10 ">
        <div className="w-full px-4 md:w-1/2 ">
          {data?.questions.map((questionObj, index) => (
            <div key={index}>
              <h2
                className="mb-5 mt-5 cursor-pointer flex items-center relative"
                onClick={() => handleQuestionClick(index)}
              >
                {questionObj.question}
                <div className="ml-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className={`w-10 h-6 transition-transform duration-500  ${
                      index === expandedIndex ? 'transform rotate-180' : ''
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </h2>

              {index === expandedIndex && <p className="text-lg mb-5 mt-5">{questionObj.answer}</p>}
              <div className="border-t border-white mt-5"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
