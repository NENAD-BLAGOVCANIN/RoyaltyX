# RoyaltyX - Content & Royalty Management Platform

## 🎯 What is RoyaltyX?

RoyaltyX is a comprehensive content and royalty management platform designed to empower content creators, artists, and digital entrepreneurs. Our platform helps you track, manage, and optimize your revenue streams across multiple channels while providing powerful analytics and insights to grow your business.

### 🚀 Why RoyaltyX?

In today's digital economy, content creators face the challenge of managing revenue from multiple sources - streaming platforms, social media, licensing deals, and direct sales. RoyaltyX solves this by providing:

- **Centralized Revenue Tracking**: Monitor all your income streams in one place
- **Advanced Analytics**: Understand your performance with detailed insights and trends
- **Content Management**: Organize and track your digital assets efficiently
- **Subscription Management**: Flexible pricing plans that grow with your business
- **Multi-Platform Integration**: Connect with major platforms and services
- **Professional Reporting**: Generate detailed reports for tax purposes and business planning

### 🎨 Perfect For:

- **Musicians & Artists**: Track streaming royalties, licensing fees, and merchandise sales
- **Content Creators**: Monitor YouTube, TikTok, and social media revenue
- **Digital Entrepreneurs**: Manage multiple revenue streams and business metrics
- **Small Agencies**: Handle client content and revenue tracking
- **Freelancers**: Track project income and business performance

---

## 🏗️ Technical Architecture

RoyaltyX is built with modern, scalable technologies:

### Backend
- **Django 5.0.6** - Robust Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Reliable database system
- **Redis** - Caching and session management
- **Celery** - Background task processing
- **Stripe Integration** - Secure payment processing

### Frontend
- **React 18** - Modern JavaScript framework
- **Material-UI** - Professional component library
- **React Router** - Client-side routing
- **Context API** - State management

### Infrastructure
- **Docker** - Containerized deployment
- **Nginx** - Web server and reverse proxy
- **SSL/HTTPS** - Secure communications
- **RESTful APIs** - Clean, documented endpoints

---

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- Node.js 16+ (for local development)
- Python 3.11+ (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NENAD-BLAGOVCANIN/RoyaltyX.git
   cd RoyaltyX
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   # Development environment
   docker-compose -f local.yml up --build
   
   # Production environment
   docker-compose -f production.yml up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs/

### Initial Setup

1. **Create a superuser**
   ```bash
   docker-compose -f local.yml exec backend python manage.py createsuperuser
   ```

2. **Run database migrations**
   ```bash
   docker-compose -f local.yml exec backend python manage.py migrate
   ```

3. **Load initial data (optional)**
   ```bash
   docker-compose -f local.yml exec backend python manage.py loaddata initial_data.json
   ```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database Configuration
POSTGRES_HOST=postgres
POSTGRES_DB=royaltyx
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432

# Django Configuration
DJANGO_SECRET_KEY=your_secret_key_here

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_URL=http://localhost:3000

# Stripe Payment Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Redis Configuration
CELERY_BROKER_URL=redis://redis:6379/0
```

### Stripe Setup (For Payments)

1. Create a Stripe account at https://stripe.com
2. Create products for Basic ($19.99/month) and Premium ($49.99/month) plans
3. Copy the price IDs to your environment variables
4. Set up webhook endpoint: `https://yourdomain.com/payments/stripe-webhook/`
5. Subscribe to these webhook events:
   - `checkout.session.completed`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`

---

## 📊 Features

### 🔐 Authentication & User Management
- Secure user registration and login
- JWT-based authentication
- OAuth integration (Google, TikTok)
- User profile management
- Role-based access control

### 💳 Subscription Management
- **Free Plan**: Basic features for getting started
- **Basic Plan** ($19.99/month): Advanced features for growing creators
- **Premium Plan** ($49.99/month): Full feature set for professionals
- Stripe-powered payment processing
- Automatic billing and subscription management
- Grace period handling for failed payments

### 📈 Analytics & Reporting
- Revenue tracking and analytics
- Performance metrics and trends
- Custom report generation
- Data export capabilities
- Real-time dashboard updates

### 🎵 Content Management
- Digital asset organization
- Content upload and management
- Search and filtering capabilities
- Metadata management
- Version control

### 🔗 Platform Integrations
- Multi-platform revenue tracking
- API integrations with major services
- Data synchronization
- Automated reporting

### 📱 User Experience
- Responsive design for all devices
- Intuitive dashboard interface
- Real-time notifications
- Dark/light theme support
- Comprehensive settings management

---

## 🛠️ Development

### Local Development Setup

1. **Backend Development**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py runserver
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Running Tests

```bash
# Backend tests
docker-compose -f local.yml exec backend python manage.py test

# Frontend tests
docker-compose -f local.yml exec frontend npm test
```

### API Documentation

- **Swagger UI**: http://localhost:8000/docs/
- **API Schema**: http://localhost:8000/schema/

---

## 📁 Project Structure

```
RoyaltyX/
├── backend/                 # Django backend
│   ├── apps/               # Django applications
│   │   ├── authentication/ # User authentication
│   │   ├── user/           # User management
│   │   ├── payments/       # Stripe payment integration
│   │   ├── analytics/      # Analytics and reporting
│   │   ├── sources/        # Revenue source management
│   │   └── ...
│   ├── royaltyx/           # Django project settings
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── components/     # Reusable components
│   │   └── ...
│   └── package.json        # Node.js dependencies
├── nginx/                  # Nginx configuration
├── docker-compose files    # Docker orchestration
└── documentation/          # Project documentation
```

---

## 🚀 Deployment

### Production Deployment

1. **Set up production environment**
   ```bash
   cp .env.example .env.production
   # Configure production settings
   ```

2. **Deploy with Docker**
   ```bash
   docker-compose -f production.yml up -d --build
   ```

3. **Set up SSL certificate**
   ```bash
   # Using Let's Encrypt
   docker-compose -f production.yml exec nginx certbot --nginx
   ```

### Environment-Specific Configurations

- **Development**: `local.yml` - Hot reloading, debug mode
- **Production**: `production.yml` - Optimized builds, SSL, caching

---

## 🤝 Contributing

We welcome contributions to RoyaltyX! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript code
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation**: Check our comprehensive docs
- **Issues**: Report bugs on GitHub Issues
- **Email**: support@royaltyx.com
- **Community**: Join our Discord server

---

## 🙏 Acknowledgments

- Built with Django and React
- Payment processing by Stripe
- UI components by Material-UI
- Containerization with Docker
- Analytics powered by custom algorithms

---

**Ready to take control of your content revenue? Get started with RoyaltyX today!** 🚀
