import { useState, useEffect } from 'react';

const CurrencyConverter = () => {
  const [fiatAmount, setFiatAmount] = useState(1000);
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [cryptoCurrency, setCryptoCurrency] = useState("USDC");
  const [cryptoAmount, setCryptoAmount] = useState(0);

  // Mock exchange rates (fiat to USD to crypto)
  const rates = {
    USD: 1.0,
    EUR: 1.08,
    GBP: 1.27,
    USDC: 1.0,
    USDT: 1.0,
    BTC: 65000.0,
    ETH: 3500.0,
    SOL: 150.0
  };

  useEffect(() => {
    // Convert fiat to USD value
    const amountInUSD = fiatAmount * rates[fiatCurrency];
    // Convert USD value to selected crypto
    const converted = amountInUSD / rates[cryptoCurrency];
    // Format output
    setCryptoAmount(converted.toFixed(cryptoCurrency === "BTC" || cryptoCurrency === "ETH" ? 6 : 2));
  }, [fiatAmount, fiatCurrency, cryptoCurrency]);

  return (
    <section className="converter" id="converter">
      <div className="container">
        <div className="section-header">
          <h2>Compare & Calculate Savings</h2>
          <p>See how much you save on international transaction fees and settlement speeds using the PayChain network.</p>
        </div>

        <div className="converter-wrapper">
          {/* Calculator Widget */}
          <div className="converter-widget glass-panel">
            <div className="input-group">
              <label htmlFor="fiat-input">You Send (Local Currency)</label>
              <div className="input-field-wrapper">
                <input 
                  type="number" 
                  id="fiat-input"
                  value={fiatAmount}
                  onChange={(e) => setFiatAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                />
                <select 
                  className="currency-select"
                  value={fiatCurrency}
                  onChange={(e) => setFiatCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="converter-arrow">
              <i className='bx bx-transfer-alt bx-rotate-90'></i>
            </div>

            <div className="input-group">
              <label htmlFor="crypto-output">Recipient Receives (Digital Assets)</label>
              <div className="input-field-wrapper">
                <input 
                  type="text" 
                  id="crypto-output"
                  value={cryptoAmount}
                  readOnly
                />
                <select 
                  className="currency-select"
                  value={cryptoCurrency}
                  onChange={(e) => setCryptoCurrency(e.target.value)}
                >
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="SOL">SOL</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>
            </div>

            <div className="converter-stats-list">
              <div className="conv-stat-item">
                <p>Network Fee</p>
                <h4>$0.50</h4>
              </div>
              <div className="conv-stat-item">
                <p>Exchange Rate</p>
                <h4>1 {fiatCurrency} = {(rates[fiatCurrency] / rates[cryptoCurrency]).toFixed(fiatCurrency === cryptoCurrency ? 2 : 5)} {cryptoCurrency}</h4>
              </div>
              <div className="conv-stat-item">
                <p>Settlement</p>
                <h4 style={{ color: '#10B981' }}>Instant</h4>
              </div>
            </div>
          </div>

          {/* Comparison List */}
          <div className="comparison-box">
            <div className="comparison-item highlight">
              <div className="comp-provider">
                <h4>PayChain Network</h4>
                <p>Direct blockchain routing</p>
              </div>
              <div className="comp-details">
                <h4>Fee: $0.50</h4>
                <p className="price-diff">Saves ~95% in fees</p>
              </div>
            </div>

            <div className="comparison-item">
              <div className="comp-provider">
                <h4>Traditional Bank Wire</h4>
                <p>SWIFT network settlements</p>
              </div>
              <div className="comp-details">
                <h4>Fee: $35.00 - $45.00</h4>
                <p style={{ color: 'var(--text-muted)' }}>Settle in 3-5 days</p>
              </div>
            </div>

            <div className="comparison-item">
              <div className="comp-provider">
                <h4>Traditional Money Transfer</h4>
                <p>Retail agent locations</p>
              </div>
              <div className="comp-details">
                <h4>Fee: $15.00 - $20.00</h4>
                <p style={{ color: 'var(--text-muted)' }}>Settle in 1-2 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrencyConverter;
