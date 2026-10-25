import { useState } from 'react';
import { Bookmark, Phone } from 'lucide-react';
import { initials, timeAgo, toneOf, waLink } from '../lib/utils';

// Cartel de empleo
export default function JobSign({ job, user, saved = false, onSave, onLogin, compact = false, preview = false, wide = false, style }) {
  const [open, setOpen] = useState(false);
  const interactive = !compact && !preview;
  const long = (job.description || '').length > 130 || !!job.requirements;
  const message = `Hola, vi tu aviso de "${job.title}" en Laburamos y me interesa.${user ? ` Soy ${user.name}.` : ''}`;

  return (
    <article
      className={`sign ${toneOf(job.category)}${open ? ' open' : ''}${wide ? ' wide' : ''}${compact ? ' compact' : ''}`}
      style={style}
    >
      <div className="sign-top">
        <span className="chip-s">{job.category}</span>
        <div>
          {job.is_urgent && <span className="chip-s urgent">Urgente</span>}
          <span className="chip-s">{job.job_type}</span>
        </div>
      </div>

      <h3>{job.title}</h3>
      <p className="sign-meta">
        {job.company_name} en {job.location}
      </p>

      {!compact && job.description && <p className="desc">{job.description}</p>}
      {open && job.requirements && (
        <p className="desc">
          <strong>Requisitos:</strong> {job.requirements}
        </p>
      )}
      {interactive && long && (
        <button type="button" className="more" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? 'Ver menos' : 'Ver más'}
        </button>
      )}

      <div className="sign-foot">
        <span className="price">{job.salary || 'A convenir'}</span>
        {interactive && (
          <div className="sign-acts">
            <button
              type="button"
              className={`icon-btn${saved ? ' on' : ''}`}
              onClick={() => onSave && onSave(job.id)}
              aria-label={saved ? 'Quitar de guardados' : 'Guardar aviso'}
              aria-pressed={saved}
            >
              <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
            </button>
            {user ? (
              <a className="btn btn-paper" href={waLink(job.phone, message)} target="_blank" rel="noreferrer">
                <Phone size={18} /> Postularme
              </a>
            ) : (
              <button type="button" className="btn btn-paper" onClick={onLogin}>
                Ingresá para postularte
              </button>
            )}
          </div>
        )}
      </div>

      {job.created_at && !compact && !preview && <span className="when">Publicado {timeAgo(job.created_at)}</span>}
    </article>
  );
}

// Ficha en arco de un servicio u oficio
export function Ficha({ service, user, onLogin, preview = false }) {
  const message = `Hola, vi tu servicio de "${service.title}" en Laburamos y quería consultarte.`;
  return (
    <article className={`ficha ${toneOf(service.category)}`}>
      <div className="disc" aria-hidden="true">
        {initials(service.provider_name)}
      </div>
      <span className="chip-s">{service.category}</span>
      <h3>{service.title}</h3>
      <p className="by">
        {service.provider_name} en {service.city}
      </p>
      {preview ? (
        <span className="btn btn-paper">Escribir por WhatsApp</span>
      ) : user ? (
        <a className="btn btn-paper" href={waLink(service.phone, message)} target="_blank" rel="noreferrer">
          <Phone size={18} /> Escribir
        </a>
      ) : (
        <button type="button" className="btn btn-paper" onClick={onLogin}>
          Ingresá para escribir
        </button>
      )}
    </article>
  );
}
