# Phase 5 Test Cases - Achievement Progress Tracking and Claims

**Test Date**: ____________  
**Tested By**: ____________  
**Environment**: http://localhost:3000

---

## Prerequisites

### 1. Start Development Server
```bash
npm run dev
```
Server should start at: http://localhost:3000

### 2. Test Accounts
- **Admin**: admin@company.com / admin123 (💎 1000)
- **HR**: hr@company.com / hr123456 (💎 500)
- **User**: john@company.com / user1234 (💎 250)

### 3. Verify Seed Data
Login as admin and go to `/admin/achievements` to ensure there are achievements available.

---

## Test Case 1: View Achievements by Status

**Objective**: Verify achievements are categorized into Upcoming, On Doing, and Completed sections.

### Steps:
1. Login as **john@company.com** / **user1234**
2. Navigate to `/achievements` page
3. Observe three sections:
   - **Upcoming** (start_date in future)
   - **On Doing** (current date between start_date and end_date)
   - **Completed** (claimed achievements)

### Expected Results:
- ✅ Page loads successfully
- ✅ Three distinct sections visible
- ✅ Achievements display with title, description, diamond reward
- ✅ Status badges show correct state (Upcoming/On Doing/Completed)
- ✅ Current diamond balance displayed at top of page
- ✅ Only "On Doing" achievements show progress bar and claim button

### Actual Results:
- [OK] PASS
- [ ] FAIL - Notes: _______________________________________________

---

## Test Case 2: Track Achievement Progress

**Objective**: Verify users can update achievement progress percentage.

### Steps:
1. Login as **john@company.com** / **user1234**
2. Navigate to `/achievements`
3. Find an achievement in "On Doing" section
4. Locate progress bar (should show current percentage)
5. Look for a way to update progress (input field or slider)
6. Update progress to 50%
7. Update progress to 100%

### Expected Results:
- ✅ Progress bar displays current progress (0-100%)
- ✅ Progress can be updated via UI control
- ✅ Progress updates reflect immediately after submission
- ✅ Progress changes are persisted (refresh page to verify)
- ✅ 100% progress enables the "Claim" button
- ✅ Cannot set progress > 100% or < 0%

### Actual Results:
- [ ] PASS
- [Fail] FAIL - Notes: No progress update yet.

---

## Test Case 3: Claim Achievement Rewards (Happy Path)

**Objective**: Verify successful achievement claim updates balance and prevents duplicate claims.

### Prerequisites:
- Set an "On Doing" achievement to 100% progress
- Note current diamond balance before claim

### Steps:
1. Login as **john@company.com** / **user1234**
2. Navigate to `/achievements`
3. Note current balance: ________ 💎
4. Find achievement with 100% progress in "On Doing" section
5. Click "Claim" or "Claim Reward" button
6. Observe success message/animation
7. Check diamond balance update
8. Refresh page
9. Check if achievement moved to "Completed" section
10. Try to claim the same achievement again

### Expected Results:
- ✅ Claim button is enabled only when progress = 100%
- ✅ Click triggers claim request
- ✅ Success notification appears (toast/alert)
- ✅ Diamond balance increases by reward amount
- ✅ Balance update is immediate (no page refresh needed)
- ✅ Achievement moves from "On Doing" to "Completed" section
- ✅ Claim button disappears or shows "Claimed" status
- ✅ Cannot claim the same achievement twice (button disabled/removed)
- ✅ Balance persists after page refresh

### Calculation Check:
- Previous Balance: 250 💎
- Reward Amount: 50 💎
- Expected New Balance: 300 💎
- Actual New Balance: 300 💎
- Match: [Yes] YES [ ] NO

### Actual Results:
- [OK] PASS
- [ ] FAIL

---

## Test Case 4: Prevent Duplicate Claims

**Objective**: Verify system prevents claiming the same achievement multiple times.

### Steps:
1. Login as **john@company.com** / **user1234**
2. Navigate to `/achievements`
3. Find a completed (already claimed) achievement
4. Check if claim button is visible
5. Attempt to claim via API (if button hidden):
   - Open browser DevTools (F12)
   - Go to Network tab
   - Find the claim endpoint URL from previous successful claim
   - Manually make POST request to `/api/achievements/{id}/claim`

### Expected Results:
- ✅ Claim button not visible for completed achievements
- ✅ "Claimed" or "Completed" badge displayed instead
- ✅ Direct API call returns error (400/403)
- ✅ Error message: "Achievement already claimed" or similar
- ✅ Balance does not increase
- ✅ No duplicate history record created

### Actual Results:
- [ ] PASS
- [ ] FAIL - Notes: _______________________________________________

---

## Test Case 5: Prevent Expired Achievement Claims

**Objective**: Verify system prevents claiming achievements after end_date.

### Setup:
1. Login as **admin@company.com** / **admin123**
2. Go to `/admin/achievements`
3. Create a new achievement with:
   - Title: "Test Expired Achievement"
   - Reward: 100 💎
   - Start Date: Yesterday
   - End Date: Yesterday (or past date)
4. Logout

### Steps:
1. Login as **john@company.com** / **user1234**
2. Navigate to `/achievements`
3. Check if expired achievement appears
4. If visible, set progress to 100%
5. Try to claim the expired achievement

### Expected Results:
- ✅ Expired achievements do not appear in "On Doing" section
- ✅ If visible, claim button is disabled
- ✅ Attempting to claim shows error message
- ✅ Error: "Achievement has expired" or similar
- ✅ Balance does not increase
- ✅ Achievement status does not change to claimed

### Actual Results:
- [ ] PASS
- [ ] FAIL - Notes: _______________________________________________

---

## Test Case 6: Diamond Balance Display

**Objective**: Verify diamond balance is prominently displayed and accurate.

### Steps:
1. Login as **john@company.com** / **user1234**
2. Navigate to `/achievements`
3. Locate diamond balance display (should be at top/header)
4. Note the balance: ________ 💎
5. Navigate to `/profile`
6. Check if balance matches
7. Claim an achievement (if available)
8. Return to `/achievements`
9. Verify balance updated

### Expected Results:
- ✅ Diamond balance visible on achievements page
- ✅ Balance displayed with 💎 icon or "Diamonds" label
- ✅ Balance is same across all pages (profile, achievements, store)
- ✅ Balance updates immediately after claim
- ✅ Balance is accurate (matches database)

### Actual Results:
- [ ] PASS
- [ ] FAIL - Notes: _______________________________________________

---

## Test Case 7: Progress Validation

**Objective**: Verify progress percentage validation.

### Steps:
1. Login as **john@company.com** / **user1234**
2. Navigate to `/achievements`
3. Find achievement in "On Doing" section
4. Try to set progress to negative value (-10)
5. Try to set progress to value > 100 (150)
6. Try to set progress to non-numeric value (abc)
7. Set valid progress (75)

### Expected Results:
- ✅ Negative values rejected with error message
- ✅ Values > 100 rejected with error message
- ✅ Non-numeric values rejected
- ✅ Valid values (0-100) accepted
- ✅ Progress bar updates correctly
- ✅ Validation happens before API call (client-side)

### Actual Results:
- [ ] PASS
- [ ] FAIL - Notes: _______________________________________________

---

## Test Case 8: Atomic Transaction Integrity

**Objective**: Verify claim operation is atomic (all or nothing).

### Setup:
This tests database transaction integrity. You'll need to check the database or logs.

### Steps:
1. Login as **john@company.com** / **user1234**
2. Note current balance: ________ 💎
3. Claim an achievement worth 100 💎
4. Open database file: `lib/db/copilot-demo.db`
5. Check three things:
   - Employee balance increased by 100
   - Achievement progress status = 'completed'
   - History record created with type 'claim'

### Expected Results:
- ✅ Balance update succeeds
- ✅ Achievement status updated to 'completed'
- ✅ History record inserted
- ✅ All three happen together (atomic)
- ✅ If any step fails, entire transaction rolls back

### Database Check (use SQLite browser or CLI):
```sql
-- Check balance
SELECT diamond_balance FROM employees WHERE email = 'john@company.com';

-- Check achievement status
SELECT status FROM achievement_progress 
WHERE employee_id = (SELECT id FROM employees WHERE email = 'john@company.com');

-- Check history
SELECT * FROM history 
WHERE employee_id = (SELECT id FROM employees WHERE email = 'john@company.com')
ORDER BY created_at DESC LIMIT 1;
```

### Actual Results:
- [ ] PASS
- [ ] FAIL - Notes: _______________________________________________

---

## Test Case 9: Multiple Users (Concurrency)

**Objective**: Verify multiple users can claim different achievements simultaneously.

### Steps:
1. Open two browser windows (or use incognito + normal)
2. **Window 1**: Login as john@company.com
3. **Window 2**: Login as admin@company.com
4. Both navigate to `/achievements`
5. Note balances:
   - John: ________ 💎
   - Admin: ________ 💎
6. Both claim different achievements at roughly same time
7. Verify both claims succeed
8. Verify both balances updated correctly

### Expected Results:
- ✅ Both claims process successfully
- ✅ No race conditions or deadlocks
- ✅ Both balances update correctly
- ✅ Both history records created
- ✅ No data corruption

### Actual Results:
- [ ] PASS
- [ ] FAIL - Notes: _______________________________________________

---

## Test Case 10: UI/UX Elements

**Objective**: Verify all Phase 5 UI components render correctly.

### Components to Check:

#### ProgressBar Component:
- [ ] Shows percentage numerically (e.g., "75%")
- [ ] Visual bar fills proportionally
- [ ] Color changes based on progress (optional)
- [ ] Smooth animation (optional)

#### StatusBadge Component:
- [ ] "Upcoming" badge (gray/blue)
- [ ] "On Doing" badge (yellow/orange)
- [ ] "Completed" badge (green)
- [ ] Clear visual distinction

#### ClaimButton Component:
- [ ] Disabled when progress < 100%
- [ ] Enabled when progress = 100%
- [ ] Shows "Claim" text
- [ ] Diamond icon/animation (optional)
- [ ] Loading state during API call
- [ ] Changes to "Claimed" after success

#### Achievement Card:
- [ ] Title displayed
- [ ] Description displayed
- [ ] Diamond reward shown (e.g., "💎 100")
- [ ] Dates shown (start/end)
- [ ] All elements aligned properly
- [ ] Responsive on mobile

### Actual Results:
- [ ] PASS
- [ ] FAIL - Notes: _______________________________________________

---

## Test Case 11: Error Handling

**Objective**: Verify graceful error handling for edge cases.

### Scenarios:

#### 11a. Network Failure:
1. Open DevTools → Network tab → Set to Offline
2. Try to claim achievement
3. Expected: Error message displayed, no balance change

#### 11b. Invalid Achievement ID:
1. Manually navigate to `/api/achievements/99999/claim`
2. Expected: 404 error or "Achievement not found"

#### 11c. Insufficient Progress:
1. Find achievement with < 100% progress
2. Try to claim (via API if button disabled)
3. Expected: Error "Achievement not completed"

#### 11d. Session Expired:
1. Wait 30+ minutes (or clear session cookie)
2. Try to claim achievement
3. Expected: Redirect to login page

### Actual Results:
- [ ] PASS
- [ ] FAIL - Notes: _______________________________________________

---

## Performance Test

**Objective**: Verify page loads and API responses are fast.

### Measurements:

| Action | Expected | Actual | Pass/Fail |
|--------|----------|--------|-----------|
| Load /achievements page | < 2 seconds | _____ | [ ] |
| Update progress | < 500ms | _____ | [ ] |
| Claim achievement | < 1 second | _____ | [ ] |
| Balance update (UI) | Immediate | _____ | [ ] |

### Tools:
- Use browser DevTools → Network tab
- Or time with stopwatch

### Actual Results:
- [ ] PASS (all under threshold)
- [ ] FAIL - Notes: _______________________________________________

---

## Summary

### Test Results:
- Total Test Cases: 11
- Passed: ______ / 11
- Failed: ______ / 11
- Pass Rate: ______%

### Critical Issues Found:
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Minor Issues Found:
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Recommendations:
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

### Sign-Off:
- [ ] Phase 5 is ready for production
- [ ] Phase 5 needs fixes (see issues above)
- [ ] Phase 5 requires re-testing after fixes

**Tester Signature**: _________________ **Date**: _____________

---

## Quick Test Script (Automated)

If you want to test via API directly, use these curl commands:

```bash
# 1. Login and get session token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@company.com","password":"user1234"}' \
  -c cookies.txt

# 2. Get employee achievements
curl -X GET http://localhost:3000/api/employees/3/achievements \
  -b cookies.txt

# 3. Update progress to 100%
curl -X PATCH http://localhost:3000/api/achievements/1/progress \
  -H "Content-Type: application/json" \
  -d '{"employee_id":3,"progress_percentage":100}' \
  -b cookies.txt

# 4. Claim achievement
curl -X POST http://localhost:3000/api/achievements/1/claim \
  -H "Content-Type: application/json" \
  -d '{"employee_id":3}' \
  -b cookies.txt

# 5. Verify balance updated
curl -X GET http://localhost:3000/api/employees/3 \
  -b cookies.txt
```

Replace employee_id and achievement_id with actual values from your database.
