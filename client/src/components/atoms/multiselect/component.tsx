import type React from 'react';
import Input from '../input';

export interface ISelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  footer?: string;
  options: string[];
  required: boolean;
  selectedOptions: string[];
  changeFunction: (e: React.ChangeEvent<HTMLInputElement>, option: string) => void;
}

export const MultiSelect: React.FC<ISelectProps> = ({
  label,
  required,
  options,
  footer,
  selectedOptions,
  changeFunction,
}) => {
  return (
    <div>
      <p className="text-neutral font-semibold mb-2 text-[14px]">{label}</p>
      {options.map((option) => (
        <div key={option} className="flex gap-2">
          <Input
            id={`select-${option}`}
            name={`select-${option}`}
            type="checkbox"
            label=""
            required={required}
            className="hide checkmark"
            checked={selectedOptions.includes(option)}
            onChange={(e) => changeFunction(e, option)}
          />
          <label className="mt-2 text-text text-[14px]" htmlFor={`select-${option}`}>
            {option}
          </label>
        </div>
      ))}
      {footer && <p className="text-neutral mb-2 text-[14px]">{footer}</p>}
    </div>
  );
};
