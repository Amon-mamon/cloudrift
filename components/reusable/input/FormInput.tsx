"use client";

import icons from "@/components/constant/icons";
import { ComponentPropsWithoutRef, useState } from "react";

interface CustomInputProps extends ComponentPropsWithoutRef<"input"> {
  label: string;
  className: string;
  error?: { message?: string };
  validation: string;
}

export default function FormInput({
  label,
  type,
  error,
  className,
  validation,
  ...rest
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ marginBottom: "" }}>
      <label className="text-slate-500 text-sm flex">
        {label}
        {validation === "required" ? (
          <span className="relative">
            <icons.asterisk/>
          </span>
        ) : (
          ""
        )}
      </label>
      <div className="relative">
        <input
          {...rest}
          className={className}
          type={type === "password" && showPassword ? "text" : type}
        />
        {type === "password" && (
          <div className="absolute text-slate-600 right-2 top-1/2 -translate-y-1/2 cursor-pointer">
            {showPassword ? (
              <icons.seePasswordClose onClick={() => setShowPassword(false)} />
            ) : (
              <icons.seePasswordOpen onClick={() => setShowPassword(true)} />
            )}
          </div>
        )}
      </div>

      {error?.message && (
        <p style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
          {error.message}
        </p>
      )}
    </div>
  );
}
