interface HankoIconProps {
  className?: string;
  size?: number;
}

export default function HankoIcon({ className = '', size = 20 }: HankoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stamp handle */}
      <rect
        x="7"
        y="2"
        width="10"
        height="10"
        rx="2"
        fill="currentColor"
        opacity="0.15"
      >
        <animate
          attributeName="y"
          values="2;3;2"
          dur="2s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
        />
      </rect>

      {/* Stamp base */}
      <rect
        x="6"
        y="11"
        width="12"
        height="3"
        rx="0.5"
        fill="currentColor"
        opacity="0.6"
      >
        <animate
          attributeName="y"
          values="11;12;11"
          dur="2s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
        />
      </rect>

      {/* Stamp impression (circle) */}
      <circle
        cx="12"
        cy="19"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.9"
      />

      {/* Stamp impression inner mark */}
      <line
        x1="10.5"
        y1="19"
        x2="13.5"
        y2="19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}
