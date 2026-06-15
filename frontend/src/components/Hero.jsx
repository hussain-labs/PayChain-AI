import { useEffect, useRef } from 'react';

const Hero = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.35; // Set playback speed to ~55% for smooth, slow motion
    }
  }, []);

  return (
    <section className="hero">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="hero-bg-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/crypto_bg6.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay"></div>

      <div className="container hero-container">
        <div className="hero-content">
          {/* <div className="badge">🚀 The #1 Payment Network</div> */}
          <h1>Seamless Global <span>Transactions</span> Without Limits</h1>
          <p>Experience the next generation of digital finance. Send, receive, and manage your money worldwide with zero hidden fees and bank-grade security.</p>
          <div className="hero-btns">
            <a href="#" className="btn-primary btn-large">Open Free Account <i className='bx bx-right-arrow-alt'></i></a>
            <a href="#" className="btn-secondary btn-large"><i className='bx bx-play-circle'></i> Watch Demo</a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <h3>$50B+</h3>
              <p>Volume Processed</p>
            </div>
            <div className="stat-item">
              <h3>2M+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-item">
              <h3>190+</h3>
              <p>Countries Supported</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
