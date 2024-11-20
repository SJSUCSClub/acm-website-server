import { Btn } from "../../atoms/btn";

export interface ISocialBtnProps
  extends Omit<React.ComponentProps<typeof Btn>, "variant"> {
  href: string;
}

export const SocialBtn: React.FC<ISocialBtnProps> = ({
  className,
  children,
  href,
  ...props
}) => {
  return (
    <Btn
      className={`${className} border-[#b4c9d9] bg-[#87adcd] text-[#c1d6e6] shadow-md hover:text-white hover:border-[#b4c9d9] animate-[fadeIn_2s_ease-in-out] hover:scale-110 duration-300`}
      variant="ghost"
      {...props}
    >
      <a
        href={href}
        target="_blank"
        className="flex gap-3 no-underline font-bold"
      >
        <span className="flex-cols flex items-center place-content-center">
          {children}
        </span>
      </a>
    </Btn>
  );
};
