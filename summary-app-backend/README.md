# Summary App Backend

Bu proje, Akıllı İçerik Derleme ve Özetleme PWA'sının backend kısmıdır. NestJS framework kullanılarak geliştirilmiştir.

## Özellikler

- **Kullanıcı Kimlik Doğrulama**: JWT tabanlı authentication
- **AI Özetleme**: Google Vertex AI (Gemini) entegrasyonu
- **MongoDB**: Mongoose ODM ile veri yönetimi
- **RESTful API**: Tam özellikli REST API

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyasını `.env.example`'dan kopyalayarak oluşturun ve gerekli değişkenleri doldurun:
```bash
cp .env.example .env
```

3. Google Cloud hizmet hesabı JSON dosyasını `config/gcp-service-account.json` yoluna yerleştirin.

4. Uygulamayı başlatın:
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/register` - Kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `GET /auth/profile` - Kullanıcı profili
- `PATCH /auth/interests` - İlgi alanlarını güncelleme

### AI
- `POST /ai/summarize` - Metin özetleme (Authentication gerekli)
- `GET /ai/test` - VertexAI bağlantı testi

## Dosya Yapısı

```
src/
├── auth/                 # Kimlik doğrulama modülü
│   ├── strategies/       # Passport stratejileri
│   ├── guards/          # Authentication guards
│   └── ...
├── users/               # Kullanıcı modülü
│   ├── schemas/         # Mongoose şemaları
│   ├── dto/            # Data Transfer Objects
│   └── ...
├── ai/                  # AI modülü
│   ├── dto/            # AI DTO'ları
│   └── ...
├── content/             # İçerik modülü (gelecek)
│   └── schemas/         # İçerik şemaları
└── ...
```

## Ortam Değişkenleri

Gerekli ortam değişkenleri `.env.example` dosyasında listelenmiştir:

- `MONGODB_URI`: MongoDB Atlas bağlantı string'i
- `JWT_SECRET`: JWT için secret key
- `GOOGLE_APPLICATION_CREDENTIALS`: GCP service account JSON yolu
- `GOOGLE_CLOUD_PROJECT_ID`: Google Cloud proje ID'si

## Geliştirme Notları

- Tüm API endpoint'leri validation pipe ile doğrulanır
- CORS frontend için etkinleştirilmiştir
- MongoDB ile automatic timestamps kullanılır
- Şifreler bcrypt ile hash'lenir

## Test

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```