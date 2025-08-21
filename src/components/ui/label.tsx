import { clsx } from "clsx";
import { LabelHTMLAttributes, forwardRef } from "react";

const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={clsx("block text-sm font-medium text-white mb-1", className)}
      {...props}
    />
  );
});

Label.displayName = "Label";

export { Label };
