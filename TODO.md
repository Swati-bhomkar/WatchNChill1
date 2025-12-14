# TODO: Add Users Section to Admin Sidebar

## Backend Changes
- [ ] Add `getAllUsers` function in `server/controllers/adminController.js` to fetch users with aggregated booking data (total bookings, last booking date).
- [ ] Add new route `/users` in `server/routes/adminRoutes.js`.

## Frontend Changes
- [ ] Create new page `cilent/src/pages/admin/ListUsers.jsx` to display the user list with name, email, role, total booking count, last booking date.
- [ ] Add route `list-users` in `cilent/src/App.jsx`.
- [ ] Add "List Users" nav link in `cilent/src/components/admin/AdminSidebar.jsx` with an appropriate icon (e.g., UsersIcon from lucide-react).
