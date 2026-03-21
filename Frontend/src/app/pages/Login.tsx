import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth, UserRole } from '../context/AuthContext';
import { Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  const handleSubmit = (e: React.FormEvent, loginRole: UserRole) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    login(email, password, loginRole);
    
    if (loginRole === 'student') {
      navigate('/dashboard');
    } else if (loginRole === 'university_admin') {
      navigate('/university-admin');
    } else if (loginRole === 'system_admin') {
      navigate('/system-admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <motion.span 
              className="text-xl font-semibold"
              animate={{ 
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              UniCrew
            </motion.span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="student" onValueChange={(value) => setRole(value as UserRole)}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="university_admin">Uni Admin</TabsTrigger>
                  <TabsTrigger value="system_admin">Sys Admin</TabsTrigger>
                </TabsList>

                <TabsContent value="student">
                  <form onSubmit={(e) => handleSubmit(e, 'student')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">University Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                      Sign In
                    </Button>

                    <div className="text-center">
                      <a href="#" className="text-sm text-blue-600 hover:underline">
                        Forgot password?
                      </a>
                    </div>

                  </form>
                </TabsContent>

                <TabsContent value="university_admin">
                  <form onSubmit={(e) => handleSubmit(e, 'university_admin')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                      Sign In as University Admin
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="system_admin">
                  <form onSubmit={(e) => handleSubmit(e, 'system_admin')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sys-email">System Admin Email</Label>
                      <Input
                        id="sys-email"
                        type="email"
                        placeholder="sysadmin@unicrew.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sys-password">Password</Label>
                      <Input
                        id="sys-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                      Sign In as System Admin
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}