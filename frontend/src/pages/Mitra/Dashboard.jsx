export default function MitraDashboard() {
  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Dashboard Mitra</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Selamat datang kembali, Budi. Berikut ringkasan aktivitas Anda.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Pendapatan Bulan Ini</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>Rp 1.500.000</div>
        </div>
        
        <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Pesanan Selesai</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>12</div>
        </div>
        
        <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Menunggu Konfirmasi</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>3</div>
        </div>
      </div>
      
      <h2 style={{ marginBottom: '16px' }}>Pesanan Masuk Terbaru</h2>
      <div className="glass-card">
        <p style={{ color: 'var(--text-muted)' }}>Belum ada pesanan masuk baru saat ini. Pastikan Anda mengatur status ketersediaan ke "Tersedia".</p>
      </div>
    </div>
  );
}
