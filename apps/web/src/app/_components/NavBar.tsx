"use client";
import { Button } from "./Button";
import { PlusIcon } from "./PlusIcon";
import { UploadIcon } from "./UploadIcon";

export const NavBar = () => {
  return (
    <nav className="flex justify-between px-8 py-2">
      <div className="flex gap-4 items-center">
        <span className="bg-blue-500 p-4 text-white font-bold rounded-lg">
          RA
        </span>
        <p>Rag Internal Assistant</p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          icon={<PlusIcon />}
          label="New Chat"
          onClick={() => alert("New Chat Clicked")}
        />
        <Button
          icon={<UploadIcon />}
          label="Upload"
          onClick={() => alert("Upload Clicked")}
        />
      </div>
    </nav>
  );
};
