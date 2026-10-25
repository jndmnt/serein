import { useId } from "react";
import { motion } from "framer-motion";
import { companionStage } from "../game/cosmetics";
import { cn } from "../utils/cn";

/**
 * The garden spirit. A ceramic pot that grows through eight stages as you play.
 * Hand-built SVG, no assets, animated with a slow organic sway.
 */
export function Companion({
  xp,
  size = 150,
  className,
  glow = true,
}: {
  xp: number;
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const { index: stage } = companionStage(xp);
  const stemHeight = [12, 34, 50, 67, 82, 92, 100, 108][stage];
  const top = 142 - stemHeight;
  const leafCount = [1, 2, 3, 5, 6, 7, 8, 9][stage];
  const flowerCount = stage >= 5 ? Math.min(3, stage - 4) : 0;

  const leaves = Array.from({ length: leafCount }).map((_, i) => {
    const t = (i + 1) / (leafCount + 1);
    const y = 136 - stemHeight * t;
    const side = i % 2 === 0 ? -1 : 1;
    const scale = 0.72 + t * 0.45;
    return { y, side, scale, key: i };
  });

  const flowers = Array.from({ length: flowerCount }).map((_, i) => {
    const angle = -0.8 + i * 0.8;
    return {
      x: 100 + Math.sin(angle) * 15,
      y: top - 2 + Math.cos(angle) * 8 - i * 3,
      scale: 1 - i * 0.13,
      key: i,
    };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn("overflow-visible", className)}
      role="img"
      aria-label={`Garden spirit, growth stage ${stage + 1}`}
    >
      <defs>
        <radialGradient id={`${uid}-aura`} cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="#dfe9cf" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#e8ecdb" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#e8ecdb" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-pot`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#f7f0e1" />
          <stop offset="55%" stopColor="#e9dcc5" />
          <stop offset="100%" stopColor="#d5c3a5" />
        </linearGradient>
        <linearGradient id={`${uid}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93ad86" />
          <stop offset="60%" stopColor="#6f8f6c" />
          <stop offset="100%" stopColor="#52705a" />
        </linearGradient>
        <linearGradient id={`${uid}-flower`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1e3c4" />
          <stop offset="100%" stopColor="#d9b982" />
        </linearGradient>
        <radialGradient id={`${uid}-soil`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#9a866c" />
          <stop offset="100%" stopColor="#74634f" />
        </radialGradient>
      </defs>

      {glow && <circle cx="100" cy="104" r="92" fill={`url(#${uid}-aura)`} />}

      {/* ground shadow */}
      <ellipse cx="100" cy="181" rx="52" ry="8" fill="#4b5f48" opacity="0.13" />

      {/* ceramic pot */}
      <path
        d="M62 138 Q64 168 74 174 Q100 182 126 174 Q136 168 138 138 Z"
        fill={`url(#${uid}-pot)`}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.4"
      />
      <path d="M62 138 Q100 148 138 138" fill="none" stroke="rgba(122,103,74,0.22)" strokeWidth="2" />
      <ellipse cx="100" cy="138" rx="39" ry="8.5" fill="#f4ecdc" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
      <ellipse cx="100" cy="138" rx="32" ry="6" fill={`url(#${uid}-soil)`} />
      <path d="M70 156 Q100 163 130 156" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" />
      <path d="M68 147 Q100 154 132 147" fill="none" stroke="rgba(122,103,74,0.12)" strokeWidth="1.2" />
      <ellipse cx="100" cy="171" rx="20" ry="3.4" fill="rgba(90,74,52,0.12)" />
      <path d="M80 148 Q84 156 82 164" fill="none" stroke="rgba(122,103,74,0.16)" strokeWidth="1.6" />
      <ellipse cx="86" cy="132" rx="8" ry="3" fill="white" opacity="0.35" />

      {/* the plant */}
      <g className="companion-sway" style={{ transformOrigin: "100px 140px" }}>
        <path
          d={`M100 138 C ${100 - 7} ${138 - stemHeight * 0.42}, ${100 + 9} ${138 - stemHeight * 0.7}, 100 ${top}`}
          fill="none"
          stroke="#6d8b68"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {leaves.map((leaf) => (
          <g key={leaf.key} transform={`translate(${100 + leaf.side * 2} ${leaf.y}) rotate(${leaf.side * 34})`}>
            <path
              d={`M0 0 C ${leaf.side * -16 * leaf.scale} ${-9 * leaf.scale}, ${leaf.side * -25 * leaf.scale} ${3 * leaf.scale}, ${leaf.side * -5 * leaf.scale} ${8 * leaf.scale} C ${leaf.side * -17 * leaf.scale} ${10 * leaf.scale}, ${leaf.side * -4 * leaf.scale} ${5 * leaf.scale}, 0 0 Z`}
              fill={`url(#${uid}-leaf)`}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.7"
            />
            <path d={`M0 0 Q ${leaf.side * -11 * leaf.scale} ${2 * leaf.scale}, ${leaf.side * -21 * leaf.scale} ${5 * leaf.scale}`} fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth="0.8" />
          </g>
        ))}

        {stage >= 1 && <ellipse cx="100" cy={top + 1} rx="3.4" ry="5" fill="#7f9d76" />}

        {flowers.map((flower) => (
          <g key={flower.key} transform={`translate(${flower.x} ${flower.y}) scale(${flower.scale})`}>
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy="-7"
                rx="5.2"
                ry="7.2"
                fill={`url(#${uid}-flower)`}
                transform={`rotate(${deg})`}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="0.6"
              />
            ))}
            <circle cx="0" cy="0" r="3.6" fill="#c9a05d" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
          </g>
        ))}
      </g>

      {stage >= 6 &&
        [
          { x: 52, y: 92, r: 2.1 },
          { x: 148, y: 76, r: 1.6 },
          { x: 138, y: 108, r: 1.3 },
          { x: 64, y: 58, r: 1.4 },
        ].map((s, i) => (
          <motion.path
            key={i}
            d={`M${s.x} ${s.y - 4} L${s.x + 1.2} ${s.y - 1.2} L${s.x + 4} ${s.y} L${s.x + 1.2} ${s.y + 1.2} L${s.x} ${s.y + 4} L${s.x - 1.2} ${s.y + 1.2} L${s.x - 4} ${s.y} L${s.x - 1.2} ${s.y - 1.2} Z`}
            fill="#d9bd88"
            animate={{ opacity: [0.25, 0.95, 0.25], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 3.4 + i * 0.6, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
            style={{ transformOrigin: `${s.x}px ${s.y}px` }}
          />
        ))}

      {stage === 0 && <ellipse cx="100" cy="132" rx="5" ry="3" fill="#6f8b62" opacity="0.7" />}
    </svg>
  );
}
