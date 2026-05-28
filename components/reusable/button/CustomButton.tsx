import { ComponentPropsWithoutRef } from "react";

interface CustomButtonProps extends ComponentPropsWithoutRef<"button"> {
  isLoading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  isLoading,
  className,
  children,
  ...rest
}) => {
  return (
    <button
    className={`cursor-pointer ${className}`}
    disabled={isLoading} {...rest}>
      {children}
    </button>
  );
};
