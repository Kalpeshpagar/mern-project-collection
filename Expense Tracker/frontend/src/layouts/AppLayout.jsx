import Navbar from "../components/Navbar";

// Navbar should NOT be inside every page.
const AppLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default AppLayout;
