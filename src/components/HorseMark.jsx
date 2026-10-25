// Isotipo de Laburamos: caballo de frente. Al pasar el cursor por la marca
// (clase .brand) "camina" hacia adelante: avanza, se inclina de paso en paso y mueve las orejas.
export default function HorseMark({ size = 38 }) {
  return (
    <svg className="horse-mark" width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill="#0e1a4b" />
      <path d="M70 38L50 54L44 92L52 130L62 110L66 80Z" fill="#ffc21a" />
      <path d="M130 38L150 54L156 92L148 130L138 110L134 80Z" fill="#ffc21a" />
      <g className="hm-ear hm-ear-l">
        <path d="M68 44L72 12L90 40Z" fill="#ffffff" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M73 36L75 22L83 38Z" fill="#0e1a4b" />
      </g>
      <g className="hm-ear hm-ear-r">
        <path d="M132 44L128 12L110 40Z" fill="#ffffff" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
        <path d="M127 36L125 22L117 38Z" fill="#0e1a4b" />
      </g>
      <path d="M70 40L130 40L123 96L116 148L106 166L94 166L84 148L77 96Z" fill="#ffffff" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
      <path d="M96 62H104L103 138H97Z" fill="#0e1a4b" opacity="0.12" />
      <path d="M88 38C92 50 97 56 100 66C103 56 108 50 112 38Z" fill="#ffc21a" />
      <circle cx="84" cy="78" r="5" fill="#0e1a4b" />
      <circle cx="116" cy="78" r="5" fill="#0e1a4b" />
      <circle cx="85.8" cy="76.2" r="1.6" fill="#ffffff" />
      <circle cx="117.8" cy="76.2" r="1.6" fill="#ffffff" />
      <ellipse cx="94" cy="152" rx="3.2" ry="5" fill="#0e1a4b" />
      <ellipse cx="106" cy="152" rx="3.2" ry="5" fill="#0e1a4b" />
      <path d="M80 118H120" stroke="#0e1a4b" strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="118" r="6" fill="#ffc21a" stroke="#0e1a4b" strokeWidth="2" />
    </svg>
  );
}
