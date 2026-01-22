interface GoalLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const GoalLogo = ({ className = '' }: GoalLogoProps) => {
  return (
    <img
      src="/logo.svg"
      alt="GOAL"
      className={className}
    />
  );
};

export default GoalLogo;
