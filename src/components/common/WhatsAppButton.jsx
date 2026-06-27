"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-lg text-2xl hover:bg-green-600 transition z-50"
      title="WhatsApp Us"
    >
      <FaWhatsapp />
    </a>
  );
}
