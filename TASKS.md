# Spacall Implementation Tasks

##  Phase 1: Database & Backend Setup
- [ ] **Create Services Table**
    - [ ] Create `services` table in Supabase SQL Editor.
    - [ ] Add columns: `name`, `price`, `duration`, `description`, `category`.
    - [ ] Insert dummy data (Swedish, Shiatsu, Thai).
- [ ] **Update RLS Policies**
    - [ ] Enable `SELECT` on `services` table for `anon` (public) users.
    - [ ] Ensure `profiles` table allows `INSERT` for new users during Auth.

## Phase 2: Design System Integration
- [ ] **Theme Setup**
    - [ ] Verify `constants/theme.ts` exists with Gilded Ivory colors.
    - [ ] Load Custom Fonts (optional: setup `expo-font` for a Serif font like Playfair Display).
- [ ] **Global Components**
    - [ ] Build `<ScreenWrapper>` component (handles Safe Area + Cream Background).
    - [ ] Build `<GoldButton>` component (Standardized Primary Button).
    - [ ] Build `<ServiceCard>` component (Image, Title, Price, Description).

## Phase 3: "Guest Mode" Home Screen
- [ ] **Refactor Navigation**
    - [ ] Change `App.tsx`: Initial route should be `Home` (not Auth).
    - [ ] Wrap the `Auth` component in a Modal or Bottom Sheet.
- [ ] **Build Home UI**
    - [ ] Header: "Good [Morning/Evening], Relaxation awaits."
    - [ ] Location Bar: "Current Location: [GPS City]" (Mocked or Real).
    - [ ] Service List: Fetch data from Supabase `services` table.
- [ ] **Service Detail Modal**
    - [ ] Create a modal that opens when a service is tapped.
    - [ ] Show full description and "Book Now" button.

## Phase 4: "Just-in-Time" Authentication
- [ ] **Build Auth Modal UI**
    - [ ] Design "Login / Sign Up" Bottom Sheet.
    - [ ] Input Field: Mobile Number (formatted `+63`).
    - [ ] Buttons: "Continue" and "Social Icons" (Google/FB).
- [ ] **Implement Logic**
    - [ ] Connect "Book Now" button: If `!session`, open Auth Modal.
    - [ ] Supabase Auth: Implement `signInWithOtp` (Mobile) logic.
    - [ ] **Note:** For prototype, stick to Email/Pass or Mock Auth if SMS OTP costs money.

## Phase 5: Checkout & Booking
- [ ] **Checkout Screen**
    - [ ] Show Map Snapshot (Static).
    - [ ] Show Payment Method selector (Cash / GCash).
    - [ ] Show Total Price.
- [ ] **Booking Logic**
    - [ ] Ensure `bookings` table insert includes the correct `service_id`.
    - [ ] Test the full flow: Guest -> Select Service -> Login -> Book -> Success.

## Phase 6: Polish
- [ ] Add Loading Skeletons for the Service List.
- [ ] Add "Toast" notifications for Success/Error messages.
- [ ] Verify "Gilded Ivory" colors check out on Dark Mode (or force Light Mode).