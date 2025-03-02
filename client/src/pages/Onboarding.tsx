import React, { useState, useEffect } from "react";
import Input from "../components/atoms/input";
import Dropdown from "../components/atoms/dropdown";
import ProgressBar from "../components/molecules/progress-bar";
import Btn from "../components/atoms/btn";
import RightArrow from "/about/rightarrow.svg";
import Select from "../components/atoms/select";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { useQuery, useMutation } from "@/hooks/useFetch";
import { paths } from "@/types/schema.v1";
import { useNavigate } from "@tanstack/react-router";
import OnboardingCard from "@/components/molecules/onboarding-card";

type User =
  paths["/v1/users/my"]["get"]["responses"]["200"]["content"]["application/json"];

interface OnboardingTabProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setUpdatedUser: React.Dispatch<React.SetStateAction<User | null>>;
  updatedUser: User;
}

interface SocialsProps extends OnboardingTabProps {
  setComplete: () => void;
}

const Page = () => {
  const [page, setPage] = useState<number>(0);
  const { data: user } = useQuery("get", "/v1/users/my");
  const { mutate } = useMutation("put", "/v1/users/my");
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = () => {
      setUpdatedUser(user || null);
    };
    getUser();
  }, [user]);

  const setComplete = () => {
    if (!updatedUser) return;
    mutate({
      body: updatedUser,
    });
    setPage(2);
  };

  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-[75%] md:w-[50%] lg:w-[40%] space-y-10">
        <ProgressBar value={page * 0.5} max={1} />

        {updatedUser && (
          <div>
            {page === 0 && (
              <PersonalInfo
                setPage={setPage}
                setUpdatedUser={setUpdatedUser}
                updatedUser={updatedUser}
              />
            )}
            {page === 1 && (
              <Socials
                setPage={setPage}
                updatedUser={updatedUser}
                setUpdatedUser={setUpdatedUser}
                setComplete={setComplete}
              />
            )}
            {page === 2 && <Done />}
          </div>
        )}
      </div>
    </div>
  );
};

const PersonalInfo: React.FC<OnboardingTabProps> = ({
  updatedUser,
  setPage,
  setUpdatedUser,
}) => {
  const { data: educationOptions } = useQuery(
    "get",
    "/v1/enums/{enumType}",
    {
      params: {
        path: {
          enumType: "education_level_enum",
        },
      },
    },
  );
  const { data: interestOptions } = useQuery(
    "get",
    "/v1/enums/{enumType}",
    {
      params: {
        path: {
          enumType: "cs_fields_enum",
        },
      },
    },
  );
  const { data: majorOptions } = useQuery("get", "/v1/majors");
  return (
    <OnboardingCard
      image={updatedUser.profilePic || ""}
      header={`Welcome ${updatedUser.name}`}
      subtitle="We would love to know a bit more about you."
    >
      <Dropdown
        label="Education"
        required={true}
        options={educationOptions?.types || []}
        value={updatedUser.education_level || ""}
        onChange={(e) =>
          setUpdatedUser((prev) =>
            prev
              ? {
                  ...prev,
                  education_level: e.target.value as User["education_level"],
                }
              : prev,
          )
        }
      />
      <Dropdown
        label="Major"
        required={true}
        options={majorOptions?.majors.map((major) => major.name) || []}
        value={updatedUser.major || ""}
        onChange={(e) => {
          setUpdatedUser((prev) =>
            prev ? { ...prev, major: e.target.value as User["major"] } : prev,
          );
        }}
      />
      <Input
        type="date"
        label="Graduation Date"
        value={updatedUser.gradDate || undefined}
        onChange={(e) => {
          setUpdatedUser((prev) =>
            prev ? { ...prev, gradDate: e.target.value } : prev,
          );
        }}
        required={true}
      />
      <Select
        label="Interest(s)"
        multiple={true}
        required={false}
        options={interestOptions?.types || []}
        selected={updatedUser.interests || []}
        changeFunction={(_, option) => {
          setUpdatedUser((prev) =>
            prev
              ? {
                  ...prev,
                  interests: prev.interests.includes(
                    option as User["interests"][number],
                  )
                    ? prev.interests.filter((item) => item !== option)
                    : [...prev.interests, option as User["interests"][number]],
                }
              : prev,
          );
        }}
      />
      <div className="flex justify-end">
        <Btn variant="primary" onClick={() => setPage(1)}>
          <span className="">Continue</span>
          <img src={RightArrow} alt="right arrow" />
        </Btn>
      </div>
    </OnboardingCard>
  );
};

const Socials: React.FC<SocialsProps> = ({
  updatedUser,
  setPage,
  setUpdatedUser,
  setComplete,
}) => {
  return (
    <OnboardingCard
      image={updatedUser.profilePic || ""}
      header="Connect your social profiles"
    >
      <Input
        label="LinkedIn"
        required={false}
        icon="/src/assets/Link.svg"
        placeholder="https://linkedin.com/in/john-doe"
        value={updatedUser.linkedin || ""}
        onChange={(e) => {
          setUpdatedUser((prev) =>
            prev ? { ...prev, linkedin: e.target.value } : prev,
          );
        }}
      />
      <Input
        label="Github"
        required={false}
        icon="/src/assets/Link.svg"
        placeholder="https://github.com/john-doe"
        value={updatedUser.github || ""}
        onChange={(e) => {
          setUpdatedUser((prev) =>
            prev ? { ...prev, github: e.target.value } : prev,
          );
        }}
      />
      <Input
        label="Discord Username"
        required={false}
        icon="/src/assets/Link.svg"
        placeholder="JohnDoe"
        value={updatedUser.discord || ""}
        onChange={(e) => {
          setUpdatedUser((prev) =>
            prev ? { ...prev, discord: e.target.value } : prev,
          );
        }}
      />
      <Input
        label="Website"
        required={false}
        icon="/src/assets/Link.svg"
        placeholder="https://johndoe.com"
        value={updatedUser.website || ""}
        onChange={(e) => {
          setUpdatedUser((prev) =>
            prev ? { ...prev, website: e.target.value } : prev,
          );
        }}
      />
      <div className="flex justify-between">
        <Btn
          variant="primary"
          className="bg-transparent text-primary border-none pl-0 hover:bg-transparent disabled:bg-transparent"
          onClick={() => setPage(0)}
        >
          {"< Back"}
        </Btn>
        <Btn variant="primary" onClick={setComplete}>
          <span className="">Complete</span>
          <img src={RightArrow} alt="right arrow" />
        </Btn>
      </div>
    </OnboardingCard>
  );
};

const Done = () => {
  const navigate = useNavigate();

  return (
    <OnboardingCard
    image="/src/assets/trophy.svg"
      header="Congratulations!"
      subtitle="You're all set! Welcome to the ACM Club at San José State University. Make the most out of your experience with us."
    >
      <div className="flex justify-between">
        <Btn
          variant="primary"
          className="w-full"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          <span className="">Go to Home</span>
        </Btn>
      </div>
    </OnboardingCard>
  );
};

export default Page;
