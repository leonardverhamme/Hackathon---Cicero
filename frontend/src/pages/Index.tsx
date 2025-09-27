import { useLocation } from "react-router-dom";
import { CiceroLayout } from "@/components/CiceroLayout";
import { Inbox } from "@/components/Inbox";
import { Bills } from "@/components/Bills";
import { MyCases } from "@/components/MyCases";

const Index = () => {
  const location = useLocation();
  
  const renderContent = () => {
    switch (location.pathname) {
      case "/bills":
        return <Bills />;
      case "/cases":
        return <MyCases />;
      default:
        return <Inbox />;
    }
  };

  return (
    <CiceroLayout>
      {renderContent()}
    </CiceroLayout>
  );
};

export default Index;
