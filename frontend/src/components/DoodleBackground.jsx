import React from 'react';

export default function DoodleBackground() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <g opacity="0.18" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Pizza Slice */}
        <svg x="4%" y="12%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 25,25 Q 50,18 75,25 Q 50,28 25,25 Z" />
          <path d="M 25,25 L 50,85 L 75,25" />
          <circle cx="45" cy="45" r="4" />
          <circle cx="55" cy="62" r="3.5" />
          <circle cx="40" cy="68" r="3" />
        </svg>

        {/* Banana */}
        <svg x="91%" y="8%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 22,75 Q 38,72 68,52 Q 78,38 80,25 Q 73,30 55,42 Q 32,50 22,75 Z" />
          <path d="M 80,25 Q 83,21 82,18 L 76,21 Q 77,24 80,25" />
          <path d="M 23,65 Q 42,58 65,42" />
        </svg>

        {/* Sneaker / Shoe */}
        <svg x="3%" y="80%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 15,75 Q 50,78 85,75 L 85,70 Q 50,72 15,70 Z" />
          <path d="M 18,70 C 12,50 25,48 35,46 L 52,32 C 60,35 72,55 83,70 Z" />
          <path d="M 35,46 L 43,55 M 39,41 L 47,50 M 43,36 L 51,45" />
          <path d="M 75,55 L 75,70" />
        </svg>

        {/* Apple with stem */}
        <svg x="90%" y="80%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 50,35 C 32,32 18,42 18,60 C 18,78 35,88 50,82 C 65,88 82,78 82,60 C 82,42 68,32 50,35 Z" />
          <path d="M 50,35 Q 52,22 62,15" />
          <path d="M 54,26 Q 66,22 68,30 Q 58,32 54,26" />
        </svg>

        {/* Burger with layers */}
        <svg x="4%" y="46%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 20,44 C 20,24 80,24 80,44 Z" />
          <path d="M 18,48 Q 24,45 30,48 Q 36,45 42,48 Q 48,45 54,48 Q 60,45 66,48 Q 72,45 78,48 Q 82,46 82,48" />
          <path d="M 20,53 L 80,53 L 73,59 L 65,53 L 57,59 L 49,53 L 41,59 L 33,53 L 20,53" />
          <rect x="22" y="61" width="56" height="8" rx="4" />
          <path d="M 24,73 Q 50,77 76,73 Q 73,83 50,83 Q 27,83 24,73 Z" />
        </svg>

        {/* T-shirt */}
        <svg x="91%" y="44%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 30,22 L 38,22 Q 50,30 62,22 L 70,22 L 85,38 L 74,47 L 70,42 L 70,80 L 30,80 L 30,42 L 26,47 L 15,38 Z" />
          <path d="M 30,42 L 30,22" />
          <path d="M 70,42 L 70,22" />
        </svg>

        {/* Carrot with leaves */}
        <svg x="22%" y="4%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 40,35 Q 43,68 50,90 Q 57,68 60,35 Z" />
          <path d="M 43,45 Q 50,46 57,45" />
          <path d="M 45,60 Q 50,61 55,60" />
          <path d="M 47,75 Q 50,76 53,75" />
          <path d="M 50,35 Q 50,15 45,8 Q 53,15 50,35" />
          <path d="M 47,35 Q 35,22 28,18 Q 38,28 47,35" />
          <path d="M 53,35 Q 65,22 72,18 Q 62,28 53,35" />
        </svg>

        {/* Coffee Cup with handle */}
        <svg x="74%" y="4%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 25,32 L 75,32 L 68,75 Q 50,80 32,75 Z" />
          <path d="M 72,42 C 84,42 84,65 69,65" />
          <path d="M 38,24 Q 41,16 38,10" />
          <path d="M 50,26 Q 53,18 50,12" />
          <path d="M 62,24 Q 65,16 62,10" />
          <path d="M 20,81 Q 50,87 80,81 L 76,86 Q 50,89 24,86 Z" />
        </svg>

        {/* Avocado with seed */}
        <svg x="18%" y="90%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 50,20 C 35,20 38,45 30,60 C 22,75 35,90 50,90 C 65,90 78,75 70,60 C 62,45 65,20 50,20 Z" />
          <path d="M 50,28 C 39,28 41,49 35,61 C 30,71 39,83 50,83 C 61,83 70,71 65,61 C 59,49 61,28 50,28 Z" />
          <circle cx="50" cy="62" r="10.5" fill="#15803D" />
        </svg>

        {/* Bread loaf */}
        <svg x="80%" y="90%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 20,50 Q 20,30 50,30 Q 80,30 80,50 Q 80,70 50,70 Q 20,70 20,50 Z" />
          <path d="M 36,38 L 45,62 M 49,36 L 58,60 M 62,38 L 71,62" />
        </svg>

        {/* Fork */}
        <svg x="40%" y="92%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 50,55 L 50,90" />
          <path d="M 40,40 L 40,55 Q 50,60 60,55 L 60,40" />
          <path d="M 40,40 L 40,18" />
          <path d="M 46,40 L 46,20" />
          <path d="M 54,40 L 54,20" />
          <path d="M 60,40 L 60,18" />
        </svg>

        {/* Strawberry with seeds */}
        <svg x="60%" y="91%" width="68" height="68" viewBox="0 0 100 100">
          <path d="M 50,20 C 30,20 22,45 35,70 C 42,82 48,88 50,90 C 52,88 58,82 65,70 C 78,45 70,20 50,20 Z" />
          <path d="M 50,20 Q 55,10 65,12 Q 55,20 50,20" />
          <path d="M 50,20 Q 45,10 35,12 Q 45,20 50,20" />
          <path d="M 50,20 Q 50,8 50,15" />
          <circle cx="42" cy="35" r="2.2" fill="#15803D" />
          <circle cx="58" cy="35" r="2.2" fill="#15803D" />
          <circle cx="50" cy="45" r="2.2" fill="#15803D" />
          <circle cx="38" cy="52" r="2.2" fill="#15803D" />
          <circle cx="62" cy="52" r="2.2" fill="#15803D" />
          <circle cx="45" cy="62" r="2.2" fill="#15803D" />
          <circle cx="55" cy="62" r="2.2" fill="#15803D" />
          <circle cx="50" cy="72" r="2.2" fill="#15803D" />
        </svg>

        {/* Small 4-Point Sparkle Stars */}
        <svg x="12%" y="28%" width="32" height="32" viewBox="0 0 100 100">
          <path d="M 50,30 Q 50,50 30,50 Q 50,50 50,70 Q 50,50 70,50 Q 50,50 50,30 Z" />
        </svg>
        <svg x="85%" y="26%" width="32" height="32" viewBox="0 0 100 100">
          <path d="M 50,30 Q 50,50 30,50 Q 50,50 50,70 Q 50,50 70,50 Q 50,50 50,30 Z" />
        </svg>
        <svg x="12%" y="65%" width="32" height="32" viewBox="0 0 100 100">
          <path d="M 50,30 Q 50,50 30,50 Q 50,50 50,70 Q 50,50 70,50 Q 50,50 50,30 Z" />
        </svg>
        <svg x="86%" y="64%" width="32" height="32" viewBox="0 0 100 100">
          <path d="M 50,30 Q 50,50 30,50 Q 50,50 50,70 Q 50,50 70,50 Q 50,50 50,30 Z" />
        </svg>
        <svg x="35%" y="6%" width="24" height="24" viewBox="0 0 100 100">
          <path d="M 50,30 Q 50,50 30,50 Q 50,50 50,70 Q 50,50 70,50 Q 50,50 50,30 Z" />
        </svg>
        <svg x="65%" y="6%" width="24" height="24" viewBox="0 0 100 100">
          <path d="M 50,30 Q 50,50 30,50 Q 50,50 50,70 Q 50,50 70,50 Q 50,50 50,30 Z" />
        </svg>
      </g>
    </svg>
  );
}
