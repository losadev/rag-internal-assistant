"use client";
import { Button } from "./Button";
import { PlusIcon } from "./PlusIcon";
import { UploadIcon } from "./UploadIcon";

export const NavBar = () => {
  return (
    <nav className="flex justify-between px-8 py-2 bg-white">
      <div className="flex gap-4 items-center">
        <span className="bg-blue-500 p-2 text-white font-bold rounded-lg">
          RA
        </span>
        <p className="text-black text-lg font-bold">Rag Internal Assistant</p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          icon={<PlusIcon />}
          label="New Chat"
          bgColor="white"
          txtColor="text-black"
          borderColor="border border-gray-300"
          hoverBgColor="hover:bg-gray-100"
          page="/chat"
        />
        <Button icon={<UploadIcon />} label="Upload" page="/upload" />
      </div>
    </nav>
  );
};
