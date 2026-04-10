const { neon } = require("@neondatabase/serverless");

async function checkFiles() {
  try {
    const DATABASE_URL = "postgresql://neondb_owner:npg_9Zuheo8UAkFV@ep-floral-king-ai9tjmy4-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    const sql = neon(DATABASE_URL);

    const files = await sql`SELECT id, name, blob_url, size, mime_type FROM files ORDER BY id DESC LIMIT 5`;
    
    console.log("Últimos 5 arquivos no banco:");
    files.forEach(f => {
      console.log(`  ID: ${f.id}`);
      console.log(`  Name: ${f.name}`);
      console.log(`  Blob URL: ${f.blob_url}`);
      console.log(`  Size: ${f.size}`);
      console.log(`  MIME: ${f.mime_type}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkFiles();
