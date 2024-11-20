import { Btn } from "../../atoms/btn";
import LinkedIn from "/about/yellowLinkedIn.png";

export interface ILinkedinBtnProps
  extends Omit<React.ComponentProps<typeof Btn>, "variant" | "children"> {
  href: string;
}

export const LinkedinBtn: React.FC<ILinkedinBtnProps> = ({
  className,
  href,
  ...props
}) => {
  return (
    <Btn className={className} variant={"tertiary"} {...props}>
      <a
        href={href}
        target="_blank"
        className="flex gap-2 w-full items-center justify-center"
      >
        <img src={LinkedIn} width={16} height={"16"} />
        <span className="">Linkedin</span>
      </a>
    </Btn>
  );
};
