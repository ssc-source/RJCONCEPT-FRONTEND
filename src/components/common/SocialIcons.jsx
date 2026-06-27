"use client";

import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";

const SocialIcons = () => {
  const socialLinks = [
    {
      icon: <FaFacebookF />,
      url: "https://facebook.com/rjconcept",
      name: "Facebook",
      color: "hover:text-blue-600",
    },
    {
      icon: <FaInstagram />,
      url: "https://www.instagram.com/rj_concept_purnea/",
      name: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      icon: <FaYoutube />,
      url: "https://youtube.com/@rjconcept",
      name: "YouTube",
      color: "hover:text-red-600",
    },
    {
      icon: <FaWhatsapp />,
      url: "https://wa.me/919234829905",
      name: "WhatsApp",
      color: "hover:text-green-500",
    },
  ];

  return (
    <div className="flex items-center gap-4">
      {socialLinks.map((item, index) => (
        <a
          key={index}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-600 text-xl transition duration-300 ${item.color}`}
          aria-label={item.name}
          title={item.name}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
};

export default SocialIcons;
