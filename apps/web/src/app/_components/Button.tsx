interface ButtonProps {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}

export const Button = ({ label, onClick, icon }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white p-2 rounded flex items-center gap-2"
    >
      {icon}
      {label}
    </button>
  );
};
