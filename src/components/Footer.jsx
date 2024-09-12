const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="hidden lg:block fixed bottom-0 left-0 w-full border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-center py-2">
      <p className="text-sm text-gray-300">© {currentYear} Consultorio Goya</p>
    </footer>
  );
};

export default Footer;
