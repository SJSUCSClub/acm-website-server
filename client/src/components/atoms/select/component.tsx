import Input from "../input";

export interface ISelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  footer?: string;
  options: string[];
  required: boolean;
  changeFunction: (
    e: React.ChangeEvent<HTMLInputElement>,
    option: string,
  ) => void;
}

export const Select: React.FC<ISelectProps> = ({
  label,
  required,
  options,
  footer,
  changeFunction,
}) => {
  return (
    <div>
      <p className="text-neutral font-semibold mb-2 text-[14px]">{label}</p>
      {options.map((option) => (
        <div className="flex gap-2">
          <Input
            id="select"
            name="select"
            type="checkbox"
            label=""
            required={required}
            className="hide checkmark"
            onChange={(e) => changeFunction(e, option)}
          />
          <label className="mt-2 text-text text-[14px]" htmlFor="Select">
            {option}
          </label>
          <br />
        </div>
      ))}
      {footer !== "" && (
        <p className="text-neutral mb-2 text-[14px]">{footer}</p>
      )}
    </div>
  );
};
