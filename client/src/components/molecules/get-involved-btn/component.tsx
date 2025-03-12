import { useQuery } from "@/hooks/useFetch";
import { Btn } from "../../atoms/btn";

export type IGetInvolvedBtnProps = Omit<
  React.ComponentProps<typeof Btn>,
  "variant" | "children" | "href"
>;

export const GetInvolvedBtn: React.FC<IGetInvolvedBtnProps> = ({
  className,
  ...props
}) => {
  const { data: links } = useQuery("get", "/v1/club/links");
  return (
    <Btn className={className} variant="primary" {...props}>
      <a
        className=""
        target="_blank"
        href={links?.links.memberApplication || ""}
      >
        &lt;/&gt; Get Involved
      </a>
    </Btn>
  );
};
