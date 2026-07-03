export default function CustomerHome() {
  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Layanan Bantuan HandyGo</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Pilih layanan yang Anda butuhkan hari ini.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '12px' }}>Bersih-Bersih</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Panggil mitra untuk membersihkan rumah Anda secara menyeluruh.</p>
          <button className="btn btn-primary" style={{ width: '100%' }}>Pesan Sekarang</button>
        </div>
        
        <div className="glass-card">
          <h3 style={{ marginBottom: '12px' }}>Jaga Bayi (Babysitting)</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Mitra profesional siap menjaga buah hati Anda dengan aman.</p>
          <button className="btn btn-primary" style={{ width: '100%' }}>Pesan Sekarang</button>
        </div>
        
        <div className="glass-card">
          <h3 style={{ marginBottom: '12px' }}>Jaga Rumah</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Pergi dengan tenang, mitra kami akan menjaga rumah Anda.</p>
          <button className="btn btn-primary" style={{ width: '100%' }}>Pesan Sekarang</button>
        </div>
      </div>
    </div>
  );
}
