import dynamic from "next/dynamic";
import { ComponentPropsWithoutRef } from "react";

const MuiTooltip = dynamic(() => import("@mui/material/Tooltip"));
interface CustomButtonProps extends ComponentPropsWithoutRef<"button"> {
  isLoading?: boolean;
  tooltip: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  isLoading,
  className,
  children,
  tooltip,
  ...rest
}) => {
  return (
    <MuiTooltip title={tooltip}>
      <span>
        <button
          className={`cursor-pointer ${className}`}
          disabled={isLoading}
          {...rest}
        >
          {children}
        </button>
      </span>
    </MuiTooltip>
  );
};
