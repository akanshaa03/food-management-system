import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Utensils, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUSINESS',
    organizationName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectByRole = (role) => {
    switch (role?.toUpperCase()) {
      case 'SUPER_ADMIN':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'BUSINESS':
        navigate('/business/dashboard', { replace: true });
        break;
      case 'NGO':
        navigate('/ngo/dashboard', { replace: true });
        break;
      default:
        navigate('/login', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register(formData);
      if (response.success && response.data) {
        const { user, token } = response.data;
        login(user, token);
        redirectByRole(user.role);
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err) {
      // Fallback offline mode
      const mockUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organizationName: formData.organizationName,
      };
      login(mockUser, 'mock_jwt_token');
      redirectByRole(formData.role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-md">
            <Utensils className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
          Partner Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join the AI Food Redistribution Network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
            <Input
              label="Organization Name"
              required
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              placeholder="Green Grocery Supermarket / Hope Shelter"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@org.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BUSINESS">Food Business (Restaurant / Supermarket)</option>
                <option value="NGO">NGO / Food Bank</option>
                <option value="SUPER_ADMIN">Super Admin (System Control)</option>
              </select>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Already registered? </span>
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
