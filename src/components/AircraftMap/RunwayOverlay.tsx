import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import type { AirportRunwayResponse } from '../../api/airports';

type RunwayOverlayProps = {
  runway: AirportRunwayResponse;
  onClose: () => void;
};

export function RunwayOverlay({ runway, onClose }: RunwayOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <section className="runway-overlay" aria-labelledby="runway-overlay-title">
      <header className="runway-overlay-header">
        <div>
          <p className="runway-overlay-airport">{runway.airportIdent} · Runway</p>
          <h2 id="runway-overlay-title">{runway.leIdent ?? '?'} / {runway.heIdent ?? '?'}</h2>
        </div>
        <Button ref={closeRef} variant="ghost" size="icon" onClick={onClose}
          aria-label="Close runway specifications" title="Close runway specifications"
          className="runway-overlay-close"><X /></Button>
      </header>
      <p className={`runway-overlay-state ${runway.closed ? 'is-closed' : ''}`}>
        {runway.closed ? 'Closed' : 'Open'}
      </p>
      <dl className="runway-overlay-specs">
        <div><dt>Length</dt><dd>{runway.lengthFt == null ? 'Unknown' : `${runway.lengthFt.toLocaleString('en-US')} ft`}</dd></div>
        <div><dt>Width</dt><dd>{runway.widthFt == null ? 'Unknown' : `${runway.widthFt.toLocaleString('en-US')} ft`}</dd></div>
        <div><dt>Surface</dt><dd>{runway.surface ?? 'Unknown'}</dd></div>
        <div><dt>Lighting</dt><dd>{runway.lighted ? 'Lighted' : 'Unlighted'}</dd></div>
      </dl>
      <footer className="runway-overlay-footer">{runway.source} · Runway {runway.sourceRunwayId}</footer>
    </section>
  );
}
