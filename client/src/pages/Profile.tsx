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
import { useMutation, useQuery } from "@/hooks/useFetch";
import { Alert } from "../components/atoms/alert";
import { DatePicker } from "../components/molecules/date-picker";
import { format } from "date-fns";
import { MultiSelect } from "../components/atoms/multiselect";
import { Spinner } from "../components/atoms/spinner";
import { paths } from "../types/schema.v1";

type User =
  paths["/v1/users/my"]["get"]["responses"]["200"]["content"]["application/json"];

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
  const { data: user, isLoading } = useQuery("get", "/v1/users/my");
  const { data: majorList } = useQuery("get", "/v1/majors");
  const { data: interestsList } = useQuery("get", "/v1/enums/{enumType}", {
    params: {
      path: {
        enumType: "cs_fields_enum",
      },
    },
  });
  const { data: educationLevels } = useQuery("get", "/v1/enums/{enumType}", {
    params: {
      path: {
        enumType: "education_level_enum",
      },
    },
  });
  const { mutate } = useMutation("put", "/v1/users/my");

  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [linkedinError, setLinkedinError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = () => {
      setUpdatedUser(user || null);
    };
    getUser();
  }, [user]);

  // update and save profile
  const handleUpdateProfile = async () => {
    if (!updatedUser) return;
    const githubValidationError = validateGitHubUrl(updatedUser.github || "");
    const linkedinValidationError = validateLinkedInUrl(
      updatedUser.linkedin || ""
    );

    setGithubError(githubValidationError);
    setLinkedinError(linkedinValidationError);

    if (githubValidationError || linkedinValidationError) {
      alert("Please correct the errors in the form before saving.");
      return;
    }

    const setUser = {
      ...updatedUser,
      gradDate: updatedUser.gradDate,
    };

    mutate({
      body: setUser,
    });
    alert("Profile updated successfully!");
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
                      <AvatarImage
                        src={updatedUser?.profilePic || ""}
                        alt="Profile picture"
                      />
                      <AvatarFallback>
                        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-neutral font-semibold mb-2">Name</p>
                  <div className="rounded-xl bg-border text-gray-500 px-4 py-2 focus:outline-none w-full placeholder-neutral mb-2 border-border-hovered border-2">
                    {updatedUser?.name}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-neutral font-semibold mb-2">Email</p>
                  <div className="rounded-xl bg-border text-gray-500 px-4 py-2 focus:outline-none w-full placeholder-neutral mb-2 border-border-hovered border-2">
                    {updatedUser?.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    label="Discord"
                    required={false}
                    placeholder="discord#1234"
                    value={updatedUser?.discord || ""}
                    onChange={(e) =>
                      setUpdatedUser((prev) =>
                        prev ? { ...prev, discord: e.target.value } : prev
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="LinkedIn"
                    required={false}
                    placeholder="https://linkedin.com/john-doe/"
                    value={updatedUser?.linkedin || ""}
                    onChange={(e) =>
                      setUpdatedUser((prev) =>
                        prev ? { ...prev, linkedin: e.target.value } : prev
                      )
                    }
                  />
                  {linkedinError && <Alert message={linkedinError} />}
                </div>

                <div className="space-y-2">
                  <Input
                    label="GitHub"
                    required={false}
                    placeholder="https://github.com/john.doe/"
                    value={updatedUser?.github || ""}
                    onChange={(e) =>
                      setUpdatedUser((prev) =>
                        prev ? { ...prev, github: e.target.value } : prev
                      )
                    }
                  />
                  {githubError && <Alert message={githubError} />}
                </div>

                <div className="space-y-2">
                  <Input
                    label="Website"
                    required={false}
                    placeholder="https://myportfolio.com/john.doe/"
                    value={updatedUser?.website || ""}
                    onChange={(e) =>
                      setUpdatedUser((prev) =>
                        prev ? { ...prev, website: e.target.value } : prev
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Dropdown
                    label="Status"
                    required={true}
                    options={educationLevels?.types || []}
                    value={updatedUser?.education_level || ""}
                    onChange={(e) =>
                      setUpdatedUser((prev) =>
                        prev
                          ? {
                              ...prev,
                              education_level: e.target
                                .value as User["education_level"],
                            }
                          : prev
                      )
                    }
                  />
                </div>

                <div className="flex flex-row space-y-2">
                  <div className="relative">
                    {/* <DatePicker
                      label="Graduation Date"
                      value={new Date(updatedUser?.gradDate || "")}
                      onChange={(date) =>
                        setUpdatedUser((prev) =>
                          prev
                            ? {
                                ...prev,
                                gradDate: date ? date.toISOString() : "",
                              }
                            : prev
                        )
                      }
                    /> */}
                    <Input
                      type="date"
                      label="Graduation Date"
                      value={updatedUser?.gradDate || ""}
                      onChange={(e) => {
                        setUpdatedUser((prev) =>
                          prev ? { ...prev, gradDate: e.target.value } : prev
                        );
                      }}
                      required={true}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Dropdown
                    label="Major"
                    required={true}
                    options={
                      majorList?.majors.map(
                        (major: { name: string }) => major.name
                      ) || []
                    }
                    value={updatedUser?.major || ""}
                    onChange={(e) =>
                      setUpdatedUser((prev) =>
                        prev ? { ...prev, major: e.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-neutral">Interest(s)</p>
                <MultiSelect
                  label=""
                  multiple={true}
                  required={false}
                  options={interestsList?.types || []}
                  selectedOptions={
                    Array.isArray(updatedUser?.interests)
                      ? updatedUser.interests
                      : []
                  }
                  changeFunction={(_, option) => {
                    setUpdatedUser((prev) =>
                      prev
                        ? {
                            ...prev,
                            interests: prev.interests.includes(
                              option as User["interests"][number]
                            )
                              ? prev.interests.filter((item) => item !== option)
                              : [
                                  ...prev.interests,
                                  option as User["interests"][number],
                                ],
                          }
                        : prev
                    );
                  }}
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
