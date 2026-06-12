export interface FormData {
    businessName: string;
    isIndividual: boolean;
    pocName: string;
    email: string;
    teamSize: string;
    bookingsPerYear: string;
    experience: string;
    vendorType: string;
    categories: string[];
    city: string;
    serviceAreas: string[];
    profilePicture: string;
    description: string;
    businessPhotos: string[];
    coverImage: string;
}

export const INITIAL_FORM_DATA: FormData = {
    businessName: '',
    isIndividual: false,
    pocName: '',
    email: '',
    teamSize: '',
    bookingsPerYear: '',
    experience: '',
    vendorType: '',
    categories: [],
    city: '',
    serviceAreas: [],
    profilePicture: '',
    description: '',
    businessPhotos: [],
    coverImage: '',
};

export const TEAM_SIZE_OPTIONS = [
    '1 - 5 people', '6 - 15 people', '16 - 30 people', '31 - 50 people', '50+ people',
];

export const BOOKINGS_OPTIONS = [
    '0 - 24 bookings/year', '25 - 49 bookings/year', '50 - 74 bookings/year',
    '75 - 99 bookings/year', '100+ bookings/year',
];

export const EXPERIENCE_OPTIONS = [
    '0 - 2 years', '2 - 5 years', '5 - 8 years', '8 - 12 years', '12+ years',
];

export const VENDOR_TYPES = [
    'Caterer', 'Decorator', 'DJ Artist', 'Makeup Artist',
    'Photography and Videography', 'Venue Provider',
];

export const EVENT_CATEGORIES = [
    'Wedding', 'Corporate', 'Haldi', 'Birthday', 'Conference',
    'Workshop', 'Exhibition', 'Engagement', 'Anniversary',
];

export const CITY_LOCALITIES: Record<string, string[]> = {
    Ghaziabad: ['Indirapuram', 'Vasundhara', 'Vaishali'],
    Delhi: ['Connaught Place', 'South Delhi', 'North Delhi', 'Dwarka', 'Saket'],
    Gurugram: ['DLF Phase 1', 'Sushant Lok', 'Golf Course Road', 'Sector 56'],
    Moradabad: ['Civil Lines', 'Ramganga Vihar', 'Kanth Road'],
    Meerut: ['Shastri Nagar', 'Modipuram', 'Pallavpuram'],
    Noida: ['Sector 18', 'Sector 62', 'Noida Extension', 'Sector 15'],
};

export const AVATARS = ['/images/male-avatar.png', '/images/female-avatar.png'];

export const CONTINUE_BUTTON_COLOR = 'rgba(4, 34, 45, 1)';
