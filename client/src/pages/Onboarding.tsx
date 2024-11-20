import Input from "../components/atoms/input";
import Dropdown from "../components/atoms/dropdown";
import OnboardingCard from "../components/molecules/onboarding-card";
import ProgressBar from "../components/molecules/progress-bar";
import { useState } from "react";
import Btn from "../components/atoms/btn";
import RightArrow from "/about/rightarrow.svg";
import Select from "../components/atoms/select";

type tempUserType = {
  name: string;
};

const tempUser: tempUserType = {
  name: "Naya",
};

const educationLevelOptions: Array<string> = ["Undergraduate", "Graduate"];

const tempMajorOptions: Array<string> = [
  "Computer Science",
  "Data Science",
  "Computer Engineering",
  "Software Engineering",
];

const purposeOptions: Array<string> = ["Networking", "Other"];

const interestOptions: Array<string> = [
  "Web Development",
  "Machine Learning",
  "Cloud Computing",
  "Artificial Intelligence",
];

type User = {
  educationLevel: string;
  major: string;
  gradDate: Date;
  purpose: string;
  interests: Array<string>;
  linkedin: string;
  github: string;
  website: string;
};

const Page = () => {
  const [progress, setProgress] = useState<number>(0.0);
  const [page, setPage] = useState<number>(0);

  const [user, setUser] = useState<User>({
    educationLevel: educationLevelOptions[0],
    major: "",
    gradDate: new Date(),
    purpose: purposeOptions[0],
    interests: [],
    linkedin: "",
    github: "",
    website: "",
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<string[]>([]);

  const handleInterestChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    option: string,
  ) => {
    console.log(option);
    setSelectedInterests((prevSelectedOptions) =>
      prevSelectedOptions.includes(option)
        ? prevSelectedOptions.filter((item) => item !== option)
        : [...prevSelectedOptions, option],
    );
  };

  const handlePurposeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    option: string,
  ) => {
    console.log(option);
    setSelectedPurpose((prevSelectedOptions) =>
      prevSelectedOptions.includes(option)
        ? prevSelectedOptions.filter((item) => item !== option)
        : [...prevSelectedOptions, option],
    );
  };

  const handleChange = (key: string, value: string) => {
    setUser({ ...user, [key]: value });
  };

  function nextPage() {
    if (page < 2) {
      console.log(user);
      console.log(selectedInterests);
      console.log(selectedPurpose);
      setPage(page + 1);
      setProgress(progress + 0.5);
    } else {
      window.location.href = "/";
    }
  }

  function backPage() {
    setPage(page - 1);
    setProgress(progress - 0.5);
  }

  function renderContinueButton(text: string = "Continue") {
    return (
      <>
        <br />
        <div className="flex justify-between">
          <Btn
            variant="primary"
            className="bg-transparent text-primary border-none pl-0 hover:bg-transparent disabled:bg-transparent"
            disabled={page < 1}
            onClick={() => backPage()}
          >
            {"< Back"}
          </Btn>
          <Btn variant="primary" onClick={() => nextPage()}>
            <span className="">{text}</span>
            <img src={RightArrow} alt="right arrow" />
          </Btn>
        </div>
      </>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div className="w-[75%] md:w-[50%] lg:w-[40%]">
        <div>
          <br />
          <br />
          <ProgressBar value={progress} max={1} />
          <br />
          <br />

          {page === 0 && (
            <OnboardingCard
              header="Welcome"
              boldHeader={`${tempUser.name}!`}
              subtitle="We'd love to know a bit more about you"
            >
              <Dropdown
                label="Education"
                required={true}
                options={educationLevelOptions}
                onChange={(e) => handleChange("status", e.target.value)}
              />
              <Dropdown
                label="Major"
                required={true}
                footer="All majors are welcome :)"
                options={tempMajorOptions}
                onChange={(e) => handleChange("major", e.target.value)}
              />
              <Input type="date" label="Graduation Date" required={true} />
              <Select
                label="Purpose"
                required={false}
                options={purposeOptions}
                footer="Tell us what brings you to the ACM club"
                changeFunction={handlePurposeChange}
              />
              <Select
                label="Interest(s)"
                multiple={true}
                required={false}
                options={interestOptions}
                changeFunction={handleInterestChange}
              />
              {renderContinueButton()}
            </OnboardingCard>
          )}
          {page === 1 && (
            <OnboardingCard
              header="Connect your social profiles"
              boldHeader=""
              subtitle=""
            >
              <Input
                label="LinkedIn"
                required={false}
                icon="/src/assets/Link.svg"
                placeholder="https://linkedin.com/in/john-doe"
                onChange={(e) => handleChange("linkedin", e.target.value)}
              />
              <Input
                label="Github"
                required={false}
                icon="/src/assets/Link.svg"
                placeholder="https://github.com/john-doe"
                onChange={(e) => handleChange("github", e.target.value)}
              />
              <Input
                label="Website"
                required={false}
                icon="/src/assets/Link.svg"
                placeholder="https://johndoe.com"
                onChange={(e) => handleChange("website", e.target.value)}
              />
              {renderContinueButton()}
            </OnboardingCard>
          )}
          {page === 2 && (
            <OnboardingCard
              image="/src/assets/trophy.svg"
              header=""
              boldHeader="Congratulations!"
              subtitle="You're all set! Welcome to the ACM Club at San José State University. Make the most out of your experience with us."
            >
              <div></div>
              {renderContinueButton("Start Exploring")}
            </OnboardingCard>
          )}
          <br />
        </div>
      </div>
    </div>
  );
};

export default Page;
