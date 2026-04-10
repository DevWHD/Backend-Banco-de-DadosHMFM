const { neon } = require("@neondatabase/serverless");

async function checkDatabase() {
  try {
    const DATABASE_URL = "postgresql://neondb_owner:npg_9Zuheo8UAkFV@ep-floral-king-ai9tjmy4-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    
    if (!DATABASE_URL) {
      console.error("❌ DATABASE_URL not set");
      return;
    }

    const sql = neon(DATABASE_URL);

    // Check folders
    console.log("\n📁 FOLDERS:");
    const folders = await sql`SELECT COUNT(*) as count FROM folders`;
    console.log(`Total folders: ${folders[0].count}`);
    
    const foldersList = await sql`SELECT id, name FROM folders ORDER BY id LIMIT 5`;
    console.log("Sample folders:", foldersList);

    // Check files
    console.log("\n📄 FILES:");
    const files = await sql`SELECT COUNT(*) as count FROM files`;
    console.log(`Total files: ${files[0].count}`);
    
    if (files[0].count > 0) {
      const filesList = await sql`SELECT id, name, blob_url, created_at FROM files ORDER BY id LIMIT 5`;
      console.log("\nFiles detail:");
      filesList.forEach(f => {
        console.log(`  ID: ${f.id}`);
        console.log(`  Name: ${f.name}`);
        console.log(`  Blob URL: ${f.blob_url}`);
        console.log(`  URL Type: ${f.blob_url.startsWith("https://") ? "✅ VERCEL BLOB" : f.blob_url.startsWith("/uploads/") ? "⚠️ FALLBACK (need re-upload)" : "❌ UNKNOWN"}`);
        console.log(`  Created: ${f.created_at}`);
        console.log("");
      });
    } else {
      console.log("⚠️ No files in database. You need to upload files first.");
    }

    console.log("\n✅ Database connection successful!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkDatabase();
