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
import { Edit } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const status: Array<string> = ["Undergraduate", "Graduate"];
const year: Array<string> = ["2025", "2026", "2027", "2028"];
const interest: Array<string> = ["Software", "Hardware", "Design"];

export default function Profile() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  // Profile fields
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [discord, setDiscord] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [github, setGithub] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [gradDate, setGradDate] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [selectedInterest, setSelectedInterest] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/v1/users/my", {
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
        console.log(data);

        setAvatar(data.profilePic);
        setName(data.name);
        setEmail(data.email);
        setMajor(data.major);
        setGradDate(data.gradDate);
        setSelectedStatus(data.education_level);
        setDiscord(data.discord);
        setLinkedin(data.linkedin);
        setGithub(data.github);
        setWebsite(data.website);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error("An unknown error occurred");
        }
      }
    };

    fetchData();
  }, []);

  // for avatar
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setAvatar(fileURL);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid p-16 gap-16 ">
      <p className="font-extrabold text-5xl tracking-tighter"> Profile</p>
      <div className="grid gap-16">
        <Card className="w-full max-w-7xl mx-auto p-8">
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Public Profile</h2>
              <div className="space-y-4">
                <div className="flex flex-rows space-y-2">
                  <div className="relative flex items-center gap-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={avatar} alt="Profile picture" />
                      <AvatarFallback>
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className="absolute top-0 right-0 transform translate-x-1/2 translate-y-full"
                      onClick={handleClick}
                    >
                      <button className="bg-gray-200 p-1 rounded-full shadow-md hover:bg-gray-300">
                        <Edit className=" text-gray-500" />
                      </button>

                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-neutral font-semibold mb-2">Name</p>
                  <div className="rounded-xl bg-border text-gray-500 px-[16px] py-[10px] focus:outline-none w-full placeholder-neutral mb-2 border-border-hovered border-2">
                    {" "}
                    {name}{" "}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-neutral font-semibold mb-2">Email</p>
                  <div className="rounded-xl bg-border text-gray-500 px-[16px] py-[10px] focus:outline-none w-full placeholder-neutral mb-2 border-border-hovered border-2">
                    {" "}
                    {email}{" "}
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
                    label="Linkedin"
                    required={false}
                    placeholder="https://linkedin.com/john-doe/"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="Github"
                    required={false}
                    placeholder="https://github.com/john.doe/"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                  />
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

                <div className="space-y-2">
                  <Dropdown
                    label="Graduation Year"
                    required={true}
                    options={year}
                    value={gradDate}
                    onChange={(e) => setGradDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="Major"
                    required={false}
                    placeholder="Major"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Dropdown
                  label="Team Interest"
                  required={false}
                  options={interest}
                  value={selectedInterest}
                  onChange={(e) => setSelectedInterest(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Btn variant="tertiary">Cancel</Btn>
              <Btn variant="secondary">Save</Btn>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
