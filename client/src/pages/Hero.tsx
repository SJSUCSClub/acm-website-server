import ACMCSHero from "acm-cs-sjsu-hero-component";
import GetInvolvedCard from "../components/molecules/get-involved-card";
import SpotLightCard from "../components/molecules/spotlight-card";
import TestimonialCard from "../components/molecules/testimonial-card";

import { useState } from "react";
import MemberBtn from "../components/molecules/member-btn";
import GetInvolvedBtn from "../components/molecules/get-involved-btn";
import SocialBtn from "../components/molecules/social-btn";

const spotlights: ISpotlight[] = [
  {
    type: "TECH TALK",
    image: "/photos/events/teslatalk.png",
    title: "ACM x Tesla Tech Talk",
    description:
      "Guest speaker Phuc Ngo, an NLP and Senior Data Engineer at Tesla, talks about his experiences and journey in the industry.",
    id: 1,
  },
  {
    type: "EVENT",
    image: "/photos/events/googlealumni.png",
    title: "Fall 2023 Google Alumni Panel",
    description:
      "ACM hosted a Q&A panel with SJSU alumni who are now working at Google. Members had the opportunity to gain insight into the technical interview process and what a typical workday at Google looks like, as well as network with panelists.",
    id: 2,
  },

  {
    type: "EVENT",
    image: "/photos/events/googlecloudhero.png",
    title: "Google Cloud Hero 2023",
    description:
      "Cloud Hero gets a room full of people competing head-to-head, with a live play-by-play leaderboard and lots of prizes. To date, over 1,000 players have played Cloud Hero at 12 public events like Google Cloud Next and Google Cloud Summits—with more venues on the way!",
    id: 3,
  },
];

interface ISpotlight {
  type: string;
  image: string;
  title: string;
  description: string;
  id: number;
}

const testimonial1 = {
  text: '"The hands-on experience I gained from the club\'s workshops has been invaluable for my software development skills."',
  name: "JOHNSON",
  job: "Full Stack Developer at Shopify",
};

const testimonial2 = {
  text: '"I never knew how many opportunities were available in tech until I attended the club\'s career events. Truly eye-opening!"',
  name: "SAMANTHA RUIZ",
  job: "Data Analyst at Microsoft",
};

const testimonial3 = {
  text: '"The mentorship I\'ve received as a club member has really improved my coding skills but also my confidence in problem solving"',
  name: "ELIJAH SMITH",
  job: "Systems Engineer at IBM",
};

const freePlan = {
  plan: "Free Plan",
  price: "$0.00",
  description: "You can get involved without a free.",
  priceStyling: "text-5xl font-bold text-gray-400",
  textList: [
    "Access to free events, workshops, hackathons, and coding competitions",
    "Networking opportunities with industry leaders and alumni.",
  ],
  buttonText: "Register",
  buttonStyling:
    "rounded-full bg-white-500 hover:bg-blue-500 hover:text-white border border-blue-500 no-underline text-blue-500 font-bold py-3 px-6 cursor-pointer",
};

const semesterPlan = {
  plan: "Semester Plan",
  price: "$19.95/sem.",
  description: "Take advantage of member perks today!",
  priceStyling: "text-5xl font-bold text-yellow-500",
  textList: [
    "All benefits of the Free Membership.",
    "Access to exclusive member-only events and workshops.",
    "Priority registration for hackathons and coding competitions.",
    "Complementary club merchandise.",
  ],
  buttonText: "Choose This Plan > ",
  buttonStyling:
    "rounded-full bg-yellow-500 hover:bg-yellow-600 no-underline text-white font-bold py-3 px-6 cursor-pointer",
};

const annualPlan = {
  plan: "Annual Plan",
  price: "$29.95/yr.",
  description: "Year-Round Advantages",
  priceStyling: "text-5xl font-bold text-blue-500",
  textList: [
    "All benefits of the Semester Membership for a full year.",
    "Additional savings over the semesterly rate.",
  ],
  buttonText: "Choose This Plan > ",
  buttonStyling:
    "rounded-full bg-[#1a6096] hover:bg-[#0c4e7e] no-underline text-white font-bold py-3 px-6 cursor-pointer",
};

const Hero = () => {
  const [card] = useState(spotlights);
  return (
    <div className="text-center min-w-full flex-col items-center justify-between pt-10 pb-20 px-[5%]">
      <div className="min-h-screen">
        <div className="flex place-content-center md:scale-100">
          <ACMCSHero />
        </div>

        <div className="md:text-lg text-[3vw] text-center transform md:-translate-y-24 pb-3 flex-cols md:flex items-center place-content-center gap-5">
          <SocialBtn
            className="w-full md:w-auto"
            href="https://discord.gg/Rw85ngkExu"
          >
            <img
              className="dark:invert pr-[2%] md:pr-[5%] w-[5vw] md:w-[30%] h-auto"
              src="./icons/discord.svg"
              width={0}
              height={0}
              alt={""}
            />
            Discord
          </SocialBtn>

          <SocialBtn
            className="w-full md:w-auto"
            href="https://www.instagram.com/sjsuacm/"
          >
            <img
              className="dark:invert pr-[2%] md:pr-[5%] w-[5vw] md:w-[25%] h-auto"
              src="./icons/Instagram.svg"
              width={0}
              height={0}
              alt={""}
            />
            Instagram
          </SocialBtn>

          <SocialBtn
            className="w-full md:w-auto"
            href="https://www.linkedin.com/company/sjsu-computer-science-club/about/"
          >
            <img
              className="dark:invert pr-[2%] md:pr-[5%] w-[5vw] md:w-[25%] h-auto"
              src="./icons/logo2.svg"
              width={0}
              height={0}
              alt={""}
            />
            Linkedin
          </SocialBtn>

          <MemberBtn
            variant="primary"
            className="shadow-md animate-[fadeIn_2s_ease-in-out] hover:scale-110 duration-300"
          />
        </div>

        <div className="animate-[fadeIn_2s_ease-in-out] text-left inline flex flex-col gap-4">
          <div className="text-5xl font-[600]">
            We are the largest{" "}
            <span className="inline text-yellow-500"> Computer Science</span>{" "}
            organization at{" "}
            <span className="inline text-[#1a6096]">
              San José State University.
            </span>
          </div>

          <div className="mt-7 text-xl font-[600]">
            Thinking about getting{" "}
            <span className="inline text-yellow-500"> involved? </span>
          </div>
          <div className="py-4 text-base font-normal">
            {" "}
            Engage with other ACM at SJSU members and elevate your tech journey.
            Access valuable resources like mock interviews for interview prep,
            thrilling hackathons, and coding competitions. Connect with industry
            leaders like Apple, Tesla, and <b>Google</b> for exclusive
            networking opportunities.
          </div>
        </div>
        <MemberBtn
          variant="tertiary"
          className="animate-[fadeIn_2s_ease-in-out] hover:scale-110 duration-300"
        />
      </div>

      <div className="border-y-2 place-items-center grid grid-cols-4 grid-rows-1 py-12">
        <img
          src="./icons/kohlslogo.svg"
          width={200}
          height={200}
          alt={""}
          className=""
        />
        <img src="./icons/teslalogo.svg" width={95} height={95} alt={""} />
        <img src="./icons/google.png" width={95} height={95} alt={""} />
        <img src="./icons/fetch-ai.png" width={200} height={200} alt={""} />
      </div>

      <div className="border-y-2 place-items-center py-5">
        <h1 className="!mt-10 text-4xl font-bold">Teams</h1>
        <h2 className="text-1xl font-bold mb-2 pt-3 text-gray-400">
          We have a place for everyone.
        </h2>
        <div className="place-items-center grid grid-cols-3 grid-rows-1 py-10 gap-64">
          <div className="text-[#8F69C2] font-semibold stroke-slate-500">
            <img
              className="py-3"
              src="./icons/softwareicon.svg"
              width={105}
              height={105}
              alt={""}
            />
            Software
          </div>

          <div className="text-[#C28F69] font-bold">
            <img
              className="py-3"
              src="./icons/hardwareicon.svg"
              width={105}
              height={105}
              alt={""}
            />
            Hardware
          </div>

          <div className="text-[#69C28F] font-bold">
            <img
              className="py-3"
              src="./icons/designicon.svg"
              width={105}
              height={105}
              alt={""}
            />
            Design
          </div>
        </div>
      </div>

      <div className="p-50 pt-16 border-y-2 pb-5">
        <h1 className="text-4xl font-bold">Spotlights</h1>
        <h2 className="text-1xl font-bold pb-10 pt-3 text-gray-400">
          Our past events.
        </h2>
        <div className="flex-cols gap-3 md:flex items-center md:gap-5 overflow-auto p-10 mb-5">
          {card.map((event) => {
            return (
              <SpotLightCard
                type={event.type}
                image={event.image}
                title={event.title}
                description={event.description}
                key={event.id}
              />
            );
          })}
        </div>
      </div>

      <h1 className="pt-16 text-4xl font-bold">Testimonials</h1>
      <h2 className="text-1xl font-bold pb-4 pt-3 text-gray-400">
        From our dedicated members and supportive alumni.
      </h2>
      <div className="p-50 flex min-w-fit overflow-scroll grid grid-cols-1 pb-6 gap-8 justify-between">
        <TestimonialCard
          text={testimonial1.text}
          name={testimonial1.name}
          job={testimonial1.job}
        />
        <TestimonialCard
          text={testimonial2.text}
          name={testimonial2.name}
          job={testimonial2.job}
        />
        <TestimonialCard
          text={testimonial3.text}
          name={testimonial3.name}
          job={testimonial3.job}
        />
      </div>
      <h1 className="!mt-10 text-4xl font-bold pt-10">Get Involved</h1>
      <h2 className="text-1xl font-bold mb-2 pt-3 text-gray-500">
        Become a member and take advantage of member perks today!
      </h2>
      <div className="p-50 grid grid-cols-1 sm:grid-cols-3 gap-8 flex-row justify-between pt-10 ">
        <GetInvolvedCard
          plan={freePlan.plan}
          price={freePlan.price}
          description={freePlan.description}
          priceStyling={freePlan.priceStyling}
          textList={freePlan.textList}
          buttonText={freePlan.buttonText}
          buttonStyling="ghost"
        />
        <GetInvolvedCard
          plan={semesterPlan.plan}
          price={semesterPlan.price}
          description={semesterPlan.description}
          priceStyling={semesterPlan.priceStyling}
          textList={semesterPlan.textList}
          buttonText={semesterPlan.buttonText}
          buttonStyling="primary"
        />
        <GetInvolvedCard
          plan={annualPlan.plan}
          price={annualPlan.price}
          description={annualPlan.description}
          priceStyling={annualPlan.priceStyling}
          textList={annualPlan.textList}
          buttonText={annualPlan.buttonText}
          buttonStyling="secondary"
        />
      </div>
      <div className="flex justify-center items-center pt-12 ">
        <GetInvolvedBtn />
      </div>
    </div>
  );
};

export default Hero;
