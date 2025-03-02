import Btn from "@/components/atoms/btn";
import Card, {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { paths } from "@/types/schema.v1";
import { CiLocationOn } from "react-icons/ci";

type SubscribedCompany =
  paths["/v1/users/my/subscribed-companies"]["get"]["responses"]["200"]["content"]["application/json"]["companies"][number];

interface ICompanyCardProps {
  company: SubscribedCompany;
  onRemove: (company: SubscribedCompany) => void;
}

const CompanyCard: React.FC<ICompanyCardProps> = ({ company, onRemove }) => {
  const date = new Date(company.subscribedDate).toISOString().slice(0, 10);
  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="flex justify-between items-center space-x-2">
          <p>{company.name}</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-sm">{date}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Subscribed at</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="flex space-x-5 flex-wrap">
          <Badge>{company.industryId}</Badge>
          <div className="flex items-center space-x-1">
            <CiLocationOn />
            <p>{company.location}</p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>{company.description}</CardContent>
      <CardFooter>
        <Btn size="sm" onClick={() => onRemove(company)}>
          Remove
        </Btn>
      </CardFooter>
    </Card>
  );
};

export default CompanyCard;
