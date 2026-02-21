import React from "react";

type Props = {
  to: string;
  children?: React.ReactNode;
  label?: string;
  variant?: string;
  size?: "sm" | "lg";
  className?: string;
  /** Optional custom navigation function (e.g. `useNavigate()` from react-router-dom) */
  navigate?: (to: string) => void;
  /** Anchor target, e.g. `_blank` */
  target?: string;
};

const NavButton: React.FC<Props> = ({
  to,
  children,
  label,
  variant = "primary",
  size,
  className = "",
  navigate,
  target,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (navigate) {
      e.preventDefault();
      navigate(to);
    } else if (!target) {
      // Default behavior: replace location (works without router)
      e.preventDefault();
      window.location.href = to;
    }
    // If `target` is provided, allow normal anchor behavior (e.g. _blank)
  };

  const sizeClass = size ? `btn-${size}` : "";

  return (
    <a
      href={to}
      role="button"
      className={[`btn`, `btn-${variant}`, sizeClass, className]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
    >
      {children ?? label}
    </a>
  );
};

export default NavButton;
