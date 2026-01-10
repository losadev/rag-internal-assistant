"use client";
import Link from "next/link";
import { Button } from "./Button";
import { PlusIcon } from "./PlusIcon";
import { UploadIcon } from "./UploadIcon";

export const NavBar = () => {
  return (
    <nav className="flex justify-between px-8 py-2 bg-card border-b border-app items-center">
      <div className="flex gap-4 items-center">
        <Link href="/" passHref>
          <span className="bg-primary p-2 text-white font-bold rounded-lg">
            RA
          </span>
        </Link>
        <p className="text-app text-lg font-bold hidden md:inline">
          Rag Internal Assistant
        </p>
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
