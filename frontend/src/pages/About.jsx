import aboutGlobe from '../assets/about_globe_neon.png';

const About = () => {
  const metrics = [
    {
      icon: "bx-transfer",
      value: "2.5s",
      label: "Average Settlement Speed"
    },
    {
      icon: "bx-check-shield",
      value: "99.99%",
      label: "System Uptime SLA"
    },
    {
      icon: "bx-dollar-circle",
      value: "$0.00",
      label: "Standard Transfer Fee"
    },
    {
      icon: "bx-coin-stack",
      value: "150+",
      label: "Supported Fiat & Cryptos"
    }
  ];

  const offices = [
    {
      city: "New York",
      tag: "Global HQ",
      address: "123 Innovation Drive, Tech City, CA 94000",
      email: "ny@paychain.inc",
      phone: "+1 (800) 123-4567",
      time: "EST (UTC -5)",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=400&auto=format&fit=crop"
    },
    {
      city: "Zurich",
      tag: "European Hub",
      address: "45 Bahnhofstrasse, 8001 Zürich, Switzerland",
      email: "zurich@paychain.inc",
      phone: "+41 44 234 5678",
      time: "CET (UTC +1)",
      image: "https://images.unsplash.com/photo-1527866512907-a35a62a0f6c5?q=80&w=400&auto=format&fit=crop"
    },
    {
      city: "Singapore",
      tag: "APAC Headquarters",
      address: "8 Marina Boulevard, Singapore 018981",
      email: "sg@paychain.inc",
      phone: "+65 6789 0123",
      time: "SGT (UTC +8)",
      image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=400&auto=format&fit=crop"
    }
  ];

  const jobs = [
    {
      title: "Senior Protocol Architect",
      tags: ["Engineering", "Remote", "Cryptography"],
      description: "Design and implement consensus mechanisms and transaction routing engines over public ledgers.",
      location: "Remote / Hybrid (NYC)",
      salary: "$160k - $210k"
    },
    {
      title: "Compliance Director",
      tags: ["Legal", "Zurich", "Urgent"],
      description: "Manage global FinCEN registration, European MiCA standards, and ensure transaction security audit compatibility.",
      location: "Zurich, CH",
      salary: "$140k - $180k",
      urgent: true
    },
    {
      title: "Lead UI/UX Product Designer",
      tags: ["Design", "Remote", "Figma"],
      description: "Create premium, state-of-the-art visual flows for the PayChain dashboard, website, and mobile assets.",
      location: "Remote",
      salary: "$120k - $150k"
    }
  ];

  const press = [
    { name: "Bloomberg", icon: "bx-line-chart" },
    { name: "Forbes", icon: "bx-award" },
    { name: "TechCrunch", icon: "bx-network-chart" },
    { name: "Wired", icon: "bx-chip" },
    { name: "CoinDesk", icon: "bx-bitcoin" }
  ];

  const values = [
    {
      icon: "bx-show",
      title: "Radical Transparency",
      description: "No hidden margins, no surprise fees. We believe in absolute transparency in foreign exchange and routing rates."
    },
    {
      icon: "bx-shield-quarter",
      title: "Security First",
      description: "Multi-signature authentication, hardware-enforced keys, and rigorous audit trails protect all assets."
    },
    {
      icon: "bx-globe",
      title: "Universal Access",
      description: "Connecting local banking rails into single Web3 vaults to bridge gaps between traditional and digital finance."
    },
    {
      icon: "bx-rocket",
      title: "Continuous Innovation",
      description: "Optimizing transaction routing systems using the fastest public ledgers to ensure near-zero transit time."
    }
  ];

  const team = [
    {
      name: "Sarah Jenkins",
      role: "CEO & Co-Founder",
      bio: "Former Fintech Executive with 12+ years building cross-border routing infrastructure.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
      socials: { linkedin: "#", twitter: "#" }
    },
    {
      name: "David Chen",
      role: "CTO & Co-Founder",
      bio: "Decentralized protocol developer, creator of open-source settlement layers.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
      socials: { linkedin: "#", github: "#" }
    },
    {
      name: "Elena Rostova",
      role: "Head of Compliance",
      bio: "Ex-regulator specializing in crypto compliance frameworks and global anti-money laundering rails.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
      socials: { linkedin: "#", twitter: "#" }
    },
    {
      name: "Marcus Aurelius",
      role: "VP of Product Engineering",
      bio: "Loves crafting micro-animations and highly responsive systems. Leading our frontend engineering teams.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      socials: { linkedin: "#", github: "#" }
    }
  ];

  return (
    <main className="page-wrapper fade-in">
      {/* Hero Header */}
      <section className="page-header">
        <div className="container">
          <h1>Redefining the Future of <span>Finance</span></h1>
          <p>We are on a mission to democratize global payments, making cross-border transactions as easy as sending a text message.</p>
        </div>
      </section>

      {/* Main Vision/Mission Grid */}
      <section className="about-content container">
        <div className="about-grid">
          <div className="about-text-content">
            <div className="about-text glass-panel">
              <h2>Our Vision</h2>
              <p>Founded in 2026, PayChain was built on a simple premise: the legacy financial system is too slow, too expensive, and too exclusive. We set out to build a platform that leverages cutting-edge technology to give everyone access to instantaneous, zero-fee global transfers.</p>
              <p>Today, millions of users trust PayChain to handle their personal and business finances securely and efficiently.</p>
            </div>

            <div className="about-mission glass-panel">
              <div className="mission-icon"><i className="bx bx-target-lock"></i></div>
              <div className="mission-text">
                <h3>Our Mission</h3>
                <p>To eliminate financial borders, decrease transit times to zero, and reduce friction for cross-border e-commerce, freelancers, and businesses globally.</p>
              </div>
            </div>
          </div>

          {/* Interactive Globe & Floating Badges */}
          <div className="about-graphics-wrapper">
            <div className="about-globe-container">
              <img src={aboutGlobe} className="about-globe-img" alt="PayChain Global Network" />

              <div className="floating-stat-badge stat-badge-1">
                <div className="badge-icon"><i className="bx bx-line-chart"></i></div>
                <div className="badge-info">
                  <h4>$100B+</h4>
                  <p>Processed</p>
                </div>
              </div>

              <div className="floating-stat-badge stat-badge-2">
                <div className="badge-icon"><i className="bx bx-group"></i></div>
                <div className="badge-info">
                  <h4>5M+</h4>
                  <p>Global Users</p>
                </div>
              </div>

              <div className="floating-stat-badge stat-badge-3">
                <div className="badge-icon"><i className="bx bx-buildings"></i></div>
                <div className="badge-info">
                  <h4>400+</h4>
                  <p>Team Members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Interactive Metrics Section */}
      <section className="about-metrics-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Engineered for Speed & Scale</h2>
            <p>Our infrastructure benchmark reports showcase why digital-first enterprises choose our rails.</p>
          </div>
          <div className="metrics-grid">
            {metrics.map((m, idx) => (
              <div className="metric-card glass-panel" key={idx}>
                <div className="metric-icon">
                  <i className={`bx ${m.icon}`}></i>
                </div>
                <h3>{m.value}</h3>
                <p>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones / Journey Timeline */}
      <section className="journey-section">
        <div className="container">
          <div className="section-header">
            <h2>PayChain Milestones</h2>
            <p>Tracing our history from a garage-founded start-up to a leading global payment infrastructure.</p>
          </div>

          <div className="timeline">
            <div className="timeline-item left">
              <div className="timeline-dot"></div>
              <div className="timeline-content glass-panel">
                <span className="timeline-year">2026</span>
                <h3>Founding & Conception</h3>
                <p>PayChain was founded in New York by Sarah Jenkins and David Chen, securing a $3.5M seed round to rebuild global wire rails using decentralized ledgers.</p>
              </div>
            </div>

            <div className="timeline-item right">
              <div className="timeline-dot"></div>
              <div className="timeline-content glass-panel">
                <span className="timeline-year">2027</span>
                <h3>Public Launch & Growth</h3>
                <p>Released beta to the public. Processed over $1B in peer-to-peer cross-border volume and integrated standard bank funding API endpoints.</p>
              </div>
            </div>

            <div className="timeline-item left">
              <div className="timeline-dot"></div>
              <div className="timeline-content glass-panel">
                <span className="timeline-year">2028</span>
                <h3>Expanding Global Rails</h3>
                <p>Added support for instant payouts via SEPA in Europe and Pix in Latin America, establishing our first international presence in Zurich and São Paulo.</p>
              </div>
            </div>

            <div className="timeline-item right">
              <div className="timeline-dot"></div>
              <div className="timeline-content glass-panel">
                <span className="timeline-year">2029</span>
                <h3>Enterprise Grade & Scaling</h3>
                <p>Launched developer APIs, custom multi-currency wallets, and reached the milestone of processing over $100B in total transactions with 5M+ users.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2>What Drives Us</h2>
            <p>Our operational decisions are governed by a set of shared principles and high compliance standards.</p>
          </div>
          <div className="values-grid">
            {values.map((val, index) => (
              <div className="value-card glass-panel" key={index}>
                <div className="value-icon">
                  <i className={`bx ${val.icon}`}></i>
                </div>
                <h3>{val.title}</h3>
                <p>{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Global Footprint Section */}
      <section className="global-footprint-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Global Presence</h2>
            <p>Operating across multiple jurisdictions to ensure compliance and robust support for global clients.</p>
          </div>
          <div className="offices-grid">
            {offices.map((office, idx) => (
              <div className="office-card glass-panel" key={idx}>
                <div
                  className="office-img"
                  style={{ backgroundImage: `url(${office.image})` }}
                  alt={office.city}
                />
                <div className="office-info">
                  <span className="office-tag">{office.tag}</span>
                  <h3>{office.city}</h3>
                  <p><i className="bx bx-map-pin"></i> {office.address}</p>
                  <p><i className="bx bx-envelope"></i> {office.email}</p>
                  <p><i className="bx bx-phone"></i> {office.phone}</p>
                  <div className="timezone-badge">
                    <span>{office.time}</span>
                    <span className="live-indicator">Online</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Press Features */}
      <section className="press-section" style={{ overflow: 'hidden' }}>
        <div className="container">
          <div className="press-title">As Featured In</div>
          <div className="press-logos">
            {press.map((p, idx) => (
              <div className="press-logo" key={idx}>
                <i className={`bx ${p.icon}`}></i>
                {p.name}
              </div>
            ))}
            {/* Duplicates for marquee effect on mobile */}
            {press.map((p, idx) => (
              <div className="press-logo duplicate" key={`dup-${idx}`}>
                <i className={`bx ${p.icon}`}></i>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Leadership</h2>
            <p>Led by a global team of experts in cryptography, compliance, and product engineering.</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div className="team-card glass-panel" key={index}>
                <div className="team-avatar">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                  <p className="team-bio">{member.bio}</p>
                  <div className="team-socials">
                    {member.socials.linkedin && (
                      <a href={member.socials.linkedin} aria-label="LinkedIn"><i className="bx bxl-linkedin"></i></a>
                    )}
                    {member.socials.twitter && (
                      <a href={member.socials.twitter} aria-label="Twitter"><i className="bx bxl-twitter"></i></a>
                    )}
                    {member.socials.github && (
                      <a href={member.socials.github} aria-label="GitHub"><i className="bx bxl-github"></i></a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Careers Section */}
      <section className="careers-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Join the PayChain Movement</h2>
            <p>Help us write the protocol for global financial democracy. We are always hiring bold thinkers.</p>
          </div>
          <div className="jobs-grid">
            {jobs.map((job, idx) => (
              <div className="job-card glass-panel" key={idx}>
                <div className="job-tags">
                  {job.tags.map((t, tIdx) => (
                    <span className={`job-tag ${t === 'Urgent' ? 'urgent' : ''}`} key={tIdx}>{t}</span>
                  ))}
                </div>
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <div className="job-footer">
                  <span><i className="bx bx-map"></i> {job.location}</span>
                  <a href="#apply" className="job-link">Apply Now <i className="bx bx-right-arrow-alt"></i></a>
                </div>
              </div>
            ))}
          </div>
          <div className="careers-cta-box">
            <button className="btn-primary">View All Openings</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
