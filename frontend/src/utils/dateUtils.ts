/**
 * Utility functions for date formatting in Vietnam timezone
 */
import { formatInTimeZone } from 'date-fns-tz';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
/**
 * Format ngày/thời gian theo giờ Việt Nam
 * @param value string | Date
 * @param withTime có hiển thị HH:mm không
 * @param value Chuỗi ngày hoặc Date object
 * @param withTime Có hiển thị giờ không (mặc định true)
 * @returns string dd/MM/yyyy hoặc dd/MM/yyyy HH:mm
 */
export const formatDateVN = (
  value: string | Date | null | undefined,
  withTime: boolean = false
): string => {
  if (!value) return '---';
  try {
    const date =
      typeof value === 'string'
        ? new Date(value.endsWith('Z') ? value : value + 'Z')
        : value;

    return formatInTimeZone(
      date,
      'Asia/Ho_Chi_Minh',
      withTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy',
      { locale: vi }
    );
  } catch {
    return '--';
  }
};

/**
 * Chỉ lấy ngày (DD/MM/YYYY) theo giờ Việt Nam
 */
export const formatDateOnly = (dateString: string | null): string => {
  if (!dateString) return '--';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z'));
  } catch (error) {
    console.error('Error formatting date only:', error);
    return '--';
  }
};

/**
 * Chỉ lấy giờ (HH:mm) theo giờ Việt Nam
 */
export const formatTimeOnly = (dateString: string | null): string => {
  if (!dateString) return '--';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z'));
  } catch (error) {
    console.error('Error formatting time only:', error);
    return '--';
  }
};

/**
 * Hiển thị thời gian tương đối (Hôm nay / Hôm qua / 3 ngày trước...)
 */
export const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return '--';

  try {
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '--';
  }
};
