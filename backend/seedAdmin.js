import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/paychain';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create a generic User schema reference to bypass strict validation if needed
    const User = mongoose.model('User', new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      isAdmin: { type: Boolean, default: false }
    }, { strict: false }));

    const adminEmail = 'admin@paychain.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('Existing user updated to Admin.');
      } else {
        console.log('Admin user already exists.');
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const newAdmin = new User({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });

      await newAdmin.save();
      console.log('New admin user created successfully.');
    }

    console.log('\n--- Admin Credentials ---');
    console.log('Email: admin@paychain.com');
    console.log('Password: admin123');
    console.log('-------------------------\n');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();
