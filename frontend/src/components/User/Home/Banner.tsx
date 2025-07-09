"use client"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, Users, Award, Clock } from "lucide-react"
import { assets } from "../../../assets/assets"

const Banner = () => {
  const navigate = useNavigate()

  const features = [
    { icon: CheckCircle, text: "Verified Doctors" },
    { icon: Clock, text: "24/7 Support" },
    { icon: Award, text: "Best Healthcare" },
    { icon: Users, text: "1000+ Patients" },
  ]

  return (
    <section className="py-16 lg:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-purple-800"></div>

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <motion.div
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
        ></motion.div>
        <motion.div
          animate={{
            x: [100, -100, 100],
            y: [50, -50, 50],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl"
        ></motion.div>
      </div>

      <div className="relative bg-gradient-to-r from-cyan-500 to-blue-800 rounded-2xl p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between max-w-screen-xl mx-auto shadow-2xl overflow-hidden">
        {/* Left Side - Text & Button */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-left max-w-lg text-white space-y-6 lg:space-y-8"
        >
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl font-medium opacity-90"
          >
            World-class care for everyone. Our health system offers unmatched, expert health care. From the lab to the
            clinic.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
          >
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-[length:200%_100%] bg-clip-text text-transparent"
            >
              Book Appointment
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl font-medium opacity-90"
          >
            With 100+ Trusted Doctors
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <feature.icon className="w-6 h-6 text-yellow-400" />
                <span className="font-medium text-sm lg:text-base">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group"
            >
              Create Account
              <motion.span className="ml-3 inline-block transition-transform group-hover:translate-x-1">→</motion.span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex items-center space-x-6 lg:space-x-8 pt-6"
          >
            {[
              { number: "100+", label: "Expert Doctors" },
              { number: "50+", label: "Specializations" },
              { number: "24/7", label: "Available" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-400">{stat.number}</div>
                <div className="text-blue-200 text-xs lg:text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Doctor's Image with Stunning Effects */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.8 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full lg:w-auto flex justify-end lg:self-end mt-8 lg:mt-0"
        >
          <div className="relative">
            {/* Floating Animation */}
            <motion.div
              animate={{
                y: [-20, 20, -20],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-3xl blur-2xl transform rotate-6"></div>
              <img
                src={assets.appointment_img || "/placeholder.svg"}
                alt="Doctor"
                className="relative max-w-[300px] lg:max-w-[340px] object-contain drop-shadow-2xl rounded-xl border-4 border-white/30 shadow-xl transition-transform duration-500 hover:scale-105 hover:rotate-1"
              />
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-800">Online Consultation</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl"
            >
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-800">Certified</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Banner
