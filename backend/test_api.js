import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    // 1. login to get a token
    const r1 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    const d1 = await r1.json();
    if (!d1.token) {
        console.log("No token, registering...");
        const r2 = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123' })
        });
        const d2 = await r2.json();
        console.log("Register:", d2);
        const r3 = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
        var tokenData = await r3.json();
    } else {
        var tokenData = d1;
    }
    
    console.log("Got token:", tokenData.token.substring(0,20) + "...");

    // 2. call checkout
    const res = await fetch(`http://localhost:5000/api/subscription/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`
        },
        body: JSON.stringify({
          plan: 'pro',
          extraWallets: 0
        })
    });
    
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data);
  } catch (err) {
      console.error(err);
  }
}
run();
