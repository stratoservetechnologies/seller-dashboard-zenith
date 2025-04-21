# Seller Dashboard - Zenith

A modern seller dashboard built with React and Firebase, featuring real-time analytics, order management, and product inventory tracking.

## Features

- 🔐 Authentication with Email/Password and Google Sign-In
- 📦 Product Management (CRUD operations)
- 📊 Real-time Analytics Dashboard
- 🛍️ Order Management and Tracking
- 📈 Sales and Revenue Analytics
- 📱 Responsive Design

## Tech Stack

- React + TypeScript
- Firebase (Authentication, Firestore)
- Vite
- Tailwind CSS
- date-fns for date manipulation
- React Query for data fetching

## Setup Instructions

1. Clone the repository:
```bash
git clone [repository-url]
cd seller-dashboard-zenith
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project:
- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project
- Enable Authentication (Email/Password and Google Sign-in)
- Create a Firestore database
- Get your Firebase configuration

4. Set up environment variables:
```bash
cp .env.example .env
```
- Fill in your Firebase configuration values in the `.env` file

5. Start the development server:
```bash
npm run dev
```

## Firebase Data Structure

```
sellers/
  {sellerId}/
    profile/
      storeName: string
      storeLocation: string
      phoneNumber: string
      email: string
    
    products/
      {productId}/
        name: string
        price: number
        quantity: number
        imageURL: string
        createdAt: timestamp
        updatedAt: timestamp
    
    orders/
      {orderId}/
        customerName: string
        customerEmail: string
        products: array
        totalAmount: number
        status: string
        createdAt: timestamp
        updatedAt: timestamp
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
