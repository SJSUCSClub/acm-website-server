import React, { useState } from "react";

export const Faq: React.FC = () => {
  const questions = [
    {
      question: "Who's allowed to join this club?",
      answer:
        "ACM@SJSU is open to all SJSU students, regardless of their major!",
    },
    {
      question: "What are the rules of the club?",
      answer: " Be respectful, keep the clubroom clean, and have fun!",
    },
    {
      question: "Is there a membership fee for the club?",
      answer: "Yes. It's $20 for 1 semester or $30 for 2 semesters.",
    },
    {
      question: "What do I get for a paid membership?",
      answer:
        "Paid members are invited to attend exclusive networking sessions, tech talks, and company events. We collaborate with many industry leaders, including Google, Tesla, and Nvidia, so don't miss out!",
    },
  ];

  const [expandedIndex, setExpandedIndex] = useState(-1);

  const handleQuestionClick = (index: number) => {
    if (index === expandedIndex) {
      setExpandedIndex(-1);
    } else {
      setExpandedIndex(index);
    }
  };
  return (
    <>
      <div className="footer bg-black w-full flex flex-col">
        <div className="text-white text-4xl md:text-5xl flex justify-center text-center font-bold">
          <div className="mt-10">
            <h1>Questions? We Got Answers. </h1>
          </div>
        </div>
        <div className="text-white font-bold text-xl flex justify-center mt-10 mb-10 ">
          <div className="w-1/2 ">
            {questions.map((questionObj, index) => (
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
                        index === expandedIndex ? "transform rotate-180" : ""
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

                {index === expandedIndex && (
                  <p className="text-lg mb-5 mt-5">{questionObj.answer}</p>
                )}
                <div className="border-t border-white mt-5"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
