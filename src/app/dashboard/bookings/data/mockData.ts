import { EnquiryData } from '../components/EnquiryCard';

// Shared mock types
export interface DetailedEnquiry extends EnquiryData {
  venueName?: string;
  guestCountMax?: number;
  guestCountStr?: string;
  expectedBudgetStr?: string;
  customerMessage?: string;
  questionnaire?: { question: string; answer: string }[];
  primaryPackage?: { name: string; price: number; image: string };
  detailedRequests?: {
    category: string;
    title: string;
    fields?: { label: string; value: string }[];
    sections?: {
      dividerText?: string;
      title?: string;
      subtitle?: string;
      subtitleLabel?: string;
      fields: { label: string; value: string }[];
    }[];
  }[];
  customiseData?: {
    additionsTitle?: string;
    additions: { id: string; label: string; value: string; status: 'pending' | 'accepted' | 'rejected'; image?: string }[];
    groupedAdditions?: {
      dividerText?: string;
      title?: string;
      subtitle?: string;
      items: { id: string; label: string; value: string; status: 'pending' | 'accepted' | 'rejected'; hasColorPicker?: boolean }[];
    }[];
    exclusionsTitle?: string;
    exclusions: { id: string; label: string; value: string; status: 'pending' | 'accepted' | 'rejected'; image?: string }[];
    groupedExclusions?: {
      dividerText?: string;
      title?: string;
      subtitle?: string;
      items: { id: string; label: string; value: string; status: 'pending' | 'accepted' | 'rejected'; suggestedSubstitute?: string }[];
    }[];
    equipments?: { id: string; name: string; desc: string; qty: number; image: string }[];
    addons?: { id: string; name: string; desc: string; price: number; image: string; fields?: { label: string; value: string }[] }[];
  };
  attachments?: { url: string; name: string }[];
  eventImageUrl?: string;
}

export const DUMMY_BOOKINGS = [
  {
    _id: 'd1', bookingId: 'EVT-DUMMY-001',
    customer: { name: 'Rahul Sharma', phone: '9876543210' },
    eventType: 'Corporate Party',
    eventDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    startTime: '16:00', endTime: '20:00',
    packageSnapshot: { name: 'Corporate Premium Package', price: 25000, variantType: 'Premium' },
    paymentType: 'FreeBooking' as const, status: 'Pending' as const,
    totalAmount: 25000, totalReceived: 0, conflictDetected: true,
  },
  {
    _id: 'd2', bookingId: 'EVT-DUMMY-002',
    customer: { name: 'Rahul Sharma', phone: '9876543210' },
    eventType: 'Corporate Party',
    eventDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    startTime: '16:00', endTime: '20:00',
    packageSnapshot: { name: 'Corporate Premium Package', price: 25000, variantType: 'Premium' },
    paymentType: 'AdvancePaid' as const, status: 'Accepted' as const,
    totalAmount: 25000, totalReceived: 10000, conflictDetected: false,
  },
  {
    _id: 'd3', bookingId: 'EVT-DUMMY-003',
    customer: { name: 'Priya Mehta', phone: '9123456789' },
    eventType: 'Wedding',
    eventDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    startTime: '11:00', endTime: '22:00',
    packageSnapshot: { name: 'Royal Wedding Package', price: 85000, variantType: 'Deluxe' },
    paymentType: 'FullPaid' as const, status: 'Completed' as const,
    totalAmount: 85000, totalReceived: 85000, conflictDetected: false,
  },
  {
    _id: 'd4', bookingId: 'EVT-DUMMY-004',
    customer: { name: 'Arjun Singh', phone: '9988776655' },
    eventType: 'Birthday Party',
    eventDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    startTime: '18:00', endTime: '22:00',
    packageSnapshot: { name: 'Party Starter Package', price: 15000, variantType: 'Standard' },
    paymentType: 'FreeBooking' as const, status: 'Pending' as const,
    totalAmount: 15000, totalReceived: 0, conflictDetected: false,
  },
];

export const DUMMY_ENQUIRIES: DetailedEnquiry[] = [
  // 1. Makeup Artist Enquiry
  {
    _id: 'enq-makeup-001',
    enquiryId: 'EVT-ENQ-M001',
    customer: { name: 'Sneha Kapoor' },
    eventType: 'Wedding',
    eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    startTime: '16:00', endTime: '20:00',
    budgetMin: 35000, budgetMax: 50000,
    matchStrength: 'Strong',
    requests: ['Bridal HD Makeup', 'Silk Press & Style', 'Facial'],
    status: 'NewEnquiry',
    receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    venueName: 'Taj Palace, New Delhi',
    guestCountMax: 5, // guests needing makeup
    expectedBudgetStr: '₹35,000 - ₹50,000',
    questionnaire: [
      { question: 'What feels overpriced in the package', answer: 'The styling add-on feels too expensive for what\'s included' },
      { question: 'Would prefer a lower-cost package with fewer inclusions', answer: 'Yes' },
      { question: 'Comparing with another quote?', answer: 'Yes, has a quote from another vendor' },
      { question: 'Message from customer', answer: '"Looking for elegant bridal makeup that lasts through the evening."' }
    ],
    primaryPackage: {
      name: 'Bridal Premium Package',
      price: 45000,
      image: 'https://loremflickr.com/200/200/party'
    },
    detailedRequests: [
      {
        category: '💄 MAKEUP', title: 'BRIDAL HD MAKEUP',
        fields: [{ label: 'Brand', value: 'MAC' }, { label: 'Look', value: 'Natural, Dewy' }, { label: 'Airbrush', value: 'Yes' }]
      },
      {
        category: '💇‍♀️ HAIR', title: 'BRIDAL HAIR STYLING',
        fields: [{ label: 'Style', value: 'Messy Bun with flowers' }, { label: 'Extensions', value: 'Yes' }]
      },
      {
        category: '💆‍♀️ SKIN & SPA', title: 'BRIDAL GLOW FACIAL',
        fields: [{ label: 'Skin Type', value: 'Sensitive' }, { label: 'Duration', value: '60 mins' }]
      }
    ],
    customiseData: {
      additions: [
        { id: '1', label: 'Brand', value: 'MAC', status: 'accepted' },
        { id: '2', label: 'Hair Color', value: 'Natural Brown', status: 'accepted' },
        { id: '3', label: 'Styling', value: 'Open Curls', status: 'rejected' },
      ],
      exclusions: [
        { id: '4', label: 'Hair Service Type', value: 'Updo', status: 'rejected' },
      ],
      addons: []
    },
    attachments: [
      { url: 'https://loremflickr.com/300/300/makeup', name: 'Makeup_Ref.jpg' },
      { url: 'https://loremflickr.com/300/300/hair', name: 'Hair_Style.png' },
      { url: 'https://loremflickr.com/300/300/fashion', name: 'Lookbook.pdf' }
    ],
    eventImageUrl: 'https://loremflickr.com/800/400/party'
  },
  // 2. DJ Artist Enquiry
  {
    _id: 'enq-dj-002',
    enquiryId: 'EVT-ENQ-D002',
    customer: { name: 'Rahul Sharma' },
    eventType: 'Corporate Party',
    eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    startTime: '19:00', endTime: '23:30',
    budgetMin: 15000, budgetMax: 25000,
    matchStrength: 'Good',
    requests: ['DJ Performance', 'Sound System', 'Lighting'],
    status: 'AwaitingResponse',
    receivedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    venueName: 'Grand Hyatt Ballroom',
    guestCountStr: '80 - 250',
    expectedBudgetStr: '₹15,000 - ₹25,000',
    questionnaire: [
      { question: 'What genre of music is preferred?', answer: 'Commercial Hits, Bollywood, Tech House' },
      { question: 'Any special announcements required?', answer: 'Yes, need MC services for awards distribution.' }
    ],
    primaryPackage: {
      name: 'Corporate DJ + Sound Package',
      price: 20000,
      image: 'https://loremflickr.com/200/200/party'
    },
    detailedRequests: [
      {
        category: '🕹️ DJ Artist', title: 'ITEM NAME',
        fields: [{ label: 'Music Language', value: 'Hindi' }, { label: 'Music Genre', value: 'Punjabi' }]
      }
    ],
    customiseData: {
      additionsTitle: 'NAME OF ITEM',
      additions: [
        { id: 'dj-1', label: 'Performance Type', value: 'Instrumental', status: 'accepted' },
        { id: 'dj-2', label: 'Music Genere', value: 'Tollywood', status: 'rejected' },
        { id: 'dj-3', label: 'Music Language', value: 'Malyalam', status: 'accepted' }
      ],
      exclusionsTitle: 'NAME OF ITEM',
      exclusions: [
        { id: 'dj-4', label: 'Equipment', value: 'Sound Wave', status: 'accepted' },
        { id: 'dj-5', label: 'Equipment', value: 'LED Lights', status: 'rejected' }
      ],
      equipments: [
        { id: 'eq-1', name: 'Sound Box', desc: 'Mini/Medium', qty: 3, image: 'https://loremflickr.com/100/100/audio' }
      ],
      addons: [
        { id: 'ad-1', name: 'Add-on Name', desc: 'Product/Category', price: 2000, image: 'https://loremflickr.com/100/100/dj' }
      ]
    },
    attachments: [
      { url: 'https://loremflickr.com/300/300/dj', name: 'Stage_Ref.jpg' },
      { url: 'https://loremflickr.com/300/300/party', name: 'Venue_Layout.png' },
      { url: 'https://loremflickr.com/300/300/music', name: 'Setlist.pdf' }
    ],
    eventImageUrl: 'https://loremflickr.com/800/400/party'
  },
  // 3. Decorator Enquiry
  {
    _id: 'enq-dec-003',
    enquiryId: 'EVT-ENQ-DEC003',
    customer: { name: 'Anita Desai' },
    eventType: 'Engagement',
    eventDate: new Date(Date.now() + 86400000 * 20).toISOString(),
    startTime: '10:00', endTime: '16:00',
    budgetMin: 50000, budgetMax: 80000,
    matchStrength: 'Strong',
    requests: ['Floral Stage', 'Photo Booth', 'Entrance Arch'],
    status: 'ProposalSent',
    receivedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    venueName: 'ITC Gardenia, Bangalore',
    guestCountMax: 200,
    expectedBudgetStr: '₹50,000 - ₹80,000',
    questionnaire: [
      { question: 'Theme preferences?', answer: 'Pastel colors, English Garden theme.' },
      { question: 'Message from customer', answer: '"We love fresh flowers, especially peonies and hydrangeas."' }
    ],
    primaryPackage: {
      name: 'Premium Floral Decor',
      price: 65000,
      image: 'https://loremflickr.com/200/200/party'
    },
    detailedRequests: [
      {
        category: 'STAGE', title: 'FLORAL BACKDROP',
        fields: [{ label: 'Dimensions', value: '20ft x 10ft' }, { label: 'Primary Flowers', value: 'Roses, Orchids' }]
      },
      {
        category: 'EXTRAS', title: 'PHOTO BOOTH',
        fields: [{ label: 'Style', value: 'Neon Sign + Floral' }, { label: 'Props', value: 'Included' }]
      }
    ],
    attachments: [
      { url: 'https://loremflickr.com/200/200/party', name: 'Stage_Ref.jpg' }
    ],
    eventImageUrl: 'https://loremflickr.com/800/400/party'
  },
  // 4. Caterer Enquiry
  {
    _id: 'enq-cat-004',
    enquiryId: 'EVT-ENQ-CAT004',
    customer: { name: 'Vikram Singh' },
    eventType: 'Anniversary',
    eventDate: new Date(Date.now() + 86400000 * 12).toISOString(),
    startTime: '20:00', endTime: '23:30',
    budgetMin: 80000, budgetMax: 120000,
    matchStrength: 'Good',
    requests: ['Live Counters', 'Continental Buffet', 'Dessert Bar'],
    status: 'Converted',
    receivedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    venueName: 'Private Farmhouse, Chattarpur',
    guestCountMax: 80,
    expectedBudgetStr: '₹80,000 - ₹1,20,000',
    questionnaire: [
      { question: 'Dietary requirements?', answer: 'Need 100% vegetarian section, plus some vegan options.' },
      { question: 'Service style?', answer: 'Buffet with waiters circulating starters.' }
    ],
    primaryPackage: {
      name: 'Luxury Continental Spread',
      price: 1500, // per plate
      image: 'https://loremflickr.com/200/200/party'
    },
    detailedRequests: [
      {
        category: 'FOOD', title: 'CONTINENTAL BUFFET',
        fields: [{ label: 'Cuisine', value: 'Italian, Mexican' }, { label: 'Dishes', value: '8 Mains, 4 Salads' }]
      },
      {
        category: 'LIVE COUNTERS', title: 'PASTA & CHAAT',
        fields: [{ label: 'Pasta', value: 'Penne, Spaghetti' }, { label: 'Chaat', value: 'Pani Puri, Tikki' }]
      }
    ],
    attachments: [],
    eventImageUrl: 'https://loremflickr.com/800/400/party'
  },
  // 5. PAV (Photo and Video) Enquiry
  {
    _id: 'enq-pav-005',
    enquiryId: 'EVT-ENQ-PAV005',
    customer: { name: 'Neha Gupta' },
    eventType: 'Corporate Event',
    eventDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    startTime: '10:00', endTime: '18:00',
    budgetMin: 35000, budgetMax: 50000,
    matchStrength: 'Strong',
    requests: ['Photography', 'Videography'],
    status: 'NewEnquiry',
    receivedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    venueName: 'Taj Lands End',
    expectedBudgetStr: '₹35,000 - ₹50,000',
    primaryPackage: {
      name: 'Corporate Premium Package',
      price: 25000,
      image: 'https://loremflickr.com/200/200/camera'
    },
    detailedRequests: [],
    customiseData: {
      additions: [
        { id: 'pav-1', label: 'Delivery Medium', value: 'Printed Photos', status: 'accepted', image: 'https://loremflickr.com/100/100/camera' },
        { id: 'pav-2', label: 'Videography Style', value: 'Slow Motion', status: 'accepted', image: 'https://loremflickr.com/100/100/camera' }
      ],
      exclusions: [
        { id: 'pav-3', label: 'Item', value: 'Album', status: 'accepted', image: 'https://loremflickr.com/100/100/camera' }
      ],
      addons: [
        { id: 'ad-pav-1', name: 'Drone Coverage', desc: 'Add-on Name', price: 2000, image: 'https://loremflickr.com/100/100/drone' },
        { 
          id: 'ad-pav-2', 
          name: 'VIDEO PRODUCT', 
          desc: 'Add-on Name', 
          price: 2000, 
          image: 'https://loremflickr.com/100/100/videocamera',
          fields: [
            { label: 'Video Type', value: 'Reels' },
            { label: 'File Format', value: '200+' },
            { label: 'Resolution', value: 'MP4' },
            { label: 'Duration', value: 'USB Drive' }
          ]
        }
      ]
    },
    attachments: [
      { url: 'https://loremflickr.com/300/300/stage', name: 'Stage_Ref.jpg' },
      { url: 'https://loremflickr.com/300/300/venue', name: 'Venue_Layout.png' }
    ],
    eventImageUrl: 'https://loremflickr.com/800/400/event'
  }
];
