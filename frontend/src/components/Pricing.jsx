import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API = 'http://localhost:5000';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [extraWallets, setExtraWallets] = useState(parseInt(searchParams.get('wallets')) || 0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    const autoPlan = searchParams.get('autoCheckout');
    if (autoPlan) {
      handleCheckout(autoPlan);
    }
  }, []);

  const handleCheckout = async (planType) => {
    if (planType === 'free') {
      navigate('/dashboard');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login with intent to checkout
        navigate(`/login?redirect=pricing&autoCheckout=${planType}&wallets=${extraWallets}`);
        return;
      }

      const res = await fetch(`${API}/api/subscription/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: planType,
          extraWallets: planType === 'pro_plus' ? extraWallets : 0
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Checkout error');
      setLoading(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Starter Plan",
      price: "$0",
      period: "forever",
      description: "Ideal for individuals starting out with digital finance and global transfers.",
      features: [
        { text: "3 transactions per month (resets monthly)", active: true },
        { text: "1 saved wallet account maximum", active: true },
        { text: "Delete existing wallet to save a new one", active: true },
        { text: "Standard email support", active: true },
        { text: "Pro Badge", active: false }
      ],
      featured: false,
      btnText: "Get Started Free",
      btnClass: "btn-secondary"
    },
    {
      id: "pro",
      name: "Business Pro",
      price: "$29",
      period: "per month",
      description: "Perfect for growing online businesses and global freelancers needing instant settlements.",
      features: [
        { text: "10,000 transactions per month (resets monthly)", active: true },
        { text: "Up to 60 connected wallet accounts", active: true },
        { text: "All 60 slots can be from a single wallet type", active: true },
        { text: "24/7 Priority support (chat & call)", active: true },
        { text: "Exclusive Pro Badge", active: true }
      ],
      featured: true,
      badge: "Most Popular",
      btnText: "Upgrade to Pro",
      btnClass: "btn-primary"
    },
    {
      id: "pro_plus",
      name: "Enterprise",
      price: "Custom",
      period: "tailored pricing",
      description: "Customized solutions for high-volume companies and financial platforms.",
      features: [
        { text: "Unlimited transactions per month", active: true },
        { text: "Up to 200 connected wallet accounts included", active: true },
        { text: "Extra wallet accounts: $1 each", active: true },
        { text: "Dedicated account manager", active: true },
        { text: "Exclusive Pro Plus Badge", active: true }
      ],
      featured: false,
      btnText: "Upgrade to Enterprise",
      btnClass: "btn-secondary",
      isCustom: true
    }
  ];

  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <div className="section-header">
          <h2>Simple, Transparent Pricing</h2>
          <p>Choose the plan that fits your business needs. No hidden setup fees or surprise charges.</p>
        </div>
        <div className="pricing-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
          {plans.map((plan, index) => (
            <div className={`pricing-card glass-panel ${plan.featured ? 'featured' : ''}`} key={index} style={{ flex: '1 1 320px' }}>
              {plan.featured && <div className="pricing-badge">{plan.badge}</div>}
              <div className="pricing-header">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
                <div className="pricing-price">
                  <span className="price-val">
                    {plan.isCustom ? `$${99 + (extraWallets * 1)}` : plan.price}
                  </span>
                  <span className="price-period">/ {plan.period}</span>
                </div>
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} style={{ opacity: feature.active ? 1 : 0.5 }}>
                    <i className={`bx ${feature.active ? 'bx-check-circle' : 'bx-x-circle'}`}></i>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>

              {plan.isCustom && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                    Additional Wallet Accounts ($1 each)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={extraWallets}
                    onChange={(e) => setExtraWallets(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{
                      width: '100%', padding: '0.8rem', borderRadius: '8px',
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              )}

              {(() => {
                const hierarchy = { free: 0, pro: 1, pro_plus: 2 };
                const userLevel = hierarchy[user?.plan || 'free'] || 0;
                const cardLevel = hierarchy[plan.id] || 0;

                let btnText = plan.btnText;
                let isDisabled = false;

                if (userLevel === cardLevel) {
                  btnText = 'Current Plan';
                  isDisabled = true;
                } else if (userLevel > cardLevel) {
                  btnText = 'Unavailable (Downgrade)';
                  isDisabled = true;
                }

                return (
                  <button
                    className={plan.btnClass}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loading || isDisabled}
                    style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    {loading ? 'Processing...' : btnText}
                  </button>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;

