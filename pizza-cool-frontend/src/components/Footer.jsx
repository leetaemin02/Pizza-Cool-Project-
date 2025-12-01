import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import logoImage from "../assets/logo.png";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white py-12 mt-12 shadow-inner">
      <div className="container mx-auto px-4">
        {/* Logo & Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src={logoImage}
            alt="PizzaCool Logo"
            className="h-24 w-auto object-contain drop-shadow-lg"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-5xl font-bold text-white">Pizza Cool</span>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center mb-6 text-sm md:text-base opacity-90">
          © {new Date().getFullYear()} PizzaCool — All Rights Reserved
        </p>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6 mb-6">
          {[
            { icon: <FaFacebookF />, link: "#" },
            { icon: <FaInstagram />, link: "#" },
            { icon: <FaTwitter />, link: "#" },
            { icon: <FaYoutube />, link: "#" },
          ].map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all transform hover:scale-125 text-white shadow-lg"
            >
              {React.cloneElement(item.icon, { size: 22 })}
            </a>
          ))}
        </div>

        {/* Footer Credit */}
        <p className="text-center text-xs md:text-sm opacity-80">
          Made with ❤️ by <span className="font-semibold">PizzaCool Team</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
