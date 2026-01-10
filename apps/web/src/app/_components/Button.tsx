import Link from "next/link";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  icon: React.ReactNode;
  bgColor?: string;
  txtColor?: string;
  borderColor?: string;
  page?: string;
  hoverBgColor?: string;
}

export const Button = ({
  label,
  icon,
  bgColor = "bg-primary",
  txtColor = "text-white",
  borderColor = "",
  page = "#",
  hoverBgColor = "hover:bg-primary-light",
}: ButtonProps) => {
  return (
    <Link href={`${page}`} passHref>
      <button
        className={`${bgColor} ${txtColor} text-center font-medium p-2 rounded flex items-center gap-2 text-sm min-w-30 ${borderColor} flex justify-center items-center ${hoverBgColor} cursor-pointer`}
      >
        {icon}
        {label}
      </button>
    </Link>
  );
};
