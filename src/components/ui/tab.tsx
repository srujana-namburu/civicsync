
import * as React from "react";

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        value={value}
        {...props}
      />
    );
  }
);

Tab.displayName = "Tab";

export { Tab };
