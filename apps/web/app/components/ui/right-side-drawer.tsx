import React, { useState } from "react";
import { Button } from "./button";

export interface RightSideDrawerProps {
  children: React.ReactNode
}

const RightSideDrawer: React.FC<RightSideDrawerProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Drawer Trigger */}
      <Button variant="outline" onClick={toggleDrawer}>Open Drawer</Button>
      {/* Drawer Background Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/80 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={toggleDrawer}
      ></div>

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-auto bg-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-4 w-full">
          {children}
        </div>
        <div className="flex px-4 justify-end">
          <Button onClick={toggleDrawer} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </>
  );
};

export default RightSideDrawer;
