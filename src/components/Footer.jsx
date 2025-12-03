import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-2xl font-bold text-white tracking-wider mb-3">
            <span className="text-yellow-600">The</span> Gilded Spoon
          </h4>
          <p className="text-sm">Where every meal is a masterpiece.</p>
        </div>

        <div>
          <h5 className="text-lg font-semibold text-yellow-600 mb-3">Contact</h5>
          <p className="text-sm">100 Elegant Way, Gastown, CA</p>
          <p className="text-sm">Phone: (555) 555-FOOD</p>
          <p className="text-sm">contact@gildedspoon.com</p>
        </div>

        <div>
          <h5 className="text-lg font-semibold text-yellow-600 mb-3">Hours</h5>
          <p className="text-sm">Dinner: Tue - Sun, 5:00 PM - 10:00 PM</p>
          <p className="text-sm">Brunch: Sat - Sun, 10:00 AM - 2:00 PM</p>
        </div>

        <div>
          <h5 className="text-lg font-semibold text-yellow-600 mb-3">Stay Connected</h5>
          <button className="w-full py-2 bg-yellow-600 text-white rounded-lg">Join Newsletter</button>
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-yellow-600">FB</a>
            <a href="#" className="hover:text-yellow-600">TW</a>
            <a href="#" className="hover:text-yellow-600">IG</a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} The Gilded Spoon. All rights reserved.
      </div>
    </footer>
  );
}
