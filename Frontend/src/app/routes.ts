import { createBrowserRouter } from 'react-router';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import UniversityAdminLayout from './layouts/UniversityAdminLayout';
import SystemAdminLayout from './layouts/SystemAdminLayout';

// Auth Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import Dashboard from './pages/student/Dashboard';
import Communities from './pages/student/Communities';
import CommunityDetails from './pages/student/CommunityDetails';
import Discussions from './pages/student/Discussions';
import CreatePost from './pages/student/CreatePost';
import PostDetails from './pages/student/PostDetails';
import Chat from './pages/student/Chat';
import Events from './pages/student/Events';
import CreateEvent from './pages/student/CreateEvent';
import EventDetails from './pages/student/EventDetails';
import Profile from './pages/student/Profile';
import StudentProfile from './pages/student/StudentProfile';

// University Admin Pages
import UniversityDashboard from './pages/admin/UniversityDashboard';
import CommunityManagement from './pages/admin/CommunityManagement';
import PostApproval from './pages/admin/PostApproval';
import ReportedPosts from './pages/admin/ReportedPosts';

// System Admin Pages
import SystemDashboard from './pages/sysadmin/SystemDashboard';
import UniversityManagement from './pages/sysadmin/UniversityManagement';
import AdminManagement from './pages/sysadmin/AdminManagement';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Landing,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  // Student Routes
  {
    path: '/',
    Component: StudentLayout,
    children: [
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'communities',
        Component: Communities,
      },
      {
        path: 'communities/:id',
        Component: CommunityDetails,
      },
      {
        path: 'discussions',
        Component: Discussions,
      },
      {
        path: 'discussions/create',
        Component: CreatePost,
      },
      {
        path: 'discussions/:id',
        Component: PostDetails,
      },
      {
        path: 'chat/:communityId?',
        Component: Chat,
      },
      {
        path: 'events',
        Component: Events,
      },
      {
        path: 'events/create',
        Component: CreateEvent,
      },
      {
        path: 'events/:id',
        Component: EventDetails,
      },
      {
        path: 'profile',
        Component: Profile,
      },
      {
        path: 'students/:id',
        Component: StudentProfile,
      },
    ],
  },
  // University Admin Routes
  {
    path: '/university-admin',
    Component: UniversityAdminLayout,
    children: [
      {
        index: true,
        Component: UniversityDashboard,
      },
      {
        path: 'communities',
        Component: CommunityManagement,
      },
      {
        path: 'posts',
        Component: PostApproval,
      },
      {
        path: 'reports',
        Component: ReportedPosts,
      },
    ],
  },
  // System Admin Routes
  {
    path: '/system-admin',
    Component: SystemAdminLayout,
    children: [
      {
        index: true,
        Component: SystemDashboard,
      },
      {
        path: 'universities',
        Component: UniversityManagement,
      },
      {
        path: 'admins',
        Component: AdminManagement,
      },
    ],
  },
]);
