import React from 'react';
import { NsgProximityResult } from '../../utils/nsgProximity';

interface NsgProximityInfoProps {
  result: NsgProximityResult | null;
  visible: boolean;
  loading?: boolean;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export const NsgProximityInfo: React.FC<NsgProximityInfoProps> = ({ result, visible, loading }) => {
  if (!visible) return null;

  if (loading) {
    return (
      <div
        className="fixed bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
        style={{
          zIndex: 9000,
          background: 'rgba(60, 20, 20, 0.92)',
          backdropFilter: 'blur(6px)',
          maxWidth: '90vw',
          border: '1.5px solid rgba(220, 38, 38, 0.5)',
        }}
      >
        <span style={{ fontSize: 18 }}>&#9888;&#65039;</span>
        <span className="text-red-300 font-bold text-sm">NSG-Daten werden geladen…</span>
      </div>
    );
  }

  if (!result) return null;

  if (result.insideNSG) {
    return (
      <div
        className="fixed bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
        style={{
          zIndex: 9000,
          background: 'rgba(220, 38, 38, 0.95)',
          backdropFilter: 'blur(6px)',
          maxWidth: '90vw',
          border: '2px solid rgba(255, 100, 100, 0.6)',
        }}
      >
        <span style={{ fontSize: 24 }}>&#9940;</span>
        <span className="text-white font-bold text-sm leading-tight">
          Du befindest dich in einem Naturschutzgebiet –<br />
          Goldsuchen ist hier verboten!
        </span>
      </div>
    );
  }

  if (result.distanceMeters === Infinity || result.distanceMeters > 1000) return null;

  const arrowRotation = result.bearingDegrees;

  return (
    <div
      className="fixed bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{
        zIndex: 9000,
        background: 'rgba(80, 20, 20, 0.92)',
        backdropFilter: 'blur(6px)',
        maxWidth: '90vw',
        border: '1.5px solid rgba(220, 38, 38, 0.5)',
      }}
    >
      <span style={{ fontSize: 20 }}>&#9888;&#65039;</span>
      <div className="flex flex-col leading-tight">
        <span className="text-red-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">
          Naturschutzgebiet in der Nähe
        </span>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-base">
            {formatDistance(result.distanceMeters)}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f87171"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              width: 22,
              height: 22,
              transform: `rotate(${arrowRotation}deg)`,
              transition: 'transform 0.4s ease',
            }}
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </div>
        {result.nsgName && (
          <span className="text-red-300 text-xs mt-0.5 truncate" style={{ maxWidth: 200 }}>
            {result.nsgName}
          </span>
        )}
        <span className="text-red-400/70 text-[10px] mt-1 leading-tight">
          Goldsuchen in Naturschutzgebieten verboten!
        </span>
      </div>
    </div>
  );
};
