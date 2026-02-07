import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!role) {
      setError('Please select a login role');
      return;
    }

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    // Store role in localStorage for persistence
    localStorage.setItem('userRole', role);

    // Role-based redirect
    if (role === 'user') {
      navigate('/raise-ticket');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-lg mb-4">
            <span className="text-2xl font-bold text-white">NA</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">NexusAgent</h1>
          <p className="text-sm text-gray-500 mt-1">IT Support Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    role === 'user'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User
                    size={24}
                    className={role === 'user' ? 'text-indigo-600' : 'text-gray-400'}
                  />
                  <span
                    className={`mt-2 text-sm font-medium ${
                      role === 'user' ? 'text-indigo-600' : 'text-gray-700'
                    }`}
                  >
                    User Login
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    role === 'admin'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Shield
                    size={24}
                    className={role === 'admin' ? 'text-indigo-600' : 'text-gray-400'}
                  />
                  <span
                    className={`mt-2 text-sm font-medium ${
                      role === 'admin' ? 'text-indigo-600' : 'text-gray-700'
                    }`}
                  >
                    Admin Login
                  </span>
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all"
            >
              Sign In
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Demo credentials accepted for hackathon
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
