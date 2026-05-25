# Experimental Feature Roadmap

Branch: `feat/experimental`

This branch is the frontend staging area for the next feature group. Production remains on `dev/eunhhu` until these flows are implemented, tested, and promoted.

## 1. Notification Upgrade

Frontend surfaces to prepare:

- Notification settings for expiry-soon, expired, and daily summary alerts.
- Recommended notification time UI based on observed user routine.
- "Today to eat" summary card and push notification preview.
- Permission recovery states for denied, unsupported, and expired subscriptions.

Backend contracts needed:

- Read and update notification preferences.
- Preview next notification schedule and summary content.
- Register, refresh, and revoke push subscriptions.

## 2. Ingredient Recognition Upgrade

Frontend surfaces to prepare:

- Lens mode selection for receipt OCR and fridge photo recognition.
- Review queue for uncertain ingredients, duplicate detection, and quantity merge.
- Confirmation status for ingredients with unclear expiry.
- Batch edit flow before saving recognized ingredients.

Backend contracts needed:

- Analyze receipt image.
- Analyze fridge image.
- Merge candidates with existing inventory.
- Mark ingredients as needs-review when expiry, quantity, or identity is uncertain.

## 3. Personalized Recommendations

Frontend surfaces to prepare:

- Preference controls for excluded ingredients, preferred cook time, and recent meal feedback.
- Recipe ranking explanations that show why expiring ingredients were prioritized.
- Recent meal history and "do not recommend again today" controls.

Backend contracts needed:

- Store user taste and restriction preferences.
- Track consumed recipes and recent meals.
- Rank recipes by expiring inventory, preference match, cook time, and repeat fatigue.

## Readiness Gates

- All new API calls must route through `src/lib/backendApi.ts`.
- Signed-out or 401 states must keep using the account prompt flow.
- Mobile Safari QA is required for notification permission, camera flows, bottom sheets, and scroll behavior.
- Existing local fallback behavior must not write durable prototype state except legacy migration removal.
