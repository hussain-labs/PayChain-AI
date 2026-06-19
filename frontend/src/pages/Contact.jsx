import { useState } from 'react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeMap, setActiveMap] = useState(0);

  const offices = [
    {
      city: "New York HQ",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617540989508!2d-73.98685412344795!3d40.74844047138804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
    },
    {
      city: "Zurich Hub",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2702.04690325495!2d8.536780076774646!3d47.372071804106366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47900a08adb4b5df%3A0xe1043372c056d6eb!2sBahnhofstrasse%2C%20Z%C3%BCrich%2C%20Switzerland!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
    },
    {
      city: "Singapore Hub",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8199178912384!2d103.8519531754972!3d1.2785501621376883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1908be140c6b%3A0x63351ec12cb4ec9e!2sMarina%20Boulevard%2C%20Singapore!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
    }
  ];

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const channels = [
    {
      icon: "bx-envelope",
      title: "General Support",
      description: "Chat with our friendly support team for account queries and quick assistance.",
      linkText: "support@paychain.inc",
      linkUrl: "mailto:support@paychain.inc"
    },
    {
      icon: "bx-briefcase",
      title: "Enterprise Sales",
      description: "Connect with our sales specialists to discuss high-volume commercial settlements.",
      linkText: "Schedule a Demo",
      linkUrl: "#sales"
    },
    {
      icon: "bx-code-alt",
      title: "Developer Portal",
      description: "Access full API documentation, sandbox setup guides, and Web3 SDK code snippets.",
      linkText: "View Documentation",
      linkUrl: "#docs"
    },
    {
      icon: "bx-shield-quarter",
      title: "Security Desk",
      description: "Report vulnerabilities or check security auditing compliance standards.",
      linkText: "Submit Report",
      linkUrl: "#security"
    }
  ];

  const faqs = [
    {
      question: "How fast are cross-border transfers?",
      answer: "Most global settlements are completed in under 2.5 seconds. For transactions requiring legacy wire conversions (e.g. ACH to SEPA), transit times average 15-30 minutes."
    },
    {
      question: "Are there any compliance requirements to open an account?",
      answer: "Yes, PayChain complies with FinCEN and MiCA guidelines. To initiate high-volume transfers, standard KYC/KYB business verification is required. Setup takes under 10 minutes."
    },
    {
      question: "What currencies and tokens are supported?",
      answer: "We support over 50 fiat currencies (USD, EUR, GBP, SGD, CHF) and over 100 major digital assets (USDC, USDT, BTC, ETH) routed over the fastest public blockchains."
    },
    {
      question: "How does PayChain secure user funds?",
      answer: "All funds are secured using multi-signature MPC vaults with hardware-security modules. We conduct quarterly smart-contract audits and maintain a full 1:1 liquid reserve ratio."
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you! Your message has been sent. A representative will contact you shortly.");
  };

  return (
    <main className="page-wrapper fade-in">
      {/* Hero Header */}
      <section className="page-header">
        <div className="container">
          <h1>We'd Love to <span>Hear From You</span></h1>
          <p>Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.</p>
        </div>
      </section>

      {/* Main Info and Form Section */}
      <section className="contact-content container">
        <div className="contact-grid">
          {/* Contact Information Column */}
          <div className="contact-info glass-panel">
            <h2>Contact Information</h2>
            <p>Reach out to us through any of these channels, and we will get back to you within 24 hours.</p>
            
            <div className="info-item">
              <i className='bx bx-envelope'></i>
              <div>
                <h4>Email</h4>
                <p><a href="mailto:support@paychain.inc">support@paychain.inc</a></p>
              </div>
            </div>
            
            <div className="info-item">
              <i className='bx bx-phone'></i>
              <div>
                <h4>Phone</h4>
                <p><a href="tel:+18001234567">+1 (800) 123-4567</a></p>
              </div>
            </div>
            
            <div className="info-item">
              <i className='bx bx-map'></i>
              <div>
                <h4>Headquarters</h4>
                <p>
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                    123 Innovation Drive<br/>
                    Tech City, CA 94000
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          {/* Message Form Column */}
          <div className="contact-form glass-panel">
            <h2>Send us a message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input id="name" type="text" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input id="email" type="email" placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input id="subject" type="text" placeholder="How can we partner?" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="4" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%'}}>Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* NEW: Interactive Map Section */}
      <section className="contact-map-section container">
        <div className="contact-map-wrapper glass-panel">
          <div className="map-tabs">
            {offices.map((off, idx) => (
              <button 
                key={idx} 
                className={`map-tab ${activeMap === idx ? 'active' : ''}`}
                onClick={() => setActiveMap(idx)}
                type="button"
              >
                <i className="bx bx-map-pin"></i> {off.city}
              </button>
            ))}
          </div>
          <div className="map-iframe-container">
            <iframe 
              src={offices[activeMap].mapUrl} 
              width="100%" 
              height="400" 
              style={{ border: 0, display: 'block' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title={`PayChain ${offices[activeMap].city} Office Map`}
            ></iframe>
          </div>
        </div>
      </section>

      {/* NEW: Dedicated Support Channels */}
      <section className="support-channels-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Direct Lines of Communication</h2>
            <p>Skip the queue by sending your inquiry directly to the designated department.</p>
          </div>
          <div className="channels-grid">
            {channels.map((chan, idx) => (
              <div className="channel-card glass-panel" key={idx}>
                <div className="channel-icon">
                  <i className={`bx ${chan.icon}`}></i>
                </div>
                <h3>{chan.title}</h3>
                <p>{chan.description}</p>
                <a href={chan.linkUrl} className="channel-link">
                  {chan.linkText} <i className="bx bx-right-arrow-alt"></i>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Stateful FAQ Accordion */}
      <section className="faq-contact-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h2>Quick Solutions</h2>
            <p>Browse through frequently asked support questions before contacting operations.</p>
          </div>
          <div className="faq-accordion">
            {faqs.map((faq, idx) => (
              <div className={`faq-item glass-panel ${openFaq === idx ? 'active' : ''}`} key={idx}>
                <button 
                  className="faq-question" 
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={openFaq === idx}
                >
                  {faq.question}
                  <i className="bx bx-chevron-down"></i>
                </button>
                <div 
                  className="faq-answer"
                  style={{ maxHeight: openFaq === idx ? '200px' : '0px' }}
                >
                  <div className="faq-answer-inner">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Social Community Hub */}
      <section className="community-section container">
        <div className="community-banner glass-panel">
          <h2>Join the Global Chat</h2>
          <p>Have questions about decentralized systems? Chat directly with protocol builders and active developers in our community servers.</p>
          <div className="community-cards">
            <a href="#discord" className="community-card discord">
              <i className="bx bxl-discord-alt"></i> Discord Chat
            </a>
            <a href="#telegram" className="community-card telegram">
              <i className="bx bxl-telegram"></i> Telegram News
            </a>
            <a href="#twitter" className="community-card twitter">
              <i className="bx bxl-twitter"></i> Follow Twitter
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
