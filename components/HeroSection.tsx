import Image from "next/image";
import Link from "next/link";
import HeroSteps from "./HeroSteps";

const HeroSection = () => {
  return (
    <section className="wrapper w-full">
      <div className="library-hero-card">
        <div className="library-hero-content">
          {/* Left Section: Title, Description, CTA */}
          <div className="library-hero-text">
            <div>
              <h1 className="library-hero-title">Your Book Library</h1>
              <p className="library-hero-description">
                Upload your books and start interactive conversations with them
                using AI. Transform your reading experience.
              </p>
            </div>
            <Link href="/books/new" className="library-cta-primary">
              + Add New Book
            </Link>
          </div>

          {/* Center Section: Illustration */}
          <div className="library-hero-illustration-desktop">
            <Image
              src="/assets/hero-illustration.png"
              alt="Books and Globe Illustration"
              width={300}
              height={300}
              priority
              className="w-full max-w-xs"
            />
          </div>

          {/* Mobile Illustration */}
          <div className="library-hero-illustration">
            <Image
              src="/assets/hero-illustration.png"
              alt="Books and Globe Illustration"
              width={200}
              height={200}
              priority
              className="w-full max-w-[200px]"
            />
          </div>

          {/* Right Section: Steps Card */}
          <HeroSteps />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
