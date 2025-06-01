// Format time from 24-hour to 12-hour format
export const formatTime = (time: string): string => {
  // Handle empty or invalid time strings
  if (!time || !time.includes(':')) return '';
  
  // Parse the time string
  const [hours, minutes] = time.split(':').map(Number);
  
  // Create a date object with today's date and the input time in UTC
  const date = new Date();
  date.setUTCHours(hours, minutes, 0, 0);
  
  // Format in user's local time
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
};

// Format date to readable format
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Format dosage
export const formatDosage = (amount: number, unit: string): string => {
  return `${amount} ${unit}`;
};

// Capitalize first letter of a string
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Convert local time to UTC
export const localToUTC = (timeStr: string): string => {
  // Parse the input time
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create a date object with today's date and the input time in local timezone
  const localDate = new Date();
  localDate.setHours(hours, minutes, 0, 0);
  
  // Convert to UTC
  const utcHours = localDate.getUTCHours();
  const utcMinutes = localDate.getUTCMinutes();
  
  // Return the UTC time
  return `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
};

// Convert UTC to local time
export const UTCToLocal = (timeStr: string): string => {
  // Parse the UTC time
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create a date object with today's date and the input time in UTC
  const utcDate = new Date();
  utcDate.setUTCHours(hours, minutes, 0, 0);
  
  // Get local hours and minutes
  const localHours = utcDate.getHours();
  const localMinutes = utcDate.getMinutes();
  
  // Return the local time
  return `${localHours.toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}`;
};

// Format datetime with timezone
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
};