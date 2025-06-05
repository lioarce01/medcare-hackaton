// Format time from 24-hour to 12-hour format
export const formatTime = (time: string): string => {
  // Handle empty or invalid time strings
  if (!time || !time.includes(":")) return "";

  // Parse the time string
  const [hours, minutes] = time.split(":").map(Number);

  // Create a date object with today's date and the input time in UTC
  const date = new Date();
  date.setUTCHours(hours, minutes, 0, 0);

  // Format in user's local time
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

// Format date to readable format
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};

// Format percentage
export const formatPercentage = (value: number): string => {
  // Maneja undefined, null, NaN, y otros casos edge
  if (value == null || !isFinite(value)) {
    return "0%";
  }
  return `${Math.round(value)}%`;
};

// Format dosage
export const formatDosage = (amount: number, unit: string): string => {
  return `${amount} ${unit}`;
};

// Capitalize first letter of a string
export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const localToUTC = (timeStr: string, timezone?: string): string => {
  // Parse the input time
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Create a date object with today's date and the input time
  const today = new Date();
  const localDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hours,
    minutes,
    0,
    0
  );

  if (timezone) {
    // If timezone is provided, create a date in that specific timezone
    const timezonedDate = new Date(
      localDate.toLocaleString("en-US", { timeZone: timezone })
    );

    // Calculate the offset between the specified timezone and UTC
    const utcTime = new Date(
      localDate.getTime() - (timezonedDate.getTime() - localDate.getTime())
    );

    const utcHours = utcTime.getUTCHours();
    const utcMinutes = utcTime.getUTCMinutes();

    return `${utcHours.toString().padStart(2, "0")}:${utcMinutes
      .toString()
      .padStart(2, "0")}`;
  } else {
    // Use system's local timezone (original behavior)
    const utcHours = localDate.getUTCHours();
    const utcMinutes = localDate.getUTCMinutes();

    return `${utcHours.toString().padStart(2, "0")}:${utcMinutes
      .toString()
      .padStart(2, "0")}`;
  }
};

export const UTCToLocal = (timeStr: string, timezone?: string): string => {
  // Parse the UTC time
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Create a date object with today's date and the input time in UTC
  const today = new Date();
  const utcDate = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      hours,
      minutes,
      0,
      0
    )
  );

  if (timezone) {
    // Convert UTC to the specified timezone
    const localTimeString = utcDate.toLocaleString("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    // Extract just the time part (HH:MM)
    const timePart = localTimeString.split(", ")[1] || localTimeString;
    const [localHours, localMinutes] = timePart.split(":").map(Number);

    return `${localHours.toString().padStart(2, "0")}:${localMinutes
      .toString()
      .padStart(2, "0")}`;
  } else {
    // Use system's local timezone (original behavior)
    const localHours = utcDate.getHours();
    const localMinutes = utcDate.getMinutes();

    return `${localHours.toString().padStart(2, "0")}:${localMinutes
      .toString()
      .padStart(2, "0")}`;
  }
};

// Format datetime with timezone
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};
