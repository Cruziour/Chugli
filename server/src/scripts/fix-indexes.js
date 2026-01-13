// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// dotenv.config();

// const MONGODB_URI = process.env.MONGODB_URI;

// async function fixIndexes() {
//   try {
//     console.log('🔄 Connecting to MongoDB...');
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ Connected!\n');

//     const db = mongoose.connection.db;

//     // ============== Fix ROOMS Collection ==============
//     console.log('📦 Checking ROOMS collection indexes...');

//     const roomsCollection = db.collection('rooms');
//     const roomIndexes = await roomsCollection.indexes();

//     console.log('Current indexes on rooms:');
//     roomIndexes.forEach((idx, i) => {
//       console.log(`  ${i + 1}. ${idx.name}:`, JSON.stringify(idx.key));
//     });

//     // Find 2dsphere indexes
//     const geoIndexes = roomIndexes.filter((idx) => Object.values(idx.key).includes('2dsphere'));

//     console.log(`\n🌍 Found ${geoIndexes.length} 2dsphere index(es)`);

//     if (geoIndexes.length > 1) {
//       console.log('⚠️  Multiple 2dsphere indexes found! Dropping extras...');

//       // Keep first one, drop rest
//       for (let i = 1; i < geoIndexes.length; i++) {
//         const indexName = geoIndexes[i].name;
//         console.log(`  Dropping: ${indexName}`);
//         await roomsCollection.dropIndex(indexName);
//       }

//       console.log('✅ Duplicate indexes dropped!');
//     }

//     // ============== Fix USERS Collection ==============
//     console.log('\n📦 Checking USERS collection indexes...');

//     const usersCollection = db.collection('users');
//     const userIndexes = await usersCollection.indexes();

//     console.log('Current indexes on users:');
//     userIndexes.forEach((idx, i) => {
//       console.log(`  ${i + 1}. ${idx.name}:`, JSON.stringify(idx.key));
//     });

//     const userGeoIndexes = userIndexes.filter((idx) => Object.values(idx.key).includes('2dsphere'));

//     console.log(`\n🌍 Found ${userGeoIndexes.length} 2dsphere index(es)`);

//     if (userGeoIndexes.length > 1) {
//       console.log('⚠️  Multiple 2dsphere indexes found! Dropping extras...');

//       for (let i = 1; i < userGeoIndexes.length; i++) {
//         const indexName = userGeoIndexes[i].name;
//         console.log(`  Dropping: ${indexName}`);
//         await usersCollection.dropIndex(indexName);
//       }

//       console.log('✅ Duplicate indexes dropped!');
//     }

//     // ============== Recreate Proper Indexes ==============
//     console.log('\n🔨 Ensuring proper indexes exist...');

//     // Rooms collection
//     try {
//       await roomsCollection.createIndex(
//         { location: '2dsphere' },
//         { name: 'location_2dsphere', background: true }
//       );
//       console.log('✅ rooms.location index ensured');
//     } catch (e) {
//       if (e.code !== 85) throw e; // 85 = index already exists
//       console.log('✅ rooms.location index already exists');
//     }

//     // Users collection
//     try {
//       await usersCollection.createIndex(
//         { location: '2dsphere' },
//         { name: 'location_2dsphere', background: true }
//       );
//       console.log('✅ users.location index ensured');
//     } catch (e) {
//       if (e.code !== 85) throw e;
//       console.log('✅ users.location index already exists');
//     }

//     console.log('\n🎉 Index fix complete!');
//   } catch (error) {
//     console.error('❌ Error:', error.message);
//   } finally {
//     await mongoose.disconnect();
//     console.log('\n👋 Disconnected from MongoDB');
//     process.exit(0);
//   }
// }

// fixIndexes();

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixIndexes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    // Connection string check: Ensure it has a DB name
    await mongoose.connect(MONGODB_URI, { dbName: 'chugli' });
    console.log('✅ Connected to MongoDB!');

    const db = mongoose.connection.useDb('chugli').db;
    const dbName = mongoose.connection.name;
    console.log(`📦 Using Database: ${dbName}`);

    const collectionsToFix = ['rooms', 'users'];

    for (const colName of collectionsToFix) {
      console.log(`\n--- Checking Collection: ${colName} ---`);

      // 1. Check if collection exists, if not, create it
      const collections = await db.listCollections({ name: colName }).toArray();
      if (collections.length === 0) {
        console.log(`⚠️  ${colName} collection missing. Creating it now...`);
        await db.createCollection(colName);
      }

      const collection = db.collection(colName);

      // 2. Drop duplicate or old 2dsphere indexes
      const indexes = await collection.indexes();
      const geoIndexes = indexes.filter((idx) => Object.values(idx.key).includes('2dsphere'));

      if (geoIndexes.length > 0) {
        console.log(
          `🌍 Found ${geoIndexes.length} existing geo-index(es). Dropping for clean slate...`
        );
        for (const idx of geoIndexes) {
          await collection.dropIndex(idx.name);
          console.log(`   Dropped: ${idx.name}`);
        }
      }

      // 3. Create fresh 2dsphere index
      console.log(`🔨 Creating fresh 2dsphere index on ${colName}.location...`);
      await collection.createIndex(
        { location: '2dsphere' },
        { name: 'location_2dsphere', background: true }
      );
      console.log(`✅ ${colName} index fixed!`);
    }

    console.log('\n🎉 All indexes are healthy and ready!');
  } catch (error) {
    console.error('\n❌ ERROR IN SCRIPT:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixIndexes();
