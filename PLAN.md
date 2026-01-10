# Spacall Client App - Implementation Plan

## 🎯 Objective
Refactor the Client App to support a "Guest Mode" (Browse First) experience and implement a "Mobile-First" Authentication flow with Social fallbacks, using the "Gilded Ivory" design system.

## 🏗️ Architecture Overview

### 1. The "Guest Mode" (Pre-Auth)
**Concept:** The app should be fully usable (browsing services, viewing prices) without a session.
* **Route Change:** The "Home Screen" replaces "Auth Screen" as the initial route.
* **API Security:** The `services` table in Supabase must have a `SELECT` policy for `anon` (public) role.

### 2. The Auth Flow (Just-in-Time)
**Concept:** Authentication is only triggered when the user commits to an action (e.g., clicks "Book Now" or "Profile").
* **Primary Method:** Mobile Number (SMS OTP).
* **Secondary Methods:** Google/Apple/Facebook.
* **Data Integrity:** If using Social Login, we must enforce a "Verify Phone Number" step immediately after to ensure the therapist can contact the client.

### 3. Design System ("Gilded Ivory")
* **Background:** Warm Cream (`#FAFAF9`)
* **Primary:** Metallic Gold (`#C5A059`)
* **Text:** Deep Charcoal (`#2B2A29`)
* **Font:** Serif for Headings, Sans-serif for Body.

---

## 🔄 User Flow Diagrams

### A. App Launch
`Splash` -> `Guest Home (Service Feed)`

### B. Booking Flow (Unauthenticated)
1.  User taps Service Card (e.g., "Swedish Massage").
2.  User taps "Book Now".
3.  **Check:** Is `session` active?
    * **Yes:** Proceed to `Checkout Modal`.
    * **No:** Open `Auth Modal` (Bottom Sheet).
4.  **Auth Modal:** User enters Mobile Number -> OTP.
5.  **Success:** Modal closes -> Proceed to `Checkout Modal`.

---

## 🗄️ Database Changes (Supabase)

### Table: `services` (New Table)
We need to move hardcoded services from the frontend to the database to manage them easily.
* `id` (uuid)
* `name` (text)
* `description` (text)
* `price` (numeric)
* `duration_min` (int)
* `category` (text) [e.g., 'Classic', 'Premium']
* `image_url` (text)

### Policies (RLS)
* `services`: Enable `SELECT` for `anon` and `authenticated` roles.