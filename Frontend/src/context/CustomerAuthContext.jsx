import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '../config';

const API = `${API_URL}/api`;
const CustomerAuthContext = createContext();

const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('customerToken'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (overrideToken) => {
    const authToken = overrideToken || token;
    if (!authToken) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(`${API}/customer/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCustomer(data.customer || data);
    } catch (error) {
      localStorage.removeItem('customerToken');
      setToken(null);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setCustomer(null);
      setLoading(false);
    }
  }, [token]);

  // Auto-check every 30s if customer still exists in DB (auto-logout if deleted by admin)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        await axios.get(`${API}/customer/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          localStorage.removeItem('customerToken');
          setToken(null);
          setCustomer(null);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API}/customer/login`, { email, password });
      localStorage.setItem('customerToken', data.token);
      setToken(data.token);
      await fetchProfile(data.token);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await axios.post(`${API}/customer/register`, formData);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const verifyRegistration = async (email, otp) => {
    try {
      const { data } = await axios.post(`${API}/customer/verify-registration`, { email, otp });
      localStorage.setItem('customerToken', data.token);
      setToken(data.token);
      await fetchProfile(data.token);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API}/customer/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      // proceed with logout even if API call fails
    } finally {
      localStorage.removeItem('customerToken');
      setToken(null);
      setCustomer(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      const { data: res } = await axios.put(`${API}/customer/update-profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomer(res.customer || res);
      return res;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const changePassword = async (data) => {
    try {
      const { data: res } = await axios.put(`${API}/customer/change-password`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post(`${API}/customer/forgot-password`, { email });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const verifyResetOtp = async (email, otp) => {
    try {
      const { data } = await axios.post(`${API}/customer/verify-reset-otp`, { email, otp });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const resetPassword = async (resetToken, newPassword, confirmPassword) => {
    try {
      const { data } = await axios.post(`${API}/customer/reset-password`, {
        resetToken,
        newPassword,
        confirmPassword,
      });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        loading,
        login,
        register,
        verifyRegistration,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        fetchProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export default CustomerAuthProvider;
export const useCustomerAuth = () => useContext(CustomerAuthContext);
