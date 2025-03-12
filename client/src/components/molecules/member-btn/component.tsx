import { useQuery } from "@/hooks/useFetch";
import { Btn } from "../../atoms/btn";
import RightArrow from "/about/rightarrow.svg";

export type IMemberBtnProps = Omit<
  React.ComponentProps<typeof Btn>,
  "children" | "href"
>;

export const MemberBtn: React.FC<IMemberBtnProps> = ({
  className,
  variant,
  ...props
}) => {
  const { data: links } = useQuery("get", "/v1/club/links");
  return (
    <Btn className={className} variant={variant} {...props}>
      <a
        href={links?.links.memberApplication || ""}
        target="_blank"
        className="flex gap-2"
      >
        <span className="">
          {" "}
          Become a Member{variant === "tertiary" && " >"}
        </span>
        <img src={RightArrow} alt="right arrow" />
      </a>
    </Btn>
  );
};
