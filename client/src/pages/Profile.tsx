import Dropdown from "../components/atoms/dropdown";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/atoms/avatar";
import { Btn } from "../components/atoms/btn";
import { Card, CardContent } from "../components/atoms/card";
import { Input } from "../components/atoms/input";
import { ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert } from "../components/atoms/alert";
import { DatePicker } from "../components/molecules/date-picker";
import { format } from "date-fns";
import { MultiSelect } from "../components/atoms/multiselect";
import { Spinner } from "../components/atoms/spinner";

const status: Array<string> = ["Undergraduate", "Graduate"];

const interests: Array<string> = [
  "Web Development",
  "Machine Learning",
  "Cloud Computing",
  "Artificial Intelligence",
  "Networking",
  "Cybersecurity",
  "Mobile Development",
  "Game Development",
  "Data Science",
];

export function validateGitHubUrl(url: string): string | null {
  if (!url) return null;
  const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/?$/;
  if (!githubRegex.test(url)) {
    return "Invalid GitHub URL. It should be in the format: https://github.com/username";
  }
  return null;
}

export function validateLinkedInUrl(url: string): string | null {
  if (!url) return null;
  const linkedinRegex =
    /^https:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
  if (!linkedinRegex.test(url)) {
    return "Invalid LinkedIn URL. It should be in the format: https://www.linkedin.com/in/username";
  }
  return null;
}

export default function Profile() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [majorList, setMajorList] = useState<Array<string>>([]);

  const [profilePic, setProfilePic] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [discord, setDiscord] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [gradDate, setGradDate] = useState<Date | undefined>(undefined);
  const [major, setMajor] = useState<string>("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [githubError, setGithubError] = useState<string | null>(null);
  const [linkedinError, setLinkedinError] = useState<string | null>(null);

  // fetch major list
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await fetch("/api/v1/majors");
        const data = await response.json();
        setMajorList(data.majors.map((major: { name: string }) => major.name));
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };

    fetchMajors();
  }, []);

  // fetch user data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/v1/users/my", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setProfilePic(data.profilePic);
        setName(data.name);
        setEmail(data.email);
        setMajor(data.major);
        setGradDate(data.gradDate);
        setSelectedStatus(
          data.education_level.charAt(0).toUpperCase() +
            data.education_level.slice(1)
        );
        setDiscord(data.discord || "");
        setLinkedin(data.linkedin || "");
        setGithub(data.github || "");
        setWebsite(data.website || "");
        setSelectedInterests(data.interests || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // update and save profile
  const handleUpdateProfile = async () => {
    const githubValidationError = validateGitHubUrl(github);
    const linkedinValidationError = validateLinkedInUrl(linkedin);

    setGithubError(githubValidationError);
    setLinkedinError(linkedinValidationError);

    if (githubValidationError || linkedinValidationError) {
      alert("Please correct the errors in the form before saving.");
      return;
    }

    try {
      const updateData = {
        name,
        email,
        major,
        gradDate: format(gradDate!, "yyyy-MM-dd"),
        education_level: selectedStatus.toLowerCase(),
        discord,
        linkedin,
        github,
        website,
        interests: selectedInterests.map((i) => i.toLowerCase()),
      };

      const response = await fetch("/api/v1/users/my", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      window.location.href = window.location.href;
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // for interests
  const handleInterestChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    option: string
  ) => {
    setSelectedInterests((prevSelectedOptions) =>
      prevSelectedOptions.includes(option)
        ? prevSelectedOptions.filter((item) => item !== option)
        : [...prevSelectedOptions, option]
    );
  };

  // for date picker
  const handleDateChange = (date: Date | undefined) => {
    setGradDate(date);
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="max-w-6xl mx-auto grid p-4 sm:p-8 md:p-16 gap-8 sm:gap-16">
      <p className="font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tighter">
        Profile
      </p>
      <div className="grid gap-8 sm:gap-16">
        <Card className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          <CardContent className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Public Profile</h2>
              <div className="space-y-4">
                <div className="flex flex-rows space-y-2">
                  <div className="relative flex items-center gap-4">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                      <AvatarImage src={profilePic} alt="Profile picture" />
                      <AvatarFallback>
                        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-neutral font-semibold mb-2">Name</p>
                  <div className="rounded-xl bg-border text-gray-500 px-4 py-2 focus:outline-none w-full placeholder-neutral mb-2 border-border-hovered border-2">
                    {name}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-neutral font-semibold mb-2">Email</p>
                  <div className="rounded-xl bg-border text-gray-500 px-4 py-2 focus:outline-none w-full placeholder-neutral mb-2 border-border-hovered border-2">
                    {email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    label="Discord"
                    required={false}
                    placeholder="discord#1234"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="LinkedIn"
                    required={false}
                    placeholder="https://linkedin.com/john-doe/"
                    value={linkedin}
                    onChange={(e) => {
                      setLinkedin(e.target.value);
                      setLinkedinError(validateLinkedInUrl(e.target.value));
                    }}
                  />
                  {linkedinError && <Alert message={linkedinError} />}
                </div>

                <div className="space-y-2">
                  <Input
                    label="GitHub"
                    required={false}
                    placeholder="https://github.com/john.doe/"
                    value={github}
                    onChange={(e) => {
                      setGithub(e.target.value);
                      setGithubError(validateGitHubUrl(e.target.value));
                    }}
                  />
                  {githubError && <Alert message={githubError} />}
                </div>

                <div className="space-y-2">
                  <Input
                    label="Website"
                    required={false}
                    placeholder="https://myportfolio.com/john.doe/"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Dropdown
                    label="Status"
                    required={true}
                    options={status}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  />
                </div>

                <div className="flex flex-row space-y-2">
                  <div className="relative">
                    <DatePicker
                      label="Graduation Date"
                      value={gradDate}
                      onChange={handleDateChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Dropdown
                    label="Major"
                    required={true}
                    options={majorList}
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-neutral">Interest(s)</p>
                <MultiSelect
                  label=""
                  multiple={true}
                  required={false}
                  options={interests}
                  selectedOptions={selectedInterests}
                  changeFunction={handleInterestChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Btn variant="secondary">Cancel</Btn>
              <Btn variant="primary" onClick={handleUpdateProfile}>
                Save
              </Btn>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
