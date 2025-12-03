/**
 * .env Dosyası Kurulum Script'i
 * Bu script .env.example dosyasını .env olarak kopyalar
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envExamplePath = join(__dirname, '.env.example');
const envPath = join(__dirname, '.env');

try {
  if (existsSync(envPath)) {
    console.log('✅ .env dosyası zaten mevcut!');
    process.exit(0);
  }

  if (!existsSync(envExamplePath)) {
    console.error('❌ .env.example dosyası bulunamadı!');
    process.exit(1);
  }

  const content = readFileSync(envExamplePath, 'utf-8');
  writeFileSync(envPath, content, 'utf-8');
  
  console.log('✅ .env dosyası oluşturuldu!');
  console.log('⚠️  Şimdi .env dosyasını açıp YOUR_PASSWORD_HERE kısmını MongoDB şifrenle değiştir!');
} catch (error) {
  console.error('❌ Hata:', error.message);
  process.exit(1);
}

