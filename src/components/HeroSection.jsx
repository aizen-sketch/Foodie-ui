import React from "react";
import { Utensils, CalendarDays } from "lucide-react";
import Background from "../assets/Background.png"
import special from "../assets/Special.png"
/*
  Using the uploaded image as background:
  /mnt/data/14a87007-3178-451f-b454-5ea092eaa250.png
*/

export default function HeroSection({ onCta = () => {} }) {
  return (
    <section className="relative h-screen flex items-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${Background})`
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="text-white max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Experience Culinary <span className="text-yellow-400">Excellence</span>
          </h1>
          <p className="mt-6 text-lg text-gray-200">
            A symphony of flavor and elegance in the heart of the city.
          </p>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => onCta("view-menu")}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-black rounded-lg font-semibold hover:bg-yellow-700 transition"
            >
              <Utensils /> View Menu
            </button>

            <button
              onClick={() => onCta("reserve")}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <CalendarDays className="text-yellow-600" /> Reserve a Table
            </button>
          </div>
        </div>

        {/* Right visual (small card) */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
            <img
              src={special}
              alt="Chef and dish"
              className="w-full h-72 object-cover rounded-xl"
            />
            <div className="mt-4">
              <h4 className="text-xl font-semibold">Chef's Special — Sunday Roast</h4>
              <p className="text-sm text-gray-200 mt-1">A seasonal roast with truffle jus and roasted vegetables.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
