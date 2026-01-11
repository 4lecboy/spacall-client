# Spacall Client - Modular Architecture Guide

## Overview
The HomeScreen has been refactored into a modular, scalable architecture following React best practices. This document outlines the new structure, responsibilities, and guidelines.

---

## Architecture Layers

### 1. **Hooks Layer** (`hooks/`)
Custom hooks that encapsulate business logic and side effects.

#### `useServices()`
- **Responsibility**: Fetch and manage services list
- **Returns**: 
  - `services`: Service[]
  - `loading`: boolean
  - `error`: Error | null
  - `refetch`: () => Promise<void>
- **Features**:
  - Automatic fetching on mount
  - Error handling and logging
  - Refetch capability for pull-to-refresh
- **Location**: [hooks/useServices.ts](./hooks/useServices.ts)

#### `useAuthSession()`
- **Responsibility**: Manage authentication state and session
- **Returns**:
  - `session`: Session | null
  - `loading`: boolean
  - `signOut`: () => Promise<void>
- **Features**:
  - Real-time auth state listening
  - Session persistence
  - Automatic cleanup on unmount
- **Location**: [hooks/useAuthSession.ts](./hooks/useAuthSession.ts)

#### `useActiveBooking(session: Session | null)`
- **Responsibility**: Fetch and subscribe to active booking updates
- **Returns**:
  - `activeBooking`: Booking | null
  - `loading`: boolean
  - `error`: Error | null
- **Features**:
  - Realtime Supabase subscriptions
  - Automatic status tracking (PENDING, ACCEPTED, ON_WAY, COMPLETED)
  - Subscription cleanup on unmount
  - User-friendly notifications
- **Location**: [hooks/useActiveBooking.ts](./hooks/useActiveBooking.ts)

---

### 2. **Component Layer** (`components/`)
Presentational components with minimal logic, focused on UI rendering.

#### `ServiceCard`
- **Props**: 
  - `service: Service`
  - `onPress: (service: Service) => void`
- **Features**:
  - Memoized to prevent unnecessary re-renders
  - Displays service image placeholder, name, duration, category, price
  - Tap-to-view detail
- **Location**: [components/ServiceCard.tsx](./components/ServiceCard.tsx)

#### `ServicesGrid`
- **Props**:
  - `services: Service[]`
  - `loading?: boolean`
  - `error?: Error | null`
  - `onServicePress: (service: Service) => void`
  - `onRefresh?: () => void`
- **Features**:
  - 2-column grid layout
  - Loading state with spinner
  - Error state with retry button
  - Empty state messaging
  - Pull-to-refresh support
- **Location**: [components/ServicesGrid.tsx](./components/ServicesGrid.tsx)

#### `FooterAuth`
- **Props**:
  - `visible: boolean`
  - `onLoginPress: () => void`
- **Features**:
  - Sticky footer for guest users
  - Platform-aware padding (iOS bottom safe area)
  - Clear CTA messaging
- **Location**: [components/FooterAuth.tsx](./components/FooterAuth.tsx)

---

### 3. **Screen Layer** (`screens/`)
Container components that orchestrate hooks and components.

#### `HomeScreen`
- **Responsibility**: Main orchestrator combining all hooks and components
- **State Management**:
  - `selectedService`: Service | null
  - `modalVisible`: boolean
  - `authModalVisible`: boolean
- **Hooks Used**:
  - `useServices()`
  - `useAuthSession()`
  - `useActiveBooking()`
- **Features**:
  - Service discovery and browsing
  - Active booking display with realtime updates
  - Authentication flow integration
  - Checkout navigation
- **Location**: [screens/HomeScreen.tsx](./screens/HomeScreen.tsx)

---

## Data Flow

```
┌─────────────────────────────────────────┐
│         HomeScreen                      │
│         (Container)                     │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Hooks (Business Logic)           │   │
│  │ • useServices()                  │   │
│  │ • useAuthSession()               │   │
│  │ • useActiveBooking()             │   │
│  └──────────────────────────────────┘   │
│           ↓ (passes props)               │
│  ┌──────────────────────────────────┐   │
│  │ Components (UI)                  │   │
│  │ • ServicesGrid                   │   │
│  │  ├─ ServiceCard (x2 cols)        │   │
│  │ • FooterAuth                     │   │
│  │ • ActiveBookingCard              │   │
│  │ • Modals                         │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Usage Example

```typescript
// HomeScreen orchestrates everything
export default function HomeScreen({ onNavigateToCheckout }: Props) {
  // 1. Fetch data with hooks
  const { services, loading, error, refetch } = useServices();
  const { session, signOut } = useAuthSession();
  const { activeBooking } = useActiveBooking(session);

  // 2. Define handlers
  const handleServicePress = useCallback((service: Service) => {
    setSelectedService(service);
    setModalVisible(true);
  }, []);

  // 3. Render with components
  return (
    <ScreenWrapper>
      <ServicesGrid
        services={services}
        loading={loading}
        error={error}
        onServicePress={handleServicePress}
        onRefresh={refetch}
      />
      <FooterAuth visible={!session} onLoginPress={handleAuth} />
    </ScreenWrapper>
  );
}
```

---

## Best Practices Applied

### ✅ Separation of Concerns
- Hooks handle logic (fetching, state, side effects)
- Components handle UI (rendering, user interactions)
- Screens handle orchestration (wiring hooks + components)

### ✅ Reusability
- Hooks can be used across multiple screens
- Components are independent and composable
- No hard dependencies between modules

### ✅ Testability
- Hooks can be tested in isolation with @testing-library/react-hooks
- Components can be snapshot tested
- Mocked hooks for integration testing

### ✅ Performance
- Memoized components prevent unnecessary re-renders
- useCallback for event handlers
- Proper cleanup in useEffect

### ✅ Maintainability
- Clear file structure and naming
- Comprehensive JSDoc comments
- Type safety with TypeScript interfaces

### ✅ Scalability
- Easy to add new hooks (e.g., `useNotifications`, `usePayment`)
- Easy to add new components (e.g., `BookingHistory`, `ReviewCard`)
- Easy to split into separate screens

---

## Future Enhancements

### Recommended Next Steps
1. **Add Context API** for global state (auth, theme)
2. **Implement Redux** or **Zustand** for complex state
3. **Create custom error boundary** for error handling
4. **Add analytics hooks** for tracking user behavior
5. **Create reusable modal components** (base modal wrapper)
6. **Add Storybook** for component documentation

### Potential New Hooks
- `useNotifications()` - Handle push notifications
- `usePayment()` - Process payments
- `useLocation()` - Track therapist location
- `useReviews()` - Fetch and manage reviews

### Potential New Components
- `BookingHistoryCard` - Show past bookings
- `TherapistCard` - Display therapist profile
- `ReviewCard` - Display service reviews
- `PaymentMethodSelector` - Select payment method

---

## File Structure

```
spacall-client/
├── hooks/
│   ├── index.ts
│   ├── useServices.ts
│   ├── useAuthSession.ts
│   └── useActiveBooking.ts
├── components/
│   ├── ServiceCard.tsx
│   ├── ServicesGrid.tsx
│   ├── FooterAuth.tsx
│   ├── [other components...]
├── screens/
│   ├── HomeScreen.tsx
│   ├── CheckoutScreen.tsx
│   └── [other screens...]
├── types/
│   └── index.ts
├── lib/
│   ├── api.ts
│   └── supabase.ts
└── constants/
    └── theme.ts
```

---

## Migration Notes

### What Changed
- Removed inline useEffect and API calls from HomeScreen
- Extracted business logic into custom hooks
- Extracted UI components into separate files
- Improved error handling and logging

### What Stayed the Same
- All functionality works identically
- Modal behaviors unchanged
- Realtime booking updates still work
- Authentication flow preserved

### No Breaking Changes
- All props and interfaces maintain backward compatibility
- Navigation flow unchanged
- Data structures identical

---

## Contributing Guidelines

When adding new features:

1. **Create a hook** for data fetching or state management
2. **Create a component** for UI rendering
3. **Use the component** in the screen, passing data via props
4. **Avoid business logic** in components
5. **Avoid UI code** in hooks
6. **Test hooks independently** from components
7. **Document with JSDoc** comments

---

## Performance Considerations

### Optimization Techniques Used
- `React.memo()` on ServiceCard
- `useCallback()` for event handlers
- Proper dependency arrays in useEffect
- Subscription cleanup in useActiveBooking

### Potential Improvements
- Implement virtualization for very large service lists
- Add caching layer for services (React Query)
- Optimize image loading with lazy loading
- Consider pagination instead of loading all services

---

## Questions & Support

For questions about the architecture or implementation, refer to:
- Individual file JSDoc comments
- This architecture guide
- React documentation on hooks and components
- Supabase realtime documentation
