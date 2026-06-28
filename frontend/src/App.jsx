import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import { useStore } from '@/store/useStore';

// Pages
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import ItemDetail from './pages/ItemDetail';
import Outfits from './pages/Outfits';
import ShopMatch from './pages/ShopMatch';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import WearCalendar from './pages/WearCalendar';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = useStore((state) => state.token);
  return token ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const token = useStore((state) => state.token);
  return !token ? children : <Navigate to="/" />;
};

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut'
};

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const token = useStore((state) => state.token);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-800 via-black-900 to-black-700">
      {/* Animated background grid */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />

      {!token ? (
        // Auth Layout
        <div className="min-h-screen flex items-center justify-center">
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Login />
                    </motion.div>
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Register />
                    </motion.div>
                  </PublicRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </AnimatePresence>
        </div>
      ) : (
        // Main App Layout
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main Content */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            />

            <main className="flex-1 p-6 overflow-auto">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <motion.div
                        key="dashboard"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                      >
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      </motion.div>
                    }
                  />
                  <Route
                    path="/wardrobe"
                    element={
                      <motion.div
                        key="wardrobe"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                      >
                        <ProtectedRoute>
                          <Wardrobe />
                        </ProtectedRoute>
                      </motion.div>
                    }
                  />
               
                  <Route
                    path="/wardrobe/:id"
                    element={
                      <motion.div
                        key="item-detail"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                      >
                        <ProtectedRoute>
                          <ItemDetail />
                        </ProtectedRoute>
                      </motion.div>
                    }
                  />
                  <Route
                    path="/outfits"
                    element={
                      <motion.div
                        key="outfits"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                      >
                        <ProtectedRoute>
                          <Outfits />
                        </ProtectedRoute>
                      </motion.div>
                    }
                  />
                  <Route
                    path="/shop-match"
                    element={
                      <motion.div
                        key="shop-match"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                      >
                        <ProtectedRoute>
                          <ShopMatch />
                        </ProtectedRoute>
                      </motion.div>
                    }
                  />
                  <Route
                    path="/insights"
                    element={
                      <motion.div
                        key="insights"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                      >
                        <ProtectedRoute>
                          <Insights />
                        </ProtectedRoute>
                      </motion.div>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <motion.div
                        key="settings"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                      >
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      </motion.div>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <motion.div
                        key="calendar"
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                      >
                        <ProtectedRoute>
                          <WearCalendar />
                        </ProtectedRoute>
                      </motion.div>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
