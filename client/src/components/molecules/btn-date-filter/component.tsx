import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";

export type EventCardProps = {
  tab1: string;
  tab2: string;
};

export const BtnDateFilter: React.FC<EventCardProps> = ({ tab1, tab2 }) => {
  return (
    <Tabs className="w-[35%] md:w-[20%] text-center">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account" className="text-xs">
          {tab1}
        </TabsTrigger>
        <TabsTrigger value="password" className="text-xs">
          {tab2}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
