import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {

  constructor() { }

  /**
   * Get the browser's current timezone in IANA format
   */
  getBrowserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Convert IANA timezone to Windows timezone ID
   */
  convertToWindowsTimeZone(ianaTimeZone: string): string {
    const timezoneMap: { [key: string]: string } = {
      // North America - Eastern
      'America/New_York': 'Eastern Standard Time',
      'America/Toronto': 'Eastern Standard Time',
      'America/Montreal': 'Eastern Standard Time',
      'America/Detroit': 'Eastern Standard Time',
      'America/Indianapolis': 'US Eastern Standard Time',
      'America/Louisville': 'Eastern Standard Time',
      'America/Miami': 'Eastern Standard Time',
      'America/Atlanta': 'Eastern Standard Time',
      'America/Boston': 'Eastern Standard Time',
      'America/Philadelphia': 'Eastern Standard Time',
      'America/Washington': 'Eastern Standard Time',
      'America/Nassau': 'Eastern Standard Time',
      'America/Jamaica': 'SA Pacific Standard Time',
      'America/Havana': 'Eastern Standard Time',

      // North America - Central
      'America/Chicago': 'Central Standard Time',
      'America/Winnipeg': 'Central Standard Time',
      'America/Mexico_City': 'Central Standard Time (Mexico)',
      'America/Regina': 'Canada Central Standard Time',
      'America/Guatemala': 'Central America Standard Time',
      'America/Costa_Rica': 'Central America Standard Time',
      'America/El_Salvador': 'Central America Standard Time',
      'America/Managua': 'Central America Standard Time',
      'America/Tegucigalpa': 'Central America Standard Time',
      'America/Belize': 'Central America Standard Time',

      // North America - Mountain
      'America/Denver': 'Mountain Standard Time',
      'America/Edmonton': 'Mountain Standard Time',
      'America/Calgary': 'Mountain Standard Time',
      'America/Phoenix': 'US Mountain Standard Time',
      'America/Mazatlan': 'Mountain Standard Time (Mexico)',
      'America/Chihuahua': 'Mountain Standard Time (Mexico)',
      'America/Boise': 'Mountain Standard Time',
      'America/Salt_Lake_City': 'Mountain Standard Time',

      // North America - Pacific
      'America/Los_Angeles': 'Pacific Standard Time',
      'America/Vancouver': 'Pacific Standard Time',
      'America/Seattle': 'Pacific Standard Time',
      'America/San_Francisco': 'Pacific Standard Time',
      'America/Tijuana': 'Pacific Standard Time (Mexico)',
      'America/Portland': 'Pacific Standard Time',
      'America/Las_Vegas': 'Pacific Standard Time',
      'America/San_Diego': 'Pacific Standard Time',

      // North America - Alaska & Hawaii
      'America/Anchorage': 'Alaskan Standard Time',
      'America/Juneau': 'Alaskan Standard Time',
      'Pacific/Honolulu': 'Hawaiian Standard Time',

      // North America - Atlantic
      'America/Halifax': 'Atlantic Standard Time',
      'America/Bermuda': 'Atlantic Standard Time',
      'America/Puerto_Rico': 'SA Western Standard Time',
      'America/Santo_Domingo': 'SA Western Standard Time',

      // South America
      'America/Sao_Paulo': 'E. South America Standard Time',
      'America/Buenos_Aires': 'Argentina Standard Time',
      'America/Bogota': 'SA Pacific Standard Time',
      'America/Lima': 'SA Pacific Standard Time',
      'America/Santiago': 'Pacific SA Standard Time',
      'America/Caracas': 'Venezuela Standard Time',
      'America/Montevideo': 'Montevideo Standard Time',
      'America/La_Paz': 'SA Western Standard Time',
      'America/Guayaquil': 'SA Pacific Standard Time',
      'America/Manaus': 'SA Western Standard Time',

      // Europe - Western
      'Europe/London': 'GMT Standard Time',
      'Europe/Dublin': 'GMT Standard Time',
      'Europe/Lisbon': 'GMT Standard Time',
      'Atlantic/Reykjavik': 'Greenwich Standard Time',
      'Atlantic/Canary': 'GMT Standard Time',

      // Europe - Central
      'Europe/Paris': 'Romance Standard Time',
      'Europe/Brussels': 'Romance Standard Time',
      'Europe/Madrid': 'Romance Standard Time',
      'Europe/Berlin': 'W. Europe Standard Time',
      'Europe/Amsterdam': 'W. Europe Standard Time',
      'Europe/Rome': 'W. Europe Standard Time',
      'Europe/Vienna': 'W. Europe Standard Time',
      'Europe/Stockholm': 'W. Europe Standard Time',
      'Europe/Copenhagen': 'Romance Standard Time',
      'Europe/Oslo': 'W. Europe Standard Time',
      'Europe/Prague': 'Central Europe Standard Time',
      'Europe/Warsaw': 'Central European Standard Time',
      'Europe/Budapest': 'Central Europe Standard Time',
      'Europe/Zurich': 'W. Europe Standard Time',
      'Europe/Munich': 'W. Europe Standard Time',
      'Europe/Milan': 'W. Europe Standard Time',
      'Europe/Barcelona': 'Romance Standard Time',

      // Europe - Eastern
      'Europe/Athens': 'GTB Standard Time',
      'Europe/Bucharest': 'GTB Standard Time',
      'Europe/Helsinki': 'FLE Standard Time',
      'Europe/Kiev': 'FLE Standard Time',
      'Europe/Riga': 'FLE Standard Time',
      'Europe/Sofia': 'FLE Standard Time',
      'Europe/Tallinn': 'FLE Standard Time',
      'Europe/Vilnius': 'FLE Standard Time',
      'Europe/Istanbul': 'Turkey Standard Time',
      'Europe/Moscow': 'Russian Standard Time',
      'Europe/Minsk': 'Belarus Standard Time',

      // Middle East
      'Asia/Dubai': 'Arabian Standard Time',
      'Asia/Riyadh': 'Arab Standard Time',
      'Asia/Kuwait': 'Arab Standard Time',
      'Asia/Bahrain': 'Arab Standard Time',
      'Asia/Qatar': 'Arab Standard Time',
      'Asia/Muscat': 'Arabian Standard Time',
      'Asia/Baghdad': 'Arabic Standard Time',
      'Asia/Tehran': 'Iran Standard Time',
      'Asia/Jerusalem': 'Israel Standard Time',
      'Asia/Beirut': 'Middle East Standard Time',
      'Asia/Damascus': 'Syria Standard Time',
      'Asia/Amman': 'Jordan Standard Time',

      // Asia - South
      'Asia/Kolkata': 'India Standard Time',
      'Asia/Mumbai': 'India Standard Time',
      'Asia/Delhi': 'India Standard Time',
      'Asia/Calcutta': 'India Standard Time',
      'Asia/Colombo': 'Sri Lanka Standard Time',
      'Asia/Kathmandu': 'Nepal Standard Time',
      'Asia/Dhaka': 'Bangladesh Standard Time',
      'Asia/Karachi': 'Pakistan Standard Time',

      // Asia - Southeast
      'Asia/Bangkok': 'SE Asia Standard Time',
      'Asia/Singapore': 'Singapore Standard Time',
      'Asia/Jakarta': 'SE Asia Standard Time',
      'Asia/Ho_Chi_Minh': 'SE Asia Standard Time',
      'Asia/Kuala_Lumpur': 'Singapore Standard Time',
      'Asia/Manila': 'Singapore Standard Time',
      'Asia/Yangon': 'Myanmar Standard Time',

      // Asia - East
      'Asia/Shanghai': 'China Standard Time',
      'Asia/Hong_Kong': 'China Standard Time',
      'Asia/Beijing': 'China Standard Time',
      'Asia/Taipei': 'Taipei Standard Time',
      'Asia/Tokyo': 'Tokyo Standard Time',
      'Asia/Seoul': 'Korea Standard Time',
      'Asia/Pyongyang': 'North Korea Standard Time',

      // Central Asia
      'Asia/Almaty': 'Central Asia Standard Time',
      'Asia/Tashkent': 'West Asia Standard Time',
      'Asia/Yekaterinburg': 'Ekaterinburg Standard Time',
      'Asia/Novosibirsk': 'N. Central Asia Standard Time',
      'Asia/Krasnoyarsk': 'North Asia Standard Time',
      'Asia/Irkutsk': 'North Asia East Standard Time',
      'Asia/Yakutsk': 'Yakutsk Standard Time',
      'Asia/Vladivostok': 'Vladivostok Standard Time',

      // Australia & Pacific
      'Australia/Sydney': 'AUS Eastern Standard Time',
      'Australia/Melbourne': 'AUS Eastern Standard Time',
      'Australia/Brisbane': 'E. Australia Standard Time',
      'Australia/Adelaide': 'Cen. Australia Standard Time',
      'Australia/Perth': 'W. Australia Standard Time',
      'Australia/Darwin': 'AUS Central Standard Time',
      'Australia/Hobart': 'Tasmania Standard Time',
      'Pacific/Auckland': 'New Zealand Standard Time',
      'Pacific/Fiji': 'Fiji Standard Time',
      'Pacific/Guam': 'West Pacific Standard Time',
      'Pacific/Port_Moresby': 'West Pacific Standard Time',
      'Pacific/Tongatapu': 'Tonga Standard Time',
      'Pacific/Apia': 'Samoa Standard Time',

      // Africa
      'Africa/Cairo': 'Egypt Standard Time',
      'Africa/Johannesburg': 'South Africa Standard Time',
      'Africa/Nairobi': 'E. Africa Standard Time',
      'Africa/Lagos': 'W. Central Africa Standard Time',
      'Africa/Kinshasa': 'W. Central Africa Standard Time',
      'Africa/Algiers': 'W. Central Africa Standard Time',
      'Africa/Casablanca': 'Morocco Standard Time',
      'Africa/Tunis': 'W. Central Africa Standard Time',
      'Africa/Harare': 'South Africa Standard Time',
      'Africa/Addis_Ababa': 'E. Africa Standard Time',
    };

    return timezoneMap[ianaTimeZone] || 'UTC';
  }

  /**
   * Get the current Windows timezone ID based on browser detection
   */
  getCurrentWindowsTimezone(): string {
    const browserTz = this.getBrowserTimezone();
    return this.convertToWindowsTimeZone(browserTz);
  }

  /**
   * Check if the user's browser timezone matches their stored timezone
   */
  isTimezoneDifferent(storedTimeZoneId: string): boolean {
    const currentTz = this.getCurrentWindowsTimezone();
    return currentTz !== storedTimeZoneId;
  }

  /**
   * Get timezone display name showing country/region
   */
  getTimezoneDisplayName(windowsTimeZoneId: string): string {
    const displayNames: { [key: string]: string } = {
      // North America
      'Eastern Standard Time': 'USA/Canada - Eastern Time (ET)',
      'US Eastern Standard Time': 'USA - Eastern Time (no DST)',
      'Central Standard Time': 'USA/Canada - Central Time (CT)',
      'Central Standard Time (Mexico)': 'Mexico - Central Time',
      'Canada Central Standard Time': 'Canada - Saskatchewan',
      'Central America Standard Time': 'Central America',
      'Mountain Standard Time': 'USA/Canada - Mountain Time (MT)',
      'Mountain Standard Time (Mexico)': 'Mexico - Mountain Time',
      'US Mountain Standard Time': 'USA - Arizona (no DST)',
      'Pacific Standard Time': 'USA/Canada - Pacific Time (PT)',
      'Pacific Standard Time (Mexico)': 'Mexico - Pacific Time',
      'Alaskan Standard Time': 'USA - Alaska Time',
      'Hawaiian Standard Time': 'USA - Hawaii Time',
      'Atlantic Standard Time': 'Canada - Atlantic Time',
      'SA Western Standard Time': 'Caribbean/N. South America',
      'SA Pacific Standard Time': 'Colombia/Peru/Jamaica',

      // South America
      'E. South America Standard Time': 'Brazil - Brasília',
      'Argentina Standard Time': 'Argentina',
      'Pacific SA Standard Time': 'Chile',
      'Venezuela Standard Time': 'Venezuela',
      'Montevideo Standard Time': 'Uruguay',

      // Europe - Western
      'GMT Standard Time': 'UK/Ireland/Portugal',
      'Greenwich Standard Time': 'Iceland/West Africa',

      // Europe - Central
      'Romance Standard Time': 'France/Belgium/Spain',
      'W. Europe Standard Time': 'Germany/Netherlands/Italy/Norway',
      'Central Europe Standard Time': 'Czech/Hungary/Austria',
      'Central European Standard Time': 'Poland/Croatia/Serbia',

      // Europe - Eastern
      'GTB Standard Time': 'Greece/Romania/Bulgaria',
      'FLE Standard Time': 'Finland/Ukraine/Baltics',
      'Turkey Standard Time': 'Turkey',
      'Russian Standard Time': 'Russia - Moscow',
      'Belarus Standard Time': 'Belarus',

      // Middle East
      'Arabian Standard Time': 'UAE/Oman',
      'Arab Standard Time': 'Saudi Arabia/Kuwait',
      'Arabic Standard Time': 'Iraq',
      'Iran Standard Time': 'Iran',
      'Israel Standard Time': 'Israel',
      'Middle East Standard Time': 'Lebanon',
      'Syria Standard Time': 'Syria',
      'Jordan Standard Time': 'Jordan',

      // Asia - South
      'India Standard Time': 'India',
      'Sri Lanka Standard Time': 'Sri Lanka',
      'Nepal Standard Time': 'Nepal',
      'Bangladesh Standard Time': 'Bangladesh',
      'Pakistan Standard Time': 'Pakistan',

      // Asia - Southeast
      'SE Asia Standard Time': 'Thailand/Vietnam/Indonesia',
      'Singapore Standard Time': 'Singapore/Malaysia/Philippines',
      'Myanmar Standard Time': 'Myanmar',

      // Asia - East
      'China Standard Time': 'China/Hong Kong',
      'Taipei Standard Time': 'Taiwan',
      'Tokyo Standard Time': 'Japan',
      'Korea Standard Time': 'South Korea',
      'North Korea Standard Time': 'North Korea',

      // Central Asia
      'Central Asia Standard Time': 'Kazakhstan',
      'West Asia Standard Time': 'Uzbekistan/Turkmenistan',
      'Ekaterinburg Standard Time': 'Russia - Ekaterinburg',
      'N. Central Asia Standard Time': 'Russia - Novosibirsk',
      'North Asia Standard Time': 'Russia - Krasnoyarsk',
      'North Asia East Standard Time': 'Russia - Irkutsk',
      'Yakutsk Standard Time': 'Russia - Yakutsk',
      'Vladivostok Standard Time': 'Russia - Vladivostok',

      // Australia & Pacific
      'AUS Eastern Standard Time': 'Australia - Sydney/Melbourne',
      'E. Australia Standard Time': 'Australia - Brisbane',
      'Cen. Australia Standard Time': 'Australia - Adelaide',
      'AUS Central Standard Time': 'Australia - Darwin',
      'W. Australia Standard Time': 'Australia - Perth',
      'Tasmania Standard Time': 'Australia - Hobart',
      'New Zealand Standard Time': 'New Zealand',
      'Fiji Standard Time': 'Fiji',
      'West Pacific Standard Time': 'Guam/Papua New Guinea',
      'Tonga Standard Time': 'Tonga',
      'Samoa Standard Time': 'Samoa',

      // Africa
      'Egypt Standard Time': 'Egypt',
      'South Africa Standard Time': 'South Africa/Zimbabwe',
      'E. Africa Standard Time': 'Kenya/Ethiopia/Tanzania',
      'W. Central Africa Standard Time': 'Nigeria/Algeria/Central Africa',
      'Morocco Standard Time': 'Morocco',

      // Default
      'UTC': 'Universal Time (UTC)',
    };

    return displayNames[windowsTimeZoneId] || windowsTimeZoneId;
  }
}
