// Static testimonials for the landing page's reviews carousel — copied
// verbatim from the v1 site's landing-page testimonials
// (v1/Eventory/src/app/(components)/trusted-reviews.tsx), which is the
// review content v1 actually displayed. Shown as-is for now, in place of
// live data from GET /customer/reviews/featured. v1 recorded no dates for
// these, so no "time ago" is shown.
export interface StaticReview {
  name: string;
  rating: number;
  quote: string;
}

export const STATIC_REVIEWS: StaticReview[] = [
  {
    name: "Ananya Malhotra",
    rating: 5,
    quote:
      "Booked Eventory for a birthday, expected basic setup. Got proper vibes instead. Sab kuch time per that, and I actually enjoyed my own party.",
  },
  {
    name: "Rohit Khanna",
    rating: 5,
    quote:
      "Our office event usually feels boring, but this one didn’t. Eventory made it feel like a celebration, not a meeting with music.",
  },
  {
    name: "Megha Jain",
    rating: 5,
    quote: "Haldi Decoration was simple, classy, and not overdone. Exactly what I wanted, no extra drama, bas sahi kaam.",
  },
  {
    name: "Suresh Verma",
    rating: 5,
    quote: "Food, timing everything was handled properly. Mujhe kuch manage nahi karna pada, which is rare.",
  },
  {
    name: "Pallavi Arora",
    rating: 5,
    quote: "The first anniversary is special, and they treated it that way. It felt personal, not like a copied event.",
  },
  {
    name: "Nitin Saxena",
    rating: 5,
    quote:
      "Parents’ anniversary function was done with a lot of care. Guests were comfortable, elders were happy, and that mattered most.",
  },
  {
    name: "Karan Mehta",
    rating: 5,
    quote: "New Year party without stress? Didn’t think it was possible. Eventory proved me wrong, full enjoyment, zero headache.",
  },
  {
    name: "Shalini Gupta",
    rating: 5,
    quote: "Family function at home usually means chaos. This time, sab kuch control mein tha and guests noticed.",
  },
  {
    name: "Amit Tandon",
    rating: 5,
    quote: "Our team celebration actually felt fun for once. People stayed back, talked, laughed—that says enough.",
  },
  {
    name: "Rina Kapoor",
    rating: 5,
    quote: "Society dandiya night was well-planned and balanced. Na zyada shor, na bore, perfect middle ground.",
  },
  {
    name: "Vikram Joshi",
    rating: 5,
    quote: "Ganpati event was peaceful and nicely arranged. Simple setup, clear sound, and good crowd handling.",
  },
  {
    name: "Neelam Chawla",
    rating: 5,
    quote: "Award night looked professional without feeling stiff. Everything moved nicely, and the energy stayed till the end.",
  },
];
