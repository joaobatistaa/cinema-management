# Cinema Management System

A modern cinema management application with ticket sales, bar management, and admin features.

## Features

- 🎬 Movie ticket booking system
- 🍿 Bar/concessions management
- 🎫 QR code ticket validation
- 📊 Admin dashboard with analytics
- 📧 Automated email ticket delivery
- 📝 Audit logging for all operations

## Technologies

- Next.js (App Router)
- React
- Node.js
- Nodemailer (for email)
- React Hot Toast (notifications)


## Email Configuration

The system uses Nodemailer for sending ticket emails. For development/testing, we recommend using email testing services:

### Using Mailtrap or Imitate Email
1. Create a free account at [Mailtrap.io](https://mailtrap.io) or [Imitate Email](https://imitate.email)
2. Get your SMTP credentials from the Inbox
3. Update `.env` with:
```
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```


## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/cinema-management.git
```

2. Install dependencies
```bash
cd cinema-management
npm install
```

3. Set up environment variables
Create a `.env` file based on `.env.example` and configure email settings

**Note:** The default password for all test accounts in `users.json` is `a12345678*`

4. Run the production server
```bash
npm run build
npm run start
```

5. Run unit tests
```bash
npm run test
```

## Unit Testing

Unit tests are written using Jest and can be found in the `__tests__` directory. To run the tests, use the `npm run test` command.

## Project Structure

```
cinema-management/
├── app/
│   ├── api/           # API routes
│   
├── src/
│   ├── data/          # JSON files
│   ├── services/      # Aux methods
│   └── utils/         # Helper functions
├── public/            # Static assets
└── README.md          # This file
