import React, { useState } from "react";
import HeroSection from "../components/HeroSection";
import MenuCard from "../components/MenuCard";
import MessageBox from "../components/MessageBox";
import Biriyani from "../assets/Biriyani.png";

const sampleMenu = [
  { id: 1, name: "Seared Scallops", description: "Saffron risotto & asparagus", price: 32, img: Biriyani },
  { id: 2, name: "Pistachio Lamb", description: "Pistachio-crusted rack of lamb", price: 45, img: Biriyani},
  { id: 3, name: "Chocolate Lava", description: "Molten center with vanilla ice cream", price: 15, img: Biriyani },
];

export default function Home() {
  const [msg, setMsg] = useState("");

  return (
    <div>
      <MessageBox message={msg} />
      <HeroSection onCta={(a) => setMsg(`Action: ${a}`)} />
      <section className="py-16 bg-gray-100 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Featured Dishes</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {sampleMenu.map((m) => (
              <MenuCard key={m.id} item={m} onAdd={() => setMsg(`${m.name} added to cart`)} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
