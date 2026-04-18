import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Bell, Home, Users, MessageSquare, Calendar, User, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { discussionAPI } from '../../services/discussionAPI';

type NotificationItem = {
  id: string;
  heading: string;
  message: string;
  time: string;
  path: string;
};

const fallbackNotifications: NotificationItem[] = [
  {
    id: 'fallback-1',
    heading: 'Discussions',
    message: 'View latest updates in your discussion board',
    time: 'Now',
    path: '/discussions',
  },
];

const toRelativeTime = (dateString?: string) => {
  if (!dateString) return 'Now';

  const createdAt = new Date(dateString);
  if (Number.isNaN(createdAt.getTime())) return 'Now';

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(fallbackNotifications);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const response = await discussionAPI.getDiscussions({ sortBy: 'newest', limit: 3 });
        const discussions = Array.isArray(response?.data) ? response.data : [];

        if (discussions.length === 0) {
          if (isMounted) setNotifications(fallbackNotifications);
          return;
        }

        const mappedNotifications: NotificationItem[] = discussions.map((post: any) => {
          const id = post._id || post.id;
          const author = post.author || 'Someone';
          const title = post.title || 'a discussion';

          return {
            id: `discussion-${id || Math.random().toString(36).slice(2)}`,
            heading: 'New Discussion',
            message: `${author} posted "${title}"`,
            time: toRelativeTime(post.createdAt || post.timestamp),
            path: id ? `/discussions/${id}` : '/discussions',
          };
        });

        if (isMounted) {
          setNotifications(mappedNotifications);
        }
      } catch {
        if (isMounted) {
          setNotifications(fallbackNotifications);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/communities', icon: Users, label: 'Communities' },
    { path: '/discussions', icon: MessageSquare, label: 'Discussions' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold hidden sm:inline">UniCrew</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((item) => (
                  <div key={item.id}>
                    <DropdownMenuItem
                      className="flex flex-col items-start p-3 gap-1 cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(item.path)}
                    >
                      <span className="font-semibold text-sm text-gray-800">{item.heading}</span>
                      <span className="text-xs text-gray-600">{item.message}</span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                ))}
                <DropdownMenuItem
                  className="justify-center text-blue-600 font-medium cursor-pointer"
                  onClick={() => setNotifications([])}
                >
                  Mark all as read
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://ui-avatars.com/api/?name=IT2356789&background=2563eb&color=fff&bold=true" />
                    <AvatarFallback>IT2</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">IT2356789</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-gray-600 font-normal">IT2356789</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 w-4 h-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r z-30
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}>
                  <motion.div
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'hover:bg-gray-100'
                      }
                    `}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
