# Summary App Frontend

Bu proje, Akıllı İçerik Derleme ve Özetleme PWA'sının frontend kısmıdır. React + TypeScript + Vite kullanılarak geliştirilmiştir.

## Özellikler

- ⚡ **Vite**: Hızlı geliştirme ortamı
- ⚛️ **React 18**: Modern React hooks ve özellikler
- 🎨 **Tailwind CSS**: Utility-first CSS framework
- 🗺️ **React Router**: SPA routing
- 🐻 **Zustand**: Lightweight state management
- 📡 **Axios**: HTTP client
- 🔒 **Authentication**: JWT tabanlı kimlik doğrulama
- 📱 **Responsive**: Mobil uyumlu tasarım

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Backend URL'sini `.env` dosyasında kontrol edin:
```env
VITE_API_BASE_URL=http://localhost:3000
```

3. Uygulamayı başlatın:
```bash
npm run dev
```

## Test için Çalıştırma

1. Backend'in çalıştığından emin olun (http://localhost:3000)
2. Frontend'i başlatın: `npm run dev`
3. Browser'da http://localhost:5173 adresine gidin

## Mevcut Sayfalar

- **Login** (/login): Kullanıcı girişi
- **Register** (/register): Kullanıcı kaydı  
- **Interests** (/interests): İlgi alanları seçimi
- **Home** (/): Ana sayfa (authentication gerekli)

## API Entegrasyonu Durumu

✅ **Hazır Endpoint'ler:**
- POST /auth/login
- POST /auth/register  
- GET /auth/profile
- PATCH /auth/interests

Frontend bu endpoint'leri kullanmaya hazır durumdadır.