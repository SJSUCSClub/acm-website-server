import Card from "../../atoms/card";
import React from "react";
import LinkedinBtn from "../linkedin-btn";

export interface IOfficerCardProps {
  photo: string;
  name: string;
  position: string;
  linkedin: string;
}

export const OfficerCard: React.FC<IOfficerCardProps> = ({
  photo,
  name,
  position,
  linkedin,
}) => (
  <Card className="transition duration-100 ease-in-out hover:shadow-2xl justify-center items-center w-[19rem] h-[rem] border-[2px] gap-2px py-2 text-[16px] sm:text-sm rounded-xl shadow-lg mb-10">
    <img
      src={photo}
      alt="Officers"
      width={700}
      height={1440}
      className="object-cover items-center justify-center h-60 w-60 m-7 rounded-2xl drop-shadow-lg"
    />
    {position && (
      <h1 className="font-semibold gap-2 px-7 ">
        <span className="text-xs text-neutral">{position}</span>{" "}
      </h1>
    )}
    <h1 className="font-bold text-lg px-7">{name}</h1>

    <div className="flex justify-start items-center w-full px-2 py-3">
      <LinkedinBtn href={linkedin} />
    </div>
  </Card>
);
