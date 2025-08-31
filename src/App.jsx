
import { Routes, Route } from "react-router-dom";
import Splash from "./pages/Splash";
import StepOne from "./pages/Onboarding/StepOne";
import Regular from "./pages/Onboarding/Regular";
import Lagger from "./pages/Onboarding/Lagger";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/stepone" element={<StepOne />} />
      <Route path="/regular" element={<Regular />} />
      <Route path="/lagger" element={<Lagger />} />
    </Routes>
  );
}

export default App;

