import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import './PartnerAttribute.css';

export default function PartnerAttribute() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kodepos: '',
    detail: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    return (
      formData.nama.trim() !== '' &&
      formData.alamat.trim() !== '' &&
      formData.provinsi.trim() !== '' &&
      formData.kota.trim() !== '' &&
      formData.kecamatan.trim() !== '' &&
      formData.kodepos.trim() !== ''
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Mohon isi semua data yang diwajibkan');
      return;
    }
    // Set status or proceed to next screen, maybe PartnerSuccess or similar?
    // Let's assume there's a final success page or just redirect to /customer as active
    alert('Pendaftaran Berhasil! Atribut akan segera dikirimkan.');
    navigate('/customer'); // Or wherever appropriate
  };

  return (
    <div className="partner-attr-container animate-fade-in">
      <div className="pattr-header">
        <button className="pattr-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1e293b" />
        </button>
        <h1 className="pattr-title">Alamat Pengiriman Atribut</h1>
      </div>

      <div className="pattr-content">
        <div className="pattr-warning">
          <AlertCircle size={18} color="#eab308" className="pattr-warning-icon" />
          <p className="pattr-warning-text">
            Atribut mitra HandyGo akan dikirimkan ke alamat ini. Pastikan mengisinya dengan alamat tempat tinggalmu sekarang.
          </p>
        </div>

        <form className="pattr-form" onSubmit={handleSubmit}>
          <div className="pattr-form-group">
            <label>Nama Penerima</label>
            <input 
              type="text" 
              name="nama"
              placeholder="Budiono Siregar" 
              value={formData.nama}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pattr-form-group">
            <label>Alamat Lengkap</label>
            <input 
              type="text" 
              name="alamat"
              placeholder="Nama jalan, nomor rumah" 
              value={formData.alamat}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pattr-form-group">
            <label>Provinsi</label>
            <input 
              type="text" 
              name="provinsi"
              placeholder="Sulawesi Selatan" 
              value={formData.provinsi}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pattr-form-group">
            <label>Kota/Kabupaten</label>
            <input 
              type="text" 
              name="kota"
              placeholder="Kota Makassar" 
              value={formData.kota}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pattr-form-group">
            <label>Kecamatan</label>
            <input 
              type="text" 
              name="kecamatan"
              placeholder="Tamalanrea" 
              value={formData.kecamatan}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pattr-form-group">
            <label>Kode Pos</label>
            <input 
              type="text" 
              name="kodepos"
              placeholder="90245" 
              value={formData.kodepos}
              onChange={handleChange}
              required
            />
          </div>

          <div className="pattr-form-group">
            <label>Detail Alamat (Opsional)</label>
            <input 
              type="text" 
              name="detail"
              placeholder="Dekat masjid, pagar hitam" 
              value={formData.detail}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>

      <div className="pattr-bottom-action">
        <button 
          className="pattr-submit-btn"
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          Lanjutkan
        </button>
      </div>
    </div>
  );
}
