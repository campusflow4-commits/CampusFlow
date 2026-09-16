import mongoose from 'mongoose';

/**
 * Resilient SRV resolver for networks/routers that block or refuse UDP DNS SRV queries.
 * Queries Google DoH over HTTPS and constructs a direct replica set connection URI.
 */
async function resolveAtlasSrv(uri) {
  if (!uri || !uri.startsWith('mongodb+srv://')) return uri;

  const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!match) return uri;

  const [, userinfo, srvHost, dbPath = '', query = ''] = match;

  try {
    const srvRes = await fetch(`https://dns.google/resolve?name=_mongodb._tcp.${srvHost}&type=SRV`).then(r => r.json());
    const srvRecords = (srvRes.Answer || []).filter(a => a.type === 33).map(a => {
      const parts = a.data.split(' ');
      return `${parts[3].replace(/\.$/, '')}:${parts[2]}`;
    });

    if (srvRecords.length === 0) return uri;

    const txtRes = await fetch(`https://dns.google/resolve?name=${srvHost}&type=TXT`).then(r => r.json());
    const txtData = (txtRes.Answer || []).filter(a => a.type === 16).map(a => a.data.replace(/"/g, '')).join('&');

    const params = new URLSearchParams(txtData);
    if (query) {
      const extra = new URLSearchParams(query.replace(/^\?/, ''));
      for (const [k, v] of extra.entries()) params.set(k, v);
    }
    params.set('ssl', 'true');

    return `mongodb://${userinfo}@${srvRecords.join(',')}${dbPath || '/'}?${params.toString()}`;
  } catch (err) {
    return uri;
  }
}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('\n❌ MongoDB Connection Error: MONGO_URI is not defined in server/.env file.');
    console.error('👉 Please create a .env file in the server/ folder and paste your MongoDB Atlas connection string.\n');
    return false;
  }

  if (uri.includes('<password>') || uri.includes('<username>')) {
    console.error('\n⚠️  MongoDB Connection Warning: Your MONGO_URI still contains placeholder text (<username> or <password>).');
    console.error('👉 Please replace <username> and <password> with your actual MongoDB Atlas database user credentials.\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`\n✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}\n`);
    return true;
  } catch (error) {
    const isSrvIssue = error.message && (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED'));

    if (isSrvIssue && uri.startsWith('mongodb+srv://')) {
      console.log('🔄 Local DNS refused SRV resolution. Attempting resilient connection...');
      try {
        const fallbackUri = await resolveAtlasSrv(uri);
        if (fallbackUri !== uri) {
          const conn = await mongoose.connect(fallbackUri, {
            serverSelectionTimeoutMS: 8000
          });
          console.log(`\n✅ MongoDB Atlas Connected Successfully (Resilient Mode): ${conn.connection.host}`);
          console.log(`📦 Database: ${conn.connection.name}\n`);
          return true;
        }
      } catch (fallbackErr) {
        // Continue to original error reporting below
      }
    }
    const safeMsg = (error.message || '').replace(/mongodb(\+srv)?:\/\/[^@]+@/g, 'mongodb+srv://***:***@');
    console.error('\n❌ MongoDB Atlas Connection Failed:');
    console.error(`Message: ${safeMsg}`);

    if (
      safeMsg.includes('SSL alert number 80') ||
      safeMsg.includes('tlsv1 alert internal error') ||
      safeMsg.includes('whitelisted') ||
      safeMsg.includes('MongooseServerSelectionError')
    ) {
      console.error('\n🚨 ROOT CAUSE: MongoDB Atlas SSL/TLS Handshake Rejected (SSL Alert 80)');
      console.error('👉 Reason 1: Your public IP address is not whitelisted in MongoDB Atlas.');
      console.error('   Fix: Open MongoDB Atlas (cloud.mongodb.com) -> Network Access -> Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0).');
      console.error('👉 Reason 2: Your Atlas cluster is Paused.');
      console.error('   Fix: Open MongoDB Atlas -> Database Deployments -> Click "Resume" on your cluster.');
    } else if (safeMsg.includes('bad auth') || safeMsg.includes('Authentication failed')) {
      console.error('👉 Hint: Check your database username and password in server/.env.');
    } else if (safeMsg.includes('ETIMEDOUT') || safeMsg.includes('ENOTFOUND') || safeMsg.includes('queryTxt')) {
      console.error('👉 Hint: Network timeout connecting to Atlas DNS. Check your internet connection.');
    }
    console.error('');
    return false;
  }
};
