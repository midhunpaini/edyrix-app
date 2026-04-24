import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen bg-bg">
        <main className="pb-20">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
