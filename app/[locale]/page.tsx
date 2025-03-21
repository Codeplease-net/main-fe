import SpotlightPreview from "@/components/Homepage/Spotlight";
import TimeScroll from "@/components/Homepage/TimeLine";
import BottomSection from "@/components/Homepage/BottomSection";
import Footer from '@/components/footer';
import Header from "@/components/header";

export default function Home() {
  return (
    <div>
      <header>
        <title>Codeplease</title>
      </header>
      <Header/>
      <SpotlightPreview />
      <TimeScroll />
      {/* <BottomSection /> */}
      <Footer />
    </div>
  );
}
