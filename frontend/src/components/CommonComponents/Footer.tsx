import { motion } from "framer-motion";
import {
 
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUp,
  Heart,
} from "lucide-react";
import { Button } from "../CommonComponents/Button";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Team", href: "/team" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
    ],
    services: [
      { name: "Find Doctors", href: "/doctors" },
      { name: "Online Consultation", href: "/consult" },
      { name: "Health Packages", href: "/packages" },
      { name: "Medicine Delivery", href: "/pharmacy" },
    ],
    support: [
      { name: "FAQs", href: "/faqs" },
      { name: "Patient Guide", href: "/guide" },
      { name: "Feedback", href: "/feedback" },
      { name: "Emergency", href: "/emergency" },
    ],
  };

  const socialLinks = [
    {
      icon: Facebook,
      href: "#",
      color: "hover:text-blue-500",
      name: "Facebook",
    },
    { icon: Twitter, href: "#", color: "hover:text-sky-400", name: "Twitter" },
    {
      icon: Instagram,
      href: "#",
      color: "hover:text-pink-500",
      name: "Instagram",
    },
    {
      icon: Linkedin,
      href: "#",
      color: "hover:text-blue-400",
      name: "LinkedIn",
    },
  ];

  const stats = [
    { value: "10K+", label: "Happy Patients" },
    { value: "500+", label: "Expert Doctors" },
    { value: "24/7", label: "Support Available" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-0"
      />

      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10">
        {/* Stats Section */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-4"
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-gray-300 mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-16 border-b border-white/10"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h3
                className="text-3xl lg:text-4xl font-bold mb-4"
                whileHover={{ scale: 1.02 }}
              >
                Join Our{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Health Community
                </span>
              </motion.h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Subscribe to receive health tips, appointment reminders, and
                exclusive offers directly to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <motion.input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-medium">
                    Subscribe
                  </Button>
                </motion.div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <img
                      src="/logo.png"
                      alt="DoctorGo"
                      className="h-10 w-auto"
                    />
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                      DoctorGo
                    </span>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Revolutionizing healthcare access with cutting-edge
                    technology and compassionate care.
                  </p>
                </motion.div>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="pt-4"
                >
                  <h4 className="text-gray-300 font-medium mb-3">
                    Connect With Us
                  </h4>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        aria-label={social.name}
                        whileHover={{ y: -3, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2.5 bg-white/10 rounded-full transition-all duration-300 ${social.color}`}
                      >
                        <social.icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Links Sections */}
              {Object.entries(footerLinks).map(([category, links], index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                  className="space-y-6"
                >
                  <h4 className="text-xl font-semibold text-white capitalize">
                    {category}
                  </h4>
                  <ul className="space-y-3">
                    {links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <motion.a
                          href={link.href}
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          {link.name}
                        </motion.a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-white/10 py-8"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-center md:text-left text-sm md:text-base">
                © {new Date().getFullYear()} DoctorGo. All rights reserved.
                <span className="inline-flex items-center mx-1">
                  Made with{" "}
                  <Heart className="w-4 h-4 mx-1 text-pink-400 fill-pink-400" />{" "}
                  for better healthcare.
                </span>
              </p>

              <div className="flex items-center space-x-6">
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </a>
                <motion.button
                  onClick={scrollToTop}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                  aria-label="Back to top"
                >
                  <span className="text-sm hidden sm:inline">Back to top</span>
                  <div className="p-2 bg-white/10 rounded-full">
                    <ArrowUp className="w-4 h-4" />
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;


// import React from 'react'

// const Footer : React.FC = () => {
//   return (
//     <div>
//       <footer className="w-full bg-white mt-20 p-8 text-gray-700">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
//           {/* Brand Info */}
//           <div>
//           <div className="hidden md:block w-1/2">
//           <img
//             src='/logo.png'
//             alt="DocterGo"
//             className="max-w-full"
//           />
//           </div>
//             <p className="mt-2 text-gray-600 text-sm">
//               Your trusted healthcare partner. Connecting you to the best doctors.
//             </p>
//           </div>
//           {/* Links */}
//           <div>
//             <h4 className="font-semibold text-lg">Company</h4>
//             <ul className="mt-3 space-y-2 text-gray-600 text-sm">
//               <li className="hover:text-blue-500 cursor-pointer">Home</li>
//               <li className="hover:text-blue-500 cursor-pointer">About Us</li>
//               <li className="hover:text-blue-500 cursor-pointer">Contact Us</li>
//               <li className="hover:text-blue-500 cursor-pointer">Privacy Policy</li>
//             </ul>
//           </div>
//           {/* Contact */}
//           <div>
//             <h4 className="font-semibold text-lg">Get in Touch</h4>
//             <p className="mt-2 text-gray-600 text-sm">📞 +1-212-456-7890</p>
//             <p className="text-gray-600 text-sm">✉️ support@doctorgo.com</p>
//           </div>
//         </div>
//         <div className="mt-10 border-t border-gray-400 pt-6 text-center text-gray-600 text-sm">
//         <p>Copyright © 2025 DoctorGo - All Rights Reserved.</p>
//       </div>
//       </footer>
//     </div>
//   )
// }

// export default Footer
