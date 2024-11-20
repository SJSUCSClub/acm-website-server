import Card from "../../atoms/card";
import React from "react";

export interface ISpotLightCardProps {
  type: string;
  image: string;
  title: string;
  description: string;
}

export const SpotLightCard: React.FC<ISpotLightCardProps> = ({
  type,
  image,
  title,
  description,
}) => (
  <Card className="flex-none grid grid-cols-2 gap-5 p-5 place-items-center bg-white h-auto w-[100%] md:w-[800px] rounded-lg shadow-lg transition ease-in-out hover:shadow-xl mb-3">
    <div className=" w-[100%] h-auto">
      <img
        src={image}
        width={200}
        height={100}
        className="w-[100%] h-auto"
        alt={""}
      />
    </div>
    <div className="text-balance text-left">
      <h1 className="font-bold text-xs pb-1 text-gray-500">{type}</h1>
      <h1 className="font-bold text-sm pb-3">{title}</h1>
      <h3 className="text-wrap text-[80%] pb-3 ">{description}</h3>
    </div>
  </Card>
);
