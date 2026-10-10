import React from 'react';

export const TaaziTokariEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 44,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Deep Green Circle */}
      <circle cx="120" cy="120" r="118" fill="#185435" />
      {/* Outer Gold Ring */}
      <circle cx="120" cy="120" r="108" stroke="#E5B94E" strokeWidth="2.5" />
      {/* Inner Cream Circle with Gold Border */}
      <circle cx="120" cy="120" r="64" fill="#FBF7EE" stroke="#E5B94E" strokeWidth="3.5" />

      {/* Left & Right Gold Dots */}
      <circle cx="28" cy="120" r="4.5" fill="#E5B94E" />
      <circle cx="212" cy="120" r="4.5" fill="#E5B94E" />

      {/* Curved Text Paths */}
      <defs>
        <path id="topArc" d="M 38,120 A 82,82 0 1,1 202,120" />
        <path id="bottomArc" d="M 206,120 A 86,86 0 1,1 34,120" />
      </defs>

      <text
        fill="#FFFFFF"
        fontSize="24"
        fontWeight="800"
        fontFamily="Georgia, serif"
        letterSpacing="4"
      >
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">
          TAAZI TOKARI
        </textPath>
      </text>

      <text
        fill="#E5B94E"
        fontSize="13.5"
        fontWeight="700"
        fontFamily="Georgia, serif"
        letterSpacing="2"
      >
        <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
          KISHAN FRESH TO KITCHEN
        </textPath>
      </text>

      {/* Sun Rays */}
      <line x1="120" y1="74" x2="120" y2="85" stroke="#E38412" strokeWidth="4" strokeLinecap="round" />
      <line x1="97" y1="80" x2="103" y2="89" stroke="#E38412" strokeWidth="4" strokeLinecap="round" />
      <line x1="143" y1="80" x2="137" y2="89" stroke="#E38412" strokeWidth="4" strokeLinecap="round" />
      <line x1="82" y1="96" x2="91" y2="101" stroke="#E38412" strokeWidth="4" strokeLinecap="round" />
      <line x1="158" y1="96" x2="149" y2="101" stroke="#E38412" strokeWidth="4" strokeLinecap="round" />

      {/* Rising Sun Semi-Circle */}
      <path d="M 92,126 A 28,28 0 0,1 148,126 Z" fill="#E38412" />

      {/* Green Leaves Sprouting from Basket */}
      <path d="M 120,103 C 115,112 115,122 120,127 C 125,122 125,112 120,103 Z" fill="#2A9158" />
      <path d="M 103,115 C 109,116 116,121 118,127 C 111,127 105,122 103,115 Z" fill="#2A9158" />
      <path d="M 137,115 C 131,116 124,121 122,127 C 129,127 135,122 137,115 Z" fill="#2A9158" />

      {/* Woven Basket */}
      <rect x="84" y="125" width="72" height="7" rx="3.5" fill="#185435" />
      <path d="M 89,132 L 151,132 L 144,162 C 143,165 141,166 138,166 L 102,166 C 99,166 97,165 96,162 Z" fill="#1E5E3D" />
      {/* Basket Weave Lines */}
      <line x1="104" y1="132" x2="107" y2="166" stroke="#8BBA9B" strokeWidth="2" />
      <line x1="120" y1="132" x2="120" y2="166" stroke="#8BBA9B" strokeWidth="2" />
      <line x1="136" y1="132" x2="133" y2="166" stroke="#8BBA9B" strokeWidth="2" />
      <line x1="91" y1="143" x2="149" y2="143" stroke="#8BBA9B" strokeWidth="2" />
      <line x1="94" y1="154" x2="146" y2="154" stroke="#8BBA9B" strokeWidth="2" />
    </svg>
  );
};
