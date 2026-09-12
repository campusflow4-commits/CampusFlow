import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const testEmail = `teststudent_${Date.now()}@gmail.com`;
const testPassword = 'SecurePassword123!';
const testName = 'Test Student Atlas';

async function verifyFlow() {
  console.log('----------------------------------------------------');
  console.log('🧪 Running CampusFlow End-to-End Registration Test...');
  console.log('----------------------------------------------------');
  console.log(`👤 Test User Email: ${testEmail}`);

  // 1. Test POST /api/auth/register
  console.log('\nStep 1: Sending Registration Request to Backend API...');
  const regResponse = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      year: '3rd Year',
      college: 'Computer Engineering',
      password: testPassword,
      confirmPassword: testPassword,
      deviceId: 'device_test_e2e_123'
    })
  });

  const regData = await regResponse.json();
  console.log(`Registration HTTP Status: ${regResponse.status}`);
  if (regResponse.status !== 201) {
    console.error('❌ Registration Failed:', regData);
    process.exit(1);
  }
  console.log('✅ Registration Succeeded!');
  console.log(`   User ID: ${regData._id}`);
  console.log(`   Credits: ${regData.credits} (Starter Credits)`);
  console.log(`   JWT Token Issued: ${!!regData.token}`);

  // 2. Query MongoDB Atlas directly to confirm user is saved and password is hashed
  console.log('\nStep 2: Directly Verifying User in MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const userInDb = await db.collection('users').findOne({ email: testEmail });

  if (!userInDb) {
    console.error('❌ User was NOT found in MongoDB database!');
    process.exit(1);
  }
  console.log('✅ User is actually saved in MongoDB Atlas!');
  console.log(`   Name: ${userInDb.name}`);
  console.log(`   Email: ${userInDb.email}`);
  console.log(`   Credits in DB: ${userInDb.credits}`);
  console.log(`   Referral Code: ${userInDb.referralCode}`);

  // Verify password is hashed with bcrypt
  const isBcryptHash = userInDb.password.startsWith('$2a$') || userInDb.password.startsWith('$2b$');
  const isPlainPassword = userInDb.password === testPassword;
  const passwordMatchesHash = await bcrypt.compare(testPassword, userInDb.password);

  console.log(`   Password Hashed with bcrypt: ${isBcryptHash}`);
  console.log(`   Plain text exposed: ${isPlainPassword}`);
  console.log(`   Password verifies with bcrypt.compare: ${passwordMatchesHash}`);

  if (!isBcryptHash || isPlainPassword || !passwordMatchesHash) {
    console.error('❌ Password hashing verification failed!');
    process.exit(1);
  }
  console.log('✅ Password is securely hashed in MongoDB Atlas!');

  // Verify starter credits transaction in CreditTransaction collection
  const creditTx = await db.collection('credittransactions').findOne({ user: userInDb._id });
  if (creditTx) {
    console.log(`✅ Starter credit transaction verified: +${creditTx.amount} credits (${creditTx.description})`);
  }

  await mongoose.disconnect();

  // 3. Test POST /api/auth/login
  console.log('\nStep 3: Testing Login with New Gmail & Password...');
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      deviceId: 'device_test_e2e_123'
    })
  });

  const loginData = await loginResponse.json();
  console.log(`Login HTTP Status: ${loginResponse.status}`);
  if (loginResponse.status !== 200) {
    console.error('❌ Login Failed:', loginData);
    process.exit(1);
  }
  console.log('✅ Login Succeeded!');
  console.log(`   Welcome back, ${loginData.name}!`);
  console.log(`   Token received: ${loginData.token.slice(0, 20)}...`);

  // 4. Test GET /api/auth/me (Dashboard profile load)
  console.log('\nStep 4: Testing Dashboard Session (/api/auth/me)...');
  const meResponse = await fetch('http://localhost:5000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });

  const meData = await meResponse.json();
  console.log(`Session HTTP Status: ${meResponse.status}`);
  if (meResponse.status !== 200) {
    console.error('❌ Session verification failed:', meData);
    process.exit(1);
  }
  console.log('✅ Dashboard Data Loaded Successfully!');
  console.log(`   Credits Balance: ${meData.credits}`);
  console.log(`   Trial Days Remaining: ${meData.trialDaysRemaining} days`);
  console.log('----------------------------------------------------');
  console.log('🎉 ALL 5 REGISTRATION CHECKS PASSED PERFECTLY!');
  console.log('----------------------------------------------------');
}

verifyFlow().catch(console.error);
