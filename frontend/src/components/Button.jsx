import React from "react";

export default React.memo(function Button({ children, variant = "default", ...props }) {
  let cls = "btn";
  if (variant === "primary") cls += " btn-primary";
  if (variant === "danger") cls += " btn-danger";
  return <button className={cls} {...props}>{children}</button>;
});
