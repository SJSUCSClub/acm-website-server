import React from "react";
import { Link } from "@tanstack/react-router";

export interface ILinkBtnProps {
  path: string;
  pathName: string;
}

export const LinkCard: React.FC<ILinkBtnProps> = ({ path, pathName }) => (
  <Link
    to={path}
    style={{ textDecoration: "none", color: "#196096" }}
    className="text-sm font-semibold"
  >
    <div
      className={`px-4 py-2 no-underline hover:bg-[#eabc4e] transition duration-200 rounded-md`}
    >
      {pathName}
    </div>
  </Link>
);
