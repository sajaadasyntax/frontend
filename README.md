# Mayan Shop - Frontend

Next.js frontend for the Mayan Shop e-commerce platform with Arabic/English support.

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Internationalization**: next-intl
- **Notifications**: react-hot-toast

## Getting Started

### Prerequisites

- Node.js 18+
- Express backend running (see `../backend`)

### Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   Create `.env.local` (optional - defaults to `https://api.enabholding.com/api`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   Frontend runs at `http://localhost:3000`

## Project Structure

```
frontend/
├── app/
│   ├── admin/           # Admin panel pages
│   ├── auth/            # Login/Register pages
│   ├── cart/            # Shopping cart
│   ├── invoices/        # Invoice pages
│   ├── messages/        # Messaging
│   ├── payment/         # Payment pages
│   ├── products/        # Product details
│   ├── profile/         # User profile
│   └── support/         # Support & bank info
├── components/          # Reusable components
├── lib/                 # Utilities (API client)
├── messages/            # i18n translations (en, ar)
├── public/              # Static assets
└── store/               # Zustand stores
```

## Features

### Customer Features
- 🛒 Shopping Cart with local storage persistence
- 📦 Product Catalog by category
- 💳 Bank transfer payment with file upload
- 🧾 Invoice history and details
- 💬 Internal messaging
- 👤 User profile management
- 🏦 Bank account information
- 🎫 Coupon code support
- 🌐 Arabic/English interface with RTL support

### Admin Features
- 📊 Dashboard with stats
- 📦 Inventory management
- 🧾 Order management
- 📢 Broadcast messaging
- ⭐ Loyalty points
- 🎫 Discount codes
- 📈 Reports

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.enabholding.com/api` |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## API Integration

The frontend communicates with the Express backend through the API client in `lib/api.ts`. All API calls include JWT token for authenticated routes.

## Localization

- English: `messages/en.json`
- Arabic: `messages/ar.json`

Toggle language using the button in the header. Arabic mode includes RTL support.
