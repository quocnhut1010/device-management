/**
 * Color system for Device Management Mobile App
 * Modern, professional color palette
 */

export const Colors = {
  // Primary colors - Modern indigo/purple gradient
  primary: '#6366f1', // Indigo-500
  primaryDark: '#4f46e5', // Indigo-600
  primaryLight: '#818cf8', // Indigo-400
  secondary: '#8b5cf6', // Violet-500
  secondaryDark: '#7c3aed', // Violet-600

  // Status colors
  success: '#10b981', // Emerald-500
  successLight: '#34d399', // Emerald-400
  warning: '#f59e0b', // Amber-500
  warningLight: '#fbbf24', // Amber-400
  error: '#ef4444', // Red-500
  errorLight: '#f87171', // Red-400
  info: '#3b82f6', // Blue-500

  // Neutral colors
  background: '#f8fafc', // Slate-50
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  text: '#1e293b', // Slate-800
  textSecondary: '#64748b', // Slate-500
  textTertiary: '#94a3b8', // Slate-400
  border: '#e2e8f0', // Slate-200
  divider: '#e2e8f0', // Slate-200

  // Gradient arrays for LinearGradient
  gradient: {
    primary: ['#6366f1', '#8b5cf6'], // Indigo to Violet
    success: ['#10b981', '#34d399'],
    warning: ['#f59e0b', '#fbbf24'],
    error: ['#ef4444', '#f87171'],
    background: ['#f8fafc', '#ffffff'],
  },

  // Status badge colors
  status: {
    'Đang sử dụng': '#10b981',
    'Chưa cấp phát': '#3b82f6',
    'Đang sửa chữa': '#f59e0b',
    'Bảo trì': '#f59e0b',
    'Chờ thanh lý': '#64748b',
    'Hỏng': '#ef4444',
    'Mất': '#ef4444',
    'Đã thanh lý': '#64748b',
  },
};

export default Colors;

