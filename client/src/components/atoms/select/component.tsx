import Input from '../input';

export interface ISelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  footer?: string;
  options: string[];
  selected: string[];
  required: boolean;
  changeFunction: (e: React.ChangeEvent<HTMLInputElement>, option: string) => void;
}

export const Select: React.FC<ISelectProps> = ({
  label,
  required,
  options,
  selected,
  footer,
  changeFunction,
  ...props
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
            checked={selected.includes(option)}
            className="hide checkmark"
            onChange={(e) => changeFunction(e, option)}
            {...props}
          />
          <label className="mt-2 text-text text-[14px]" htmlFor="Select">
            {option}
          </label>
          <br />
        </div>
      ))}
      {footer !== '' && <p className="text-neutral mb-2 text-[14px]">{footer}</p>}
    </div>
  );
};
