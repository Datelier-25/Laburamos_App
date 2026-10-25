import { ALL_CITIES, CITIES, initials } from '../lib/utils';

// Selector de localidad que vive dentro de los títulos
export function CityPick({ city, setCity, dark = false }) {
  return (
    <select
      className={`cityPick${dark ? ' dark' : ''}`}
      value={city}
      onChange={(e) => setCity(e.target.value)}
      aria-label="Elegir localidad"
    >
      {[ALL_CITIES, ...CITIES].map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

export function SkeletonGrid({ n = 6 }) {
  return (
    <div className="signs" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="skel" />
      ))}
    </div>
  );
}

export function Empty({ title, text, children }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

// Fila de la guía: sirve para oficios y para candidatos
export function Row({ tone, name, tag, title, by, desc, action }) {
  return (
    <article className={`row ${tone}`}>
      <div className="disc" aria-hidden="true">
        {initials(name)}
      </div>
      <div>
        <span className="chip-s">{tag}</span>
        <h3>{title}</h3>
        <p className="by">{by}</p>
        {desc && <p className="rdesc">{desc}</p>}
      </div>
      <div className="act">{action}</div>
    </article>
  );
}

export function Footer({ go, links }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <p className="foot-big" aria-hidden="true">
          laburamos
        </p>
        <div className="foot-cols">
          <p>
            Hecho para Bragado, O'Brien, Mechita, Alberti y 9 de Julio. El contacto es directo por WhatsApp: no cobramos comisiones ni
            intervenimos en los acuerdos.
          </p>
          <div className="foot-links">
            {links.map((l) => (
              <button key={l.id} onClick={() => go(l.id)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
