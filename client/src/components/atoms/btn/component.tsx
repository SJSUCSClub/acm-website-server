import { cn } from "../../../utils/cn";

type Variant = "primary" | "secondary" | "tertiary" | "ghost";

export interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant;
  children?: React.ReactNode;
}

export const Btn: React.FC<IButtonProps> = ({
  variant,
  children,
  className,
  ...props
}) => (
  <button
    className={cn(
      "flex items-center justify-center gap-[10px] rounded-full py-[10px] px-[20px] border-2 disabled:text-neutral font-bold",
      {
        "bg-primary text-background hover:bg-primary-highlight disabled:bg-border border-[#ecd79c]":
          variant === "primary",
        "bg-secondary text-background hover:bg-secondary-highlight disabled:bg-border":
          variant === "secondary",
        "bg-none text-primary hover:text-primary-highlight disabled:bg-none border-none":
          variant === "tertiary",
        "bg-none text-secondary hover:text-secondary-highlight disabled:bg-none border-secondary hover:border-secondary-highlight disabled:border-neutral":
          variant === "ghost",
      },
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
