export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Dashboard Admin</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Ringkasan sistem HandyGo hari ini.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Customer</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>1,245</div>
        </div>
        
        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Mitra Aktif</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>85</div>
        </div>
        
        <div className="glass-card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Pesanan Hari Ini</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>42</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Verifikasi Mitra Tertunda</h3>
          <p style={{ color: 'var(--text-muted)' }}>Tidak ada mitra yang menunggu verifikasi.</p>
        </div>
        
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Aktivitas Sistem</h3>
          <p style={{ color: 'var(--text-muted)' }}>Sistem berjalan normal. PWA service worker aktif.</p>
        </div>
      </div>
    </div>
  );
}
