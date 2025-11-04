import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "RAF",
  description: "Minimal frontend for RAF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>
        <header className="site-header">
          <div className="container">
            <Header />
          </div>
        </header>
        <main className="main">
          <div className="container">{children}</div>
        </main>
        <footer className="site-footer">
          <div className="container">
            <Footer />
          </div>
        </footer>
      </body>
    </html>
  );
}


