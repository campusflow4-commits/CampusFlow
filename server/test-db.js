import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load variables from server/.env
dotenv.config();

async function testConnection() {
  const uri = process.env.MONGO_URI;

  console.log('----------------------------------------------------');
  console.log('🔍 Testing CampusFlow MongoDB Atlas Connection...');
  console.log('----------------------------------------------------');

  if (!uri || uri.includes('PASTE_MY_CONNECTION_STRING_HERE') || uri.includes('PASTE_YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE')) {
    console.error('❌ Status: MONGO_URI has not been pasted yet.');
    console.error('👉 Open file: e:\\skillswap\\server\\.env');
    console.error('👉 Replace "PASTE_MY_CONNECTION_STRING_HERE" with your MongoDB Atlas connection string.');
    process.exit(1);
  }

  if (uri.includes('<password>') || uri.includes('<db_password>')) {
    console.error('⚠️  Status: Connection string still contains placeholder "<password>" or "<db_password>".');
    console.error('👉 Please replace "<password>" in server/.env with your real database user password.');
    process.exit(1);
  }

  try {
    let conn;
    try {
      conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000 // 5 second timeout for fast feedback
      });
    } catch (srvErr) {
      if (uri.startsWith('mongodb+srv://') && (srvErr.message.includes('querySrv') || srvErr.message.includes('ECONNREFUSED'))) {
        console.log('🔄 Local DNS refused SRV resolution. Testing via resilient resolver...');
        const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
        if (match) {
          const [, userinfo, srvHost, dbPath = '', query = ''] = match;
          const srvRes = await fetch(`https://dns.google/resolve?name=_mongodb._tcp.${srvHost}&type=SRV`).then(r => r.json());
          const srvRecords = (srvRes.Answer || []).filter(a => a.type === 33).map(a => {
            const parts = a.data.split(' ');
            return `${parts[3].replace(/\.$/, '')}:${parts[2]}`;
          });
          const txtRes = await fetch(`https://dns.google/resolve?name=${srvHost}&type=TXT`).then(r => r.json());
          const txtData = (txtRes.Answer || []).filter(a => a.type === 16).map(a => a.data.replace(/"/g, '')).join('&');
          const params = new URLSearchParams(txtData);
          if (query) {
            const extra = new URLSearchParams(query.replace(/^\?/, ''));
            for (const [k, v] of extra.entries()) params.set(k, v);
          }
          params.set('ssl', 'true');
          const fallbackUri = `mongodb://${userinfo}@${srvRecords.join(',')}${dbPath || '/'}?${params.toString()}`;
          conn = await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 8000 });
        } else {
          throw srvErr;
        }
      } else {
        throw srvErr;
      }
    }

    console.log('✅ Status: Successfully connected to MongoDB Atlas!');
    console.log(`🌐 Cluster Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log('🎉 Your backend is ready to store and exchange student data!');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    const safeError = (err.message || '').replace(/mongodb(\+srv)?:\/\/[^@]+@/g, 'mongodb+srv://***:***@');
    console.error('❌ Connection Failed:');
    console.error(`Error Details: ${safeError}\n`);
    
    if (
      safeError.includes('SSL alert number 80') ||
      safeError.includes('tlsv1 alert internal error') ||
      safeError.includes('whitelisted') ||
      safeError.includes('MongooseServerSelectionError')
    ) {
      console.error('💡 ROOT CAUSE: MongoDB Atlas SSL/TLS Handshake Rejected (SSL Alert 80)');
      console.error('   1. Whitelist your IP in Atlas:');
      console.error('      Log in to cloud.mongodb.com -> Network Access -> Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0) -> Confirm.');
      console.error('   2. Check cluster status:');
      console.error('      Log in to cloud.mongodb.com -> Database Deployments. If your cluster is "Paused", click "Resume".');
    } else if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error('💡 Quick Fix: Your username or password in .env might be incorrect.');
      console.error('   Double-check that you entered the right password for your database user.');
    } else if (err.message.includes('ETIMEDOUT') || err.message.includes('ENOTFOUND') || err.message.includes('queryTxt')) {
      console.error('💡 Quick Fix: Network timeout.');
      console.error('   Make sure you added "0.0.0.0/0" under "Network Access" in your MongoDB Atlas dashboard.');
    }
    console.log('----------------------------------------------------');
    process.exit(1);
  }
}

testConnection();
