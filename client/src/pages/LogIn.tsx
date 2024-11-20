import { motion } from "framer-motion";
import Footer from "../components/atoms/footer";
import GoogleLogInBtn from "../components/molecules/google-log-in-btn";

export default function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white rounded-2xl border-2 border-gray-100 shadow-lg"
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="text-center"
        >
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">Log in to your account</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full"
        >
          <GoogleLogInBtn />
        </motion.div>

        <div className="mt-4 sm:mt-6 text-center">
          <a
            href="/LogIn"
            className="text-sm text-primary hover:text-primary/80 underline"
          >
            Need help logging in?
          </a>
        </div>
      </motion.div>
      <div className="mt-8 w-full max-w-md">
        <Footer layout="column" />
      </div>
    </div>
  );
}
