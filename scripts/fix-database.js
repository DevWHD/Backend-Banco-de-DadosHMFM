const { neon } = require("@neondatabase/serverless");

async function fixDatabase() {
  try {
    const DATABASE_URL = "postgresql://neondb_owner:npg_9Zuheo8UAkFV@ep-floral-king-ai9tjmy4-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    
    const sql = neon(DATABASE_URL);

    // Check if file_data column exists
    console.log("Checking if file_data column exists...");
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'files' AND column_name = 'file_data'
    `;

    if (columnCheck.length === 0) {
      console.log("❌ file_data column not found. Adding it...");
      
      // Add file_data column
      await sql`
        ALTER TABLE files ADD COLUMN file_data BYTEA
      `;
      
      console.log("✅ file_data column added successfully!");
    } else {
      console.log("✅ file_data column already exists!");
    }

    // List all columns
    console.log("\n📋 Current columns in files table:");
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'files'
      ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
    });

    console.log("\n✅ Database ready for file storage!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixDatabase();
