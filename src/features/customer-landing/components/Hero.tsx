import React from "react";
import HeroHeading from "./HeroHeading";
import HeroSubtext from "./HeroSubtext";
import HeroSearch from "./HeroSearch";
import ExploreEvents from "./ExploreEvents";
import BrowseVendors from "./BrowseVendors";

const Hero = () => {
  return (
    <section className="w-full px-4 pt-16 pb-10 sm:pt-20 lg:pt-24">
      <HeroHeading />
      <HeroSubtext />
      <HeroSearch />
      <ExploreEvents />
      <BrowseVendors />
    </section>
  );
};

export default Hero;
