"use client";

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, Settings, User } from 'lucide-react';
import { authClient } from '@/lib/authClient';
import { useAuth } from '@/components/providers/AuthProvider';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const navItems = useMemo(() => (
    user
      ? [
          { href: '/assessment', label: 'Stress Check' },
          { href: '/breathing', label: 'Breathe' },
          { href: '/gratitude', label: 'Gratitude Jar' },
          { href: '/art', label: 'Art' },
          { href: '/innercompass', label: 'Inner Compass' },
          { href: '/journal', label: 'Journal' },
        ]
      : []
  ), [user]);

  const handleSignOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  }, []);

  const displayName = useMemo(() => {
    if (!user) return null;
    return user.username ?? user.fullName ?? user.email ?? 'Traveler';
  }, [user]);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Heart className="h-8 w-8 text-blue-500 group-hover:text-purple-600 transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ZenU
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.length > 0 && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group"
              >
                {item.label}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
            ))}

            {user ? (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                  <Settings className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">{displayName}</span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="py-1 px-3 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    disabled={loading}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/signin" className="text-gray-600 hover:text-blue-600">Sign In</Link>
                <span className="text-gray-300">/</span>
                <Link href="/signup" className="text-gray-600 hover:text-blue-600">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {user && navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-600 hover:text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-all font-medium"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-3 border-t border-gray-100 space-y-3">
                {user ? (
                  <>
                    <button className="w-full flex items-center justify-center space-x-2 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </button>

                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                        <User className="h-4 w-4" />
                        <span>{displayName}</span>
                      </div>
                      <button
                        onClick={() => {
                          void handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        disabled={loading}
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Link
                      href="/signin"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      Sign In
                    </Link>
                    <span className="text-gray-300">/</span>
                    <Link
                      href="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;