import React from "react";

const HeroHeading = () => {
  return (
    <h1 className="mx-auto max-w-[546px] text-center font-lora italic font-semibold text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.05] tracking-[-0.02em] text-brand-950">
      Less
      <span className="font-figtree not-italic font-medium">
        {" "}
        chasing vendors
      </span>
      <span className="font-figtree not-italic font-semibold">. </span>
      <span className="font-figtree not-italic font-medium">More making</span>
      <span className="font-lora italic font-medium text-[#F0596F]">
        {" "}
        memories
      </span>
      <span className="font-lora italic font-medium">.</span>
    </h1>
  );
};

export default HeroHeading;
