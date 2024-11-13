import { cn } from "../../../utils/cn";

export interface IInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  footer?: string;
  required: boolean;
  icon?: string;
}

export const Input: React.FC<IInputProps> = ({
  label,
  footer = "",
  placeholder,
  required,
  icon = "",
  className,
  ...props
}) => (
  <div className="relative">
    <div className="flex">
      <p className="text-neutral font-semibold mb-2 text-[14px]">{label}</p>
      {required && <p className="text-red-500">*</p>}
    </div>
    <input
      className={cn(
        "rounded-xl bg-border text-text px-[16px] py-[10px] focus:outline-none w-full placeholder-neutral mb-2 border-border-hovered border-2 text-[14px]",
        className,
      )}
      placeholder={placeholder}
      {...props}
    />
    {icon !== "" && (
      <div className="pointer-events-none absolute inset-y-0 right-0 top-5 flex items-center pr-3">
        <img src={icon} alt="icon" className="h-4 w-4" />
      </div>
    )}
    {footer !== "" && <p className="text-neutral mb-2 text-[14px]">{footer}</p>}
  </div>
);
