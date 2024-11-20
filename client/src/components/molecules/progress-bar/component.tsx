import ProgressMarker from "../../atoms/progress-marker";
import { cn } from "../../../utils/cn";

export interface IProgressBarProps
  extends React.ProgressHTMLAttributes<HTMLProgressElement> {
  value: number;
}

export const ProgressBar: React.FC<IProgressBarProps> = ({
  className,
  value,
  ...props
}) => {
  function checkVar(currVal: number) {
    if (value === currVal) return "current";
    if (value < currVal) return "incomplete";
    if (value > currVal) return "complete";
    return "incomplete";
  }
  return (
    <div className="relative w-full">
      <progress
        className={cn(
          "flex items-center justify-center w-full h-[4px]",
          className,
        )}
        {...props}
        value={value}
      />
      <div className="absolute top-[-8px] left-[-1%]">
        <ProgressMarker variant={checkVar(0.0)} />
      </div>
      <div className="absolute top-[-8px] left-[48%]">
        <ProgressMarker variant={checkVar(0.5)} />
      </div>
      <div className="absolute top-[-8px] left-[98%]">
        <ProgressMarker variant={checkVar(1.0)} />
      </div>
    </div>
  );
};
