import { cn } from "../../../utils/cn";

export interface IDropdownProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  footer?: string;
  options: string[];
  required: boolean;
}

export const Dropdown: React.FC<IDropdownProps> = ({
  label,
  footer = "",
  required,
  options,
  className,
  ...props
}) => (
  <div>
    <div className="relative">
      <div className="flex">
        <p className="text-neutral font-semibold mb-2 text-[14px]">{label}</p>
        {required && <p className="text-red-500">*</p>}
      </div>
      <select
        className={cn(
          "rounded-xl bg-border text-text px-[16px] py-[10px] focus:outline-none w-full placeholder-neutral mb-2 border-border-hovered border-2 appearance-none text-[14px]",
          className,
        )}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 flex items-center px-2 text-gray-700 top-6 right-3">
        <svg
          width="9"
          height="15"
          viewBox="0 0 9 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transform rotate-90 fill-current text-black"
        >
          <path d="M1.71255 0.5L0 2.145L5.56275 7.5L0 12.855L1.71255 14.5L9 7.5L1.71255 0.5Z" />
        </svg>
      </div>
    </div>
    {footer !== "" && <p className="text-neutral mb-2 text-[14px]">{footer}</p>}
  </div>
);
