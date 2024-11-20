type Variant = "incomplete" | "complete" | "current";

export interface IProgressMarkerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant: Variant;
}

export const ProgressMarker: React.FC<IProgressMarkerProps> = ({
  variant,
  ...props
}) => {
  let color = ["#F3C954", "#F3C954"];
  if (variant === "current") {
    color = ["#F3C954", "#FFFFFF"];
  } else if (variant === "incomplete") {
    color = ["#A4A4A4", "#A4A4A4"];
  } else if (variant === "complete") {
    color = ["#F3C954", "#F3C954"];
  }
  return (
    <div {...props}>
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="10" fill={color[0]} />
        <circle cx="10" cy="10" r="6" fill={color[1]} fillOpacity={0.5} />
      </svg>
    </div>
  );
};
