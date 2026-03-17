import Hero from "@/sections/Hero/Hero";
import QuickMenu from "@/sections/QuickMenu/QuickMenu";
import PromoBanner from "@/sections/PromoBanner/PromoBanner";
import MdChoice from "@/sections/MdChoice/MdChoice";
import TimeDeal from "@/sections/TimeDeal/TimeDeal";
import BestRanking from "@/sections/BestRanking/BestRanking";
import HomeStyle from "@/sections/HomeStyle/HomeStyle";
import Subscription from "@/sections/Subscription/Subscription";

function Home() {
  return (
    <>
      <Hero />
      <QuickMenu />
      <PromoBanner />
      <MdChoice />
      <TimeDeal />
      <BestRanking />
      <HomeStyle />
      <Subscription />
    </>
  );
}

export default Home;
