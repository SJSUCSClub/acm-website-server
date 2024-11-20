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
  return (
    <Btn className={className} variant={variant} {...props}>
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSf1KNg9T5sPAM9EtOm3i_bQctlq81b7QIns1uNkWtlSCpzOvg/viewform"
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
