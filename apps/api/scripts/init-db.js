import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../data/tipagent.db')
const schemaPath = join(__dirname, '../src/db/schema.sql')

console.log(`Initializing database at: ${dbPath}`)

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

const schema = readFileSync(schemaPath, 'utf-8')
db.exec(schema)

console.log('Database initialized successfully!')
db.close()
