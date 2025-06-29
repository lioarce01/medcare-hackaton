# Technical Documentation

## Architecture Overview

### Frontend Architecture

The frontend is built using React with TypeScript and follows a component-based architecture. Key architectural decisions include:

1. **State Management**
   - React Query for server state
   - Local state for component-specific data
   - Context API for global state (auth, theme)

2. **Routing**
   - React Router v6 for navigation
   - Protected routes with authentication checks
   - Premium feature guards
   - Lazy loading for code splitting

3. **Styling**
   - Tailwind CSS for utility-first styling
   - Shadcn/ui component library
   - Custom components for reusability
   - Responsive design patterns
   - Dark/light theme support

4. **Performance Optimizations**
   - Code splitting with dynamic imports
   - Bundle size optimization
   - Image optimization
   - Caching strategies
   - Progressive Web App (PWA) capabilities

### Backend Architecture

The backend follows a Clean Architecture pattern with NestJS:

1. **Controllers Layer (Interfaces)**
   - Request validation with DTOs
   - Response formatting
   - Error handling with custom filters
   - JWT authentication guards
   - Subscription guards for premium features

2. **Application Layer (Use Cases)**
   - Business logic orchestration
   - Command/Query separation
   - Transaction management
   - Domain event handling

3. **Domain Layer**
   - Entity definitions
   - Domain services
   - Value objects
   - Repository interfaces
   - Domain exceptions

4. **Infrastructure Layer**
   - Repository implementations
   - External service integrations
   - Database connections
   - Payment provider integrations

## Payment Integration Architecture

### Payment Provider Interface

```typescript
interface PaymentProvider {
  createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse>;
  handleWebhook(payload: any, signature?: string): Promise<WebhookResult>;
  getPaymentDetails(paymentId: string): Promise<PaymentDetails>;
  verifySession?(sessionId: string): Promise<WebhookResult>;
}
```

### Supported Payment Providers

#### Stripe Integration
- **Global payment processing**
- **Features:**
  - Credit/debit card payments
  - Subscription management
  - Webhook handling
  - Session verification
  - Automatic billing

```typescript
// Stripe checkout session creation
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
  client_reference_id: userId,
  metadata: { userId }
});
```

#### MercadoPago Integration
- **Latin America focused**
- **Features:**
  - Multiple payment methods
  - Local currency support
  - Webhook handling
  - Success redirect handling

### Webhook Processing

```typescript
// Webhook event handling
switch (event.type) {
  case 'checkout.session.completed':
    return await handleCheckoutSessionCompleted(event.data.object);
  case 'customer.subscription.created':
    return await handleSubscriptionCreated(event.data.object);
  case 'customer.subscription.updated':
    return await handleSubscriptionUpdated(event.data.object);
  case 'invoice.payment_succeeded':
    return await handleInvoicePaymentSucceeded(event.data.object);
}
```

## Subscription System

### Subscription Entity

```typescript
export class Subscription {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public status: SubscriptionStatus,
    public plan: SubscriptionPlan,
    public expiresAt: Date | null,
    public features: SubscriptionFeatures,
    public paymentProviderId?: string | null,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}

export class SubscriptionFeatures {
  constructor(
    public advanced_analytics: boolean = false,
    public data_export: boolean = false,
    public custom_reminders: boolean = false,
    public risk_predictions: boolean = false,
  ) {}
}
```

### Subscription Management

```typescript
// Premium subscription creation
createPremiumSubscription(userId: string, paymentProviderId?: string, months: number = 1): Subscription {
  const expiresAt = this.calculateExpirationDate(months);
  return new Subscription(
    '', userId, SubscriptionStatus.PREMIUM, SubscriptionPlan.PREMIUM,
    expiresAt, SubscriptionFeatures.createPremiumFeatures(), paymentProviderId
  );
}
```

## API Documentation

### Authentication

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }
}
```

### Subscription Endpoints

```typescript
// Create checkout session
POST /subscriptions/create-checkout-session
{
  priceId: string,
  paymentProvider: "stripe" | "mercadopago",
  currency: string,
  email: string
}

// Verify session (Stripe)
POST /subscriptions/verify-session
{
  sessionId: string
}

// Get subscription status
GET /subscriptions/status

// Webhook handlers
POST /subscriptions/webhooks/stripe
POST /subscriptions/mercadopago/webhook
```

### Analytics Endpoints

```typescript
// Risk prediction
POST /analytics/risk-prediction
{
  userId: string,
  medicationId: string,
  historicalData: AdherenceRecord[]
}

// Daily risk scores
GET /analytics/daily-risk-scores

// Risk history
GET /analytics/risk-history/:medicationId
```

## Database Schema

### Updated Users Table

```sql
-- Enhanced users table with subscription fields
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  subscription_status text default 'free',
  subscription_plan text default 'free',
  subscription_expires_at timestamp with time zone,
  subscription_features jsonb default '{"advanced_analytics": false, "data_export": false, "custom_reminders": false, "risk_predictions": false}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Analytics Tables

```sql
-- Risk history table
create table public.risk_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  medication_id uuid references public.medications(id) on delete cascade,
  risk_score decimal(3,2) not null,
  factors jsonb,
  predicted_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Daily adherence generation
create table public.daily_adherence (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  medication_id uuid references public.medications(id) on delete cascade,
  scheduled_date date not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Reminders Table

```sql
-- Enhanced reminders table
create table public.reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  medication_id uuid references public.medications(id) on delete cascade,
  time time not null,
  days_of_week integer[],
  is_active boolean default true,
  notification_type text default 'email',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Real-time Features

### Supabase Realtime

```typescript
// Real-time adherence updates
const adherenceChannel = supabase
  .channel('adherence-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'adherence',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle real-time updates
  })
  .subscribe();
```

## Scheduler System

### Daily Adherence Generation

```typescript
@Injectable()
export class AppSchedulerService {
  @Cron('0 0 * * *') // Daily at midnight
  async generateDailyAdherence() {
    // Generate adherence records for all active medications
  }
}
```

## Notification System

### Email Notifications

```typescript
@Injectable()
export class SendGridNotificationService {
  async sendReminderEmail(user: User, medication: Medication, reminder: Reminder) {
    // Send personalized reminder emails
  }
}
```

## Security Measures

### Enhanced Authentication

1. **JWT Authentication**
   - Bearer token strategy
   - Token expiration handling
   - Refresh token mechanism

2. **Authorization**
   - Row Level Security (RLS)
   - Premium feature guards
   - Resource ownership validation
   - API endpoint protection

3. **Payment Security**
   - Webhook signature verification
   - Session verification
   - Secure payment processing
   - PCI compliance

4. **Data Protection**
   - Input validation with class-validator
   - SQL injection prevention
   - XSS protection
   - CSRF protection
   - Data encryption at rest

## Performance Optimizations

### Backend Optimizations

1. **Database**
   - Connection pooling
   - Query optimization
   - Indexing strategies
   - Caching with Redis (planned)

2. **API Performance**
   - Response compression
   - Pagination
   - Rate limiting
   - Caching headers

### Frontend Optimizations

1. **Bundle Optimization**
   - Tree shaking
   - Code splitting
   - Dynamic imports
   - Bundle analysis

2. **Runtime Performance**
   - React.memo for components
   - useMemo and useCallback hooks
   - Virtual scrolling for large lists
   - Image lazy loading

## Testing Strategy

### Backend Testing

```typescript
// Unit tests for use cases
describe('UpdateSubscriptionStatusUseCase', () => {
  it('should upgrade user to premium', async () => {
    // Test implementation
  });
});

// Integration tests for controllers
describe('SubscriptionController', () => {
  it('should create checkout session', async () => {
    // Test implementation
  });
});
```

### Frontend Testing

```typescript
// Component testing
describe('SubscriptionManager', () => {
  it('should handle payment provider selection', () => {
    // Test implementation
  });
});
```

## Deployment Architecture

### Environment Configuration

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-jwt-secret
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Payment Providers
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-token

# Email
SENDGRID_API_KEY=your-sendgrid-key

# Application
FRONTEND_URL=http://localhost:5173
NODE_ENV=production
```

### CI/CD Pipeline

1. **Build Process**
   - TypeScript compilation
   - Bundle optimization
   - Environment-specific builds

2. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

3. **Deployment**
   - Automated deployment
   - Blue-green deployment
   - Rollback capabilities

## Monitoring and Observability

### Application Monitoring

1. **Error Tracking**
   - Structured logging
   - Error aggregation
   - Performance monitoring

2. **Business Metrics**
   - Subscription conversion rates
   - Payment success rates
   - User engagement metrics

3. **Infrastructure Monitoring**
   - Server health checks
   - Database performance
   - API response times

## Data Export System

### PDF Generation

```typescript
// PDF export service
@Injectable()
export class PDFExportService {
  async generateUserDataPDF(userId: string): Promise<Buffer> {
    // Generate comprehensive PDF report
  }
}
```

## Risk Prediction System

### AI/ML Integration

```typescript
// Risk prediction service
@Injectable()
export class RiskPredictionService {
  async calculateRiskScore(userId: string, medicationId: string): Promise<number> {
    // Analyze historical data and predict adherence risk
  }
}
```

## Maintenance and Operations

### Database Maintenance

1. **Backups**
   - Automated daily backups
   - Point-in-time recovery
   - Cross-region replication

2. **Performance**
   - Query optimization
   - Index maintenance
   - Vacuum operations

### Application Maintenance

1. **Updates**
   - Dependency updates
   - Security patches
   - Feature releases

2. **Monitoring**
   - Health checks
   - Performance alerts
   - Error tracking

---

*This documentation is continuously updated as new features are implemented.*
