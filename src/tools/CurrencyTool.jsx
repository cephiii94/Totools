import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { AdBanner } from '../components/ads/AdBanner';

const CURRENCIES = [
  { code: 'USD', name: 'Dolar Amerika (USD)' },
  { code: 'IDR', name: 'Rupiah Indonesia (IDR)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'JPY', name: 'Yen Jepang (JPY)' },
  { code: 'GBP', name: 'Pound Sterling (GBP)' },
  { code: 'SGD', name: 'Dolar Singapura (SGD)' },
  { code: 'MYR', name: 'Ringgit Malaysia (MYR)' },
  { code: 'AUD', name: 'Dolar Australia (AUD)' },
  { code: 'CNY', name: 'Yuan China (CNY)' },
  { code: 'SAR', name: 'Riyal Arab Saudi (SAR)' }
];

export const CurrencyTool = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('IDR');
  const [amount, setAmount] = useState('1');
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      if (!res.ok) throw new Error('Gagal mengambil data kurs');
      const data = await res.json();
      setRates(data.rates);
    } catch (err) {
      setError('Gagal memuat kurs terbaru. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  }, [fromCurrency]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const calculateResult = () => {
    if (!rates) return null;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return 'Masukkan jumlah nominal yang valid.';
    
    const rate = rates[toCurrency];
    if (!rate) return 'Kurs tidak ditemukan.';
    
    const result = numAmount * rate;
    return `${numAmount.toLocaleString('id-ID')} ${fromCurrency} = ${result.toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${toCurrency}`;
  };

  return (
    <div className="tool-container">
      <div className="tool-form-grid">
        <div className="form-group">
          <label>Jumlah Nominal</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
            placeholder="Masukkan jumlah..."
          />
        </div>

        <div className="form-row-swap">
          <div className="form-group flex-1">
            <label>Mata Uang Asal</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="input-field"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-icon-swap" title="Tukar Mata Uang" onClick={handleSwap}>
            <ArrowRightLeft size={18} />
          </button>

          <div className="form-group flex-1">
            <label>Mata Uang Tujuan</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="input-field"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={fetchRates} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Memperbarui Kurs...' : 'Perbarui Kurs Terbaru'}
        </button>

        <div className="result-display-card">
          {error ? (
            <span className="error-text">{error}</span>
          ) : (
            <span className="result-main-text">{calculateResult() || 'Menghitung...'}</span>
          )}
        </div>
      </div>

      <AdBanner type="inline" />
    </div>
  );
};
