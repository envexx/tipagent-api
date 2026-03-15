import { copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Ensure dist/db directory exists
mkdirSync(join(__dirname, '../dist/db'), { recursive: true })

// Copy schema.sql to dist
copyFileSync(
  join(__dirname, '../src/db/schema.sql'),
  join(__dirname, '../dist/db/schema.sql')
)

console.log('Schema copied to dist/db/schema.sql')
