# StaffSync - Modern Human Resource Management Solution (MERN Stack)

**StaffSync** is a web-based human resource management solution built using the **MERN Stack** (MongoDB, Express.js, React 18, and Node.js). It streamlines and automates workforce operations across an organization with role-based access control (RBAC) for HR Administrators, Managers, and Employees.

---

## ✨ Key System Features

- **🛡️ Multi-Role Access Control (RBAC):** Tailored views, navigation, and API security for HR Personnel, Team Managers, and Employees.
- **⏱️ Precision Live Time Clock & Attendance:** Real-time digital clock, one-click Punch In / Punch Out, shift duration counter, daily logs, and team roster overview.
- **📅 Automated Leave Management Engine:** Self-service leave application (Casual, Sick, Earned, Unpaid), live duration calculator, quota deduction, and manager approval/rejection queues.
- **👥 Dynamic Employee Directory:** Searchable staff directory with avatar indicators, department tags, role pills, and HR inline controls to modify designations, departments, roles, and reporting managers.
- **🎓 Learning & Development Tracks:** Corporate training programs with skill tags, duration, and one-click self-service employee enrollment.
- **📢 Company Notice Board:** Official announcements and bulletins with author attribution and instant publication controls for HR.
- **🔔 Real-Time Notification Center:** Dropdown alerts with unread counter badges for leave status changes and company broadcasts.
- **⚡ One-Click Demo Role Switcher:** Fast testing bar to switch seamlessly between HR, Manager, and Employee personas.

---

## 🔑 Demo Access Credentials

| Persona | Name | Email | Password | Role & Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **HR Administrator** | Anita Verma | `hr@hrm.com` | `Pass@123` | Full HR authority: Directory management, leave approval, announcements, company-wide attendance |
| **Team Manager** | Rohan Mehta | `mgr@hrm.com` | `Pass@123` | Team oversight: Review team leave requests, monitor team daily attendance, schedule trainings |
| **Staff Member** | Priya Sharma | `emp@hrm.com` | `Pass@123` | Employee portal: Digital punch clock, apply for leaves, check leave balance, join trainings |

---

## 🚀 Deployment & Running

### Option 1: One-Click Windows Script
Double-click `deploy.bat` in the project root. It will:
1. Seed the MongoDB database with initial sample workforce data.
2. Build the optimized production React client.
3. Start the unified Node.js/Express server and open `http://localhost:5000` in your browser.

### Option 2: Command Line
```bash
# 1. Seed database
cd hrm/server
npm run seed

# 2. Build production React client
cd ../client
npm run build

# 3. Start unified application (Serves API and Web UI on port 5000)
cd ../server
npm start
```

Visit **http://localhost:5000** in your web browser.

### Option 3: Separate Development Mode (Hot Reload)
```bash
# Terminal 1 - Server
cd hrm/server
npm run dev

# Terminal 2 - Client
cd hrm/client
npm run dev
```
Client runs on **http://localhost:5173** and proxies API calls to **http://localhost:5000**.
