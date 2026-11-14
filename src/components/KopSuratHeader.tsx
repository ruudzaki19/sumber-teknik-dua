import React from 'react';

interface KopSuratHeaderProps {
  compact?: boolean;
}

export const KopSuratHeader: React.FC<KopSuratHeaderProps> = ({ compact = false }) => {
  return (
    <div className="w-full pb-3 border-b-2 border-emerald-800 mb-4">
      <div className="flex items-center justify-between gap-4">
        {/* Logo Roda Gigi Hijau ST Resmi */}
        <div className="shrink-0 flex items-center justify-center">
          <img
            src="/logo-resmi.png"
            alt="Logo ST"
            style={{
              width: compact ? '68px' : '88px',
              height: compact ? '68px' : '88px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Info Perusahaan */}
        <div className="flex-1 text-center">
          <h1
            style={{
              fontSize: compact ? '20px' : '25px',
              fontWeight: 900,
              color: '#14532d', // Dark forest green
              letterSpacing: '1px',
              lineHeight: '1.15',
              textTransform: 'uppercase',
              margin: 0
            }}
          >
            SUMBER TEKNIK DUA
          </h1>
          <p
            style={{
              fontSize: compact ? '11px' : '13px',
              fontWeight: 800,
              color: '#166534',
              textTransform: 'uppercase',
              marginTop: '2px',
              marginBottom: '2px',
              letterSpacing: '0.5px'
            }}
          >
            Service, Jual-Beli
          </p>
          <p
            style={{
              fontSize: compact ? '10px' : '11.5px',
              fontWeight: 600,
              color: '#1f2937',
              marginTop: '1px',
              marginBottom: '2px',
              lineHeight: '1.25'
            }}
          >
            AC Rumah, AC Mobil, Kulkas, Freezer, Water Heater, Mesin Cuci, Dispenser
          </p>
          <p
            style={{
              fontSize: compact ? '9.5px' : '11px',
              fontWeight: 500,
              color: '#374151',
              marginTop: '1px',
              lineHeight: '1.2'
            }}
          >
            Komp. Griya Serpong Blok H4/2, Telp. <strong>0813 8895 9081</strong>, Serpong - Tangerang
          </p>
        </div>

        {/* Right side balance spacer */}
        <div className="shrink-0" style={{ width: compact ? '68px' : '88px' }}>
          {/* Symmetrical placeholder for clean balance or right-side contact badge */}
          <div className="text-right text-[10px] text-emerald-800 font-bold border border-emerald-300 rounded-lg p-1.5 bg-emerald-50/50 leading-tight">
            <span>RESMI &amp;</span>
            <br />
            <span>TERPERCAYA</span>
          </div>
        </div>
      </div>

      {/* Decorative double border rule */}
      <div style={{ marginTop: '8px', borderBottom: '3px solid #14532d' }}></div>
      <div style={{ marginTop: '1.5px', borderBottom: '1px solid #15803d' }}></div>
    </div>
  );
};
