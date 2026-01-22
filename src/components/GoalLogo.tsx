interface GoalLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const GoalLogo = ({ variant = 'light', className = '' }: GoalLogoProps) => {
  const textColor = variant === 'light' ? '#1A365D' : '#FFFFFF';
  const blueColor = '#0077DB';

  return (
    <svg
      viewBox="0 0 140 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Target/Bullseye Icon */}
      <circle cx="20" cy="20" r="16" stroke={blueColor} strokeWidth="3" fill="none" />
      <circle cx="20" cy="20" r="9" stroke={blueColor} strokeWidth="3" fill="none" />
      <circle cx="20" cy="20" r="3" fill={blueColor} />
      
      {/* GOAL Text */}
      <text
        x="44"
        y="28"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="24"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        <tspan fill={blueColor}>G</tspan>
        <tspan fill={blueColor}>O</tspan>
        <tspan fill={textColor}>AL</tspan>
      </text>
    </svg>
  );
};

export default GoalLogo;
